import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { GoogleGenAI, Type } from '@google/genai';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Loader2, Upload, FileText, Youtube, Play, AlertCircle, Image } from 'lucide-react';

// Set worker source for pdfjs
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function ProfessorPortal() {
  const navigate = useNavigate();
  const { setCaseData } = useCase();
  
  const [file, setFile] = useState<File | null>(null);
  const [externalFiles, setExternalFiles] = useState<File[]>([]);
  const [customLinks, setCustomLinks] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleExternalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setExternalFiles(Array.from(e.target.files));
    }
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  };

  const processCaseWithAI = async (text: string, links: string) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API Key not found');

    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are an expert case study architect. I have a raw text from a case study PDF.
      Your task is to structure this content into the "IEC 3-Part Structure" (Part A, Part B, Part C).
      
      The structure should be:
      - Title: A catchy title for the case study.
      - Intro: A brief introduction to the case (2-3 paragraphs).
      - Part A: The beginning, setting the scene, the challenge.
      - Part B: The middle, reflection, deepening the context.
      - Part C: The conclusion, changes, future outlook.

      If the text doesn't explicitly have these parts, logically segment it.
      
      Return the result as a JSON object with this schema:
      {
        "title": "string",
        "introText": "string",
        "parts": [
          { "id": "partA", "title": "string", "content": "string (markdown supported)" },
          { "id": "partB", "title": "string", "content": "string (markdown supported)" },
          { "id": "partC", "title": "string", "content": "string (markdown supported)" }
        ]
      }

      Here is the text:
      ${text.substring(0, 30000)} // Limit text to avoid token limits if necessary, though Gemini 1.5 Flash has large context.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            introText: { type: Type.STRING },
            parts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ['id', 'title', 'content'],
              },
            },
          },
          required: ['title', 'introText', 'parts'],
        },
      },
    });

    return JSON.parse(response.text);
  };

  const handlePreview = async () => {
    if (!file) {
      setError('Please upload a PDF file first.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Extracting text from PDF...');
    setError(null);

    try {
      // 1. Extract Text
      const text = await extractTextFromPdf(file);
      
      // 2. Process with AI
      setStatusMessage('Analyzing content with Gemini AI (Architect Mode)...');
      const aiResult = await processCaseWithAI(text, customLinks);

      // 3. Parse Links
      const resources = customLinks.split('\n').filter(l => l.trim()).map((link, idx) => ({
        title: `Custom Resource ${idx + 1}`,
        url: link.trim(),
        phases: ['partA', 'partB', 'partC'] // Available in all phases for now
      }));

      // 4. Process External Files (Diagrams/Images)
      setStatusMessage('Processing external diagrams/images...');
      const exhibits = await Promise.all(externalFiles.map(async (f) => {
        return new Promise<{ title: string; imageUrl: string; description: string }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              title: f.name,
              imageUrl: reader.result as string,
              description: 'Uploaded diagram or external information'
            });
          };
          reader.readAsDataURL(f);
        });
      }));

      const newCaseData = {
        title: aiResult.title || 'Custom Case Study',
        introText: aiResult.introText || 'Welcome to this custom case study.',
        isCustom: true,
        parts: aiResult.parts,
        exhibits: exhibits,
        resources: resources.length > 0 ? resources : []
      };

      // 5. Generate Initial Questions for Review Mode
      setStatusMessage('Generating initial questions for Review Mode...');
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('Gemini API Key not found');
      const ai = new GoogleGenAI({ apiKey });
      
      const qPrompt = `
        You are the IEC Case Engine. Generate 5 multiple-choice questions for the first part of this case study.
        Discipline: General Business
        Part Context: ${newCaseData.parts[0]?.content || newCaseData.introText}
        
        Return ONLY a JSON array of 5 objects with this schema:
        [
          {
            "question": "string",
            "options": ["string", "string", "string", "string"],
            "correctAnswerIndex": number (0-3),
            "explanation": "string"
          }
        ]
      `;

      const qResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: qPrompt,
        config: { responseMimeType: 'application/json' }
      });

      const generatedQuestions = JSON.parse(qResponse.text);

      // 5. Navigate to Question Editor Sandbox
      navigate('/question-editor', { 
        state: { 
          caseData: newCaseData,
          generatedQuestions 
        } 
      });
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process case study.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-2 border-black relative">
        <div className="flex justify-center mb-8">
          <Link 
            to="/" 
            className="inline-block bg-[#060644] p-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <img 
              src="https://images.squarespace-cdn.com/content/v1/6255bbe95bb22967d455a499/edd00340-64eb-41a9-ac93-48c138feec23/Institute+for+Entrepreneurial+Communities+%281%29.png?format=1500w" 
              alt="Institute for Entrepreneurial Communities" 
              className="h-16 w-auto object-contain"
            />
          </Link>
        </div>

        <h1 className="text-4xl font-display font-bold text-black mb-8 uppercase tracking-tighter flex items-center justify-center gap-4">
          <FileText className="w-10 h-10" />
          Professor Portal
        </h1>

        <div className="space-y-8">
          {/* File Upload */}
          <div>
            <label className="block text-xl font-bold mb-4 uppercase">1. Upload Case Study PDF</label>
            <div className="border-2 border-dashed border-black p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="font-bold text-lg">{file ? file.name : 'Drag & drop or click to upload'}</p>
              <p className="text-sm text-gray-500 mt-2">PDF files only</p>
            </div>
          </div>

          {/* Links Input */}
          <div>
            <label className="block text-xl font-bold mb-4 uppercase">2. Add Multimedia Links</label>
            <div className="relative">
              <Youtube className="absolute top-3 left-3 w-6 h-6 text-gray-400" />
              <textarea
                value={customLinks}
                onChange={(e) => setCustomLinks(e.target.value)}
                placeholder="Paste YouTube or Audio links here (one per line)..."
                className="w-full p-4 pl-12 border-2 border-black font-mono h-32 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          </div>

          {/* External Files Input */}
          <div>
            <label className="block text-xl font-bold mb-4 uppercase">3. Upload Diagrams / External Info</label>
            <div className="border-2 border-dashed border-black p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleExternalFilesChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Image className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="font-bold text-lg">
                {externalFiles.length > 0 
                  ? `${externalFiles.length} file(s) selected` 
                  : 'Drag & drop or click to upload images'}
              </p>
              <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-4 font-bold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handlePreview}
            disabled={isProcessing}
            className={`w-full py-4 px-8 bg-black text-white text-xl font-bold uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3 ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                {statusMessage}
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current" />
                Preview as Student
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AlertCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
  );
}
