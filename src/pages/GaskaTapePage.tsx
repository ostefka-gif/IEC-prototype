import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Youtube, ArrowLeft, ArrowRight, AlertCircle, Loader2, CheckCircle2, Lock, FileText } from 'lucide-react';
import Header from '../components/Header';
import GaskaFinancialChart from '../components/GaskaFinancialChart';
import GaskaDisciplineTools from '../components/GaskaDisciplineTools';
import LeadershipProfile from '../components/LeadershipProfile';
import ThankYouPage from '../components/ThankYouPage';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { useCase } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const disciplines = [
  'Marketing', 'Small Business', 'Entrepreneurship', 'Creativity & Innovation', 
  'Business Ethics', 'Family Business', 'Operations', 'Finance', 
  'Leadership', 'Organizational Behavior'
];

interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

interface PhaseState {
  questions: Question[];
  selectedOptions: (number | null)[];
  isUnlocked: boolean;
  correctCount: number;
  incorrectCount: number;
}

interface SavedSession {
  discipline: string;
  currentPhaseIndex: number;
  phaseHistory: Record<number, PhaseState>;
  questions: Question[];
  selectedOptions: (number | null)[];
  isUnlocked: boolean;
  correctCount: number;
  incorrectCount: number;
}

export default function GaskaTapePage() {
  const { caseData } = useCase();
  const { parts: caseParts, exhibits: caseExhibits, resources: caseResources } = caseData;
  const { user } = useAuth();

  const [showIntro, setShowIntro] = useState(true);
  const [showThankYou, setShowThankYou] = useState(false);
  const [discipline, setDiscipline] = useState<string | null>(null);
  const [studentPasscode, setStudentPasscode] = useState('');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseHistory, setPhaseHistory] = useState<Record<number, PhaseState>>({});
  
  const [completedModules, setCompletedModules] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('completedModules');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [moduleScores, setModuleScores] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('moduleScores');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('completedModules', JSON.stringify(Array.from(completedModules)));
  }, [completedModules]);

  useEffect(() => {
    localStorage.setItem('moduleScores', JSON.stringify(moduleScores));
  }, [moduleScores]);

  // Current phase derived state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<(number | null)[]>([null, null, null, null, null]);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [replacingIndices, setReplacingIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const saveToFirestore = async () => {
      if (!user || !discipline) return;
      
      const sessionId = `${user.uid}_gaska-tape_${discipline}`;
      const sessionRef = doc(db, 'student_sessions', sessionId);
      
      // Calculate part scores and incorrect counts for this discipline
      const partScores: Record<string, number> = {};
      const partIncorrectCount: Record<string, number> = {};
      let completedParts = 0;
      
      caseParts.forEach((part, index) => {
        const moduleId = `${discipline}-${part.id}`;
        if (completedModules.has(moduleId)) {
          partScores[part.id] = moduleScores[moduleId] || 0;
          completedParts++;
        }
        if (phaseHistory[index]) {
          partIncorrectCount[part.id] = phaseHistory[index].incorrectCount;
        } else if (index === currentPhaseIndex) {
          partIncorrectCount[part.id] = incorrectCount;
        }
      });

      try {
        const docSnap = await getDoc(sessionRef);
        let startedAt = new Date().toISOString();
        if (docSnap.exists() && docSnap.data().startedAt) {
          startedAt = docSnap.data().startedAt;
        }

        await setDoc(sessionRef, {
          userId: user.uid,
          caseId: 'gaska-tape',
          discipline: discipline,
          passcode: studentPasscode,
          partScores,
          partIncorrectCount,
          completedParts,
          isComplete: completedParts === caseParts.length,
          startedAt: startedAt,
          lastUpdatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `student_sessions/${sessionId}`);
      }
    };

    saveToFirestore();
  }, [completedModules, moduleScores, user, discipline, caseParts, phaseHistory, currentPhaseIndex, incorrectCount]);
  
  const [savedSession, setSavedSession] = useState<SavedSession | null>(() => {
    const saved = localStorage.getItem('activeSession');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (discipline) {
      const sessionData: SavedSession = {
        discipline,
        currentPhaseIndex,
        phaseHistory,
        questions,
        selectedOptions,
        isUnlocked,
        correctCount,
        incorrectCount
      };
      localStorage.setItem('activeSession', JSON.stringify(sessionData));
      setSavedSession(sessionData);
    }
  }, [discipline, currentPhaseIndex, phaseHistory, questions, selectedOptions, isUnlocked, correctCount, incorrectCount]);

  const handleResumeSession = () => {
    if (savedSession) {
      setDiscipline(savedSession.discipline);
      setCurrentPhaseIndex(savedSession.currentPhaseIndex);
      setPhaseHistory(savedSession.phaseHistory);
      setQuestions(savedSession.questions);
      setSelectedOptions(savedSession.selectedOptions);
      setIsUnlocked(savedSession.isUnlocked);
      setCorrectCount(savedSession.correctCount);
      setIncorrectCount(savedSession.incorrectCount);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [adminCode, setAdminCode] = useState('');

  const currentPhase = caseParts[currentPhaseIndex];

  // Calculate scores derived from completed modules
  const disciplineScores: Record<string, number> = {};
  disciplines.forEach(d => {
    let score = 0;
    caseParts.forEach(part => {
      const moduleId = `${d}-${part.id}`;
      if (completedModules.has(moduleId)) {
        score += moduleScores[moduleId] || 0;
      }
    });
    const maxScore = caseParts.length * 5;
    if (maxScore > 0) {
      disciplineScores[d] = Math.round((score / maxScore) * 100);
    } else {
      disciplineScores[d] = 0;
    }
  });

  const fetchQuestions = useCallback(async (phaseId: string, disc: string, index: number) => {
    // Check if we already have this phase in history
    if (phaseHistory[index]) {
      const history = phaseHistory[index];
      setQuestions(history.questions);
      setSelectedOptions(history.selectedOptions);
      setIsUnlocked(history.isUnlocked);
      setCorrectCount(history.correctCount || 0);
      setIncorrectCount(history.incorrectCount || 0);
      return;
    }

    setIsLoading(true);
    setFeedback(null);
    setCorrectCount(0);
    setIncorrectCount(0);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is not configured in the environment.');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const part = caseParts.find(p => p.id === phaseId);
      const phaseContext = part ? `${part.title}. ${part.content.substring(0, 1500)}` : '';

      const prompt = `
        You are the IEC Case Engine. Generate 5 multiple-choice questions (MCQs) for a business student studying this case study.
        These questions should reflect "Teaching Notes" style—focusing on core pedagogical concepts, strategic dilemmas, and discipline-specific theories.
        
        Current Part Content: ${phaseContext}
        Selected Discipline: ${disc}
        
        CRITICAL: All 5 questions MUST be framed strictly through the lens of the ${disc} discipline.
        
        Return ONLY a JSON array of 5 objects. Each object must have:
        - "question": string
        - "options": string array (exactly 4 options)
        - "correctAnswerIndex": number (0-3)
        - "explanation": string (A brief pedagogical explanation for the teacher to use during elaboration)
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ parts: [{ text: prompt }] }],
        config: { 
          responseMimeType: 'application/json',
        }
      });

      const text = result.text;
      if (!text) throw new Error('Empty AI response');
      
      const generatedQuestions = JSON.parse(text);
      
      if (Array.isArray(generatedQuestions) && generatedQuestions.length >= 5) {
        setQuestions(generatedQuestions.slice(0, 5));
        setSelectedOptions([null, null, null, null, null]);
        setIsUnlocked(false);
      } else {
        throw new Error('Invalid question format received');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Fallback MCQs if AI fails
      const fallbacks = Array(5).fill(null).map((_, i) => ({
        question: `[Pedagogical Analysis] How does the situation in ${phaseId} challenge traditional ${disc} frameworks?`,
        options: [
          "By introducing conflicting family and business objectives",
          "By requiring immediate liquidation of assets",
          "By eliminating the need for strategic planning",
          "By focusing solely on short-term profitability"
        ],
        correctAnswerIndex: 0,
        explanation: "In family businesses, the intersection of emotional systems and rational business systems often creates unique challenges for standard discipline-specific strategies."
      }));
      setQuestions(fallbacks);
      setSelectedOptions([null, null, null, null, null]);
      setIsUnlocked(false);
    } finally {
      setIsLoading(false);
    }
  }, [phaseHistory]);

  const handleDisciplineSelect = (disc: string) => {
    setDiscipline(disc);
    setCurrentPhaseIndex(0);
    setPhaseHistory({});
    setQuestions([]);
    setSelectedOptions([null, null, null, null, null]);
    setIsUnlocked(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    fetchQuestions(caseParts[0].id, disc, 0);
  };

  const replaceQuestion = async (index: number) => {
    setReplacingIndices(prev => new Set(prev).add(index));
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return;

      const ai = new GoogleGenAI({ apiKey });
      const phaseId = caseParts[currentPhaseIndex].id;
      const oldQuestion = questions[index];
      
      const phaseContext = caseParts[currentPhaseIndex].title;

      const prompt = `
        You are the IEC Case Engine. The student answered a question incorrectly.
        Your task is to generate a RE-WORDED version of the same question to give them another chance to demonstrate understanding of the same concept.
        
        Original Question: "${oldQuestion.question}"
        Original Explanation: "${oldQuestion.explanation}"
        
        Current Part: ${phaseContext}
        Selected Discipline: ${discipline}
        
        Instructions:
        1. Keep the SAME learning objective and core concept.
        2. Rephrase the scenario or the question stem so it feels fresh but tests the exact same knowledge.
        3. Provide 4 options (1 correct, 3 distractors).
        4. The explanation should reinforce why the correct answer is right, referencing the concept.

        Return ONLY a JSON object with:
        - "question": string
        - "options": string array (exactly 4 options)
        - "correctAnswerIndex": number (0-3)
        - "explanation": string
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
      });

      const newQ = JSON.parse(result.text);
      setQuestions(prev => {
        const next = [...prev];
        next[index] = newQ;
        return next;
      });
      setSelectedOptions(prev => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
    } catch (error) {
      console.error('Error replacing question:', error);
    } finally {
      setReplacingIndices(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const [jackFeedback, setJackFeedback] = useState<string | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

  const generateJackFeedback = async () => {
    setIsGeneratingFeedback(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return;

      const ai = new GoogleGenAI({ apiKey });
      const phaseId = caseParts[currentPhaseIndex].id;
      
      const phaseContext = caseParts[currentPhaseIndex].title;

      const prompt = caseData.isCustom ? `
        You are the protagonist or a key figure in the case study "${caseData.title}". The student has just correctly answered 5 questions about ${discipline} regarding ${phaseContext}.
        
        Write a brief, personal congratulatory message (2-3 sentences).
        Reflect on the challenges of this specific time period in the company's history related to this discipline.
        
        Tone: Mentorship, authentic, slightly informal but professional.
        
        Return ONLY the text of the message.
      ` : `
        You are Jack Smith, the owner of Gaska Tape. The student has just correctly answered 5 questions about ${discipline} regarding ${phaseContext}.
        
        Write a brief, personal congratulatory message (2-3 sentences).
        Reflect on the challenges of this specific time period in the company's history related to this discipline.
        
        Tone: Mentorship, authentic, "Local Hero", slightly informal but professional.
        Example: "As the owner, I wrestled with those exact valuation numbers. It was a terrifying risk, but essential for our survival."
        
        Return ONLY the text of the message.
      `;

      const result = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ parts: [{ text: prompt }] }],
      });

      setJackFeedback(result.text || "Great job mastering these concepts.");
    } catch (error) {
      console.error('Error generating feedback:', error);
      setJackFeedback("Excellent work. You've demonstrated a strong grasp of the key concepts for this section.");
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const handleOptionSelect = (questionIndex: number, optionIndex: number) => {
    if (isUnlocked || selectedOptions[questionIndex] !== null) return;
    
    const isCorrect = questions[questionIndex].correctAnswerIndex === optionIndex;
    
    const newSelected = [...selectedOptions];
    newSelected[questionIndex] = optionIndex;
    setSelectedOptions(newSelected);

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      // Check if all are correct to unlock
      const allCorrect = questions.every((q, idx) => {
        const selected = idx === questionIndex ? optionIndex : selectedOptions[idx];
        return selected === q.correctAnswerIndex;
      });

      if (allCorrect) {
        setIsUnlocked(true);
        generateJackFeedback();

        // Mark module as complete
        const moduleId = `${discipline}-${caseParts[currentPhaseIndex].id}`;
        setCompletedModules(prev => {
          const next = new Set(prev);
          next.add(moduleId);
          return next;
        });
        setModuleScores(prev => {
          if (moduleId in prev) return prev;
          return {
            ...prev,
            [moduleId]: Math.max(0, 5 - incorrectCount)
          };
        });
      }
    } else {
      setIncorrectCount(prev => prev + 1);
      // No automatic timeout - user must click "Try Again"
    }
  };

  const saveCurrentPhaseToHistory = () => {
    setPhaseHistory(prev => ({
      ...prev,
      [currentPhaseIndex]: {
        questions,
        selectedOptions,
        isUnlocked,
        correctCount,
        incorrectCount
      }
    }));
  };

  const handleNextPhase = () => {
    if (currentPhaseIndex < caseParts.length - 1) {
      saveCurrentPhaseToHistory();
      const nextIndex = currentPhaseIndex + 1;
      setCurrentPhaseIndex(nextIndex);
      setAdminCode('');
      fetchQuestions(caseParts[nextIndex].id, discipline!, nextIndex);
    }
  };

  const handlePrevPhase = () => {
    if (currentPhaseIndex > 0) {
      saveCurrentPhaseToHistory();
      const prevIndex = currentPhaseIndex - 1;
      setCurrentPhaseIndex(prevIndex);
      // Load from history immediately
      const history = phaseHistory[prevIndex];
      if (history) {
        setQuestions(history.questions);
        setSelectedOptions(history.selectedOptions);
        setIsUnlocked(history.isUnlocked);
      }
    }
  };

  const handleBackToIntro = () => {
    localStorage.removeItem('activeSession');
    setSavedSession(null);
    setShowThankYou(true);
  };

  const handleReturnToDashboard = () => {
    // Redirect to home page
    window.location.href = '/';
  };

  useEffect(() => {
    const bypassCode = caseData.isCustom ? 'UNLOCK_SUCCESS' : 'Jack Smith';
    if (adminCode === bypassCode) {
      setIsUnlocked(true);
      // Auto-fill correct answers if bypassing
      const correctAnswers = questions.map(q => q.correctAnswerIndex);
      setSelectedOptions(correctAnswers);
      setCorrectCount(5);
      
      // Also mark as complete for scoring
      if (discipline) {
        const moduleId = `${discipline}-${caseParts[currentPhaseIndex].id}`;
        setCompletedModules(prev => {
          const next = new Set(prev);
          next.add(moduleId);
          return next;
        });
        setModuleScores(prev => {
          if (moduleId in prev) return prev;
          return {
            ...prev,
            [moduleId]: 5
          };
        });
      }
    }
  }, [adminCode, questions, discipline, currentPhaseIndex, caseData.isCustom]);

  const filteredResources = caseResources.filter(res => res.phases.includes(currentPhase.id));
  const filteredExhibits = caseExhibits.filter(ex => ex.phases.includes(currentPhase.id));

  if (showThankYou) {
    return <ThankYouPage onReturnToDashboard={handleReturnToDashboard} />;
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gray-200 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl w-full bg-white p-12 rounded-none shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] border-2 border-black text-center"
          >
            <h1 className="text-5xl font-display font-bold text-black mb-6 leading-none uppercase tracking-tighter">
              {caseData.title}
            </h1>
            <div className="space-y-4 text-lg text-gray-900 leading-relaxed text-left mb-10 font-medium markdown-body">
              <ReactMarkdown>{caseData.introText}</ReactMarkdown>
            </div>
            
            <div className="mb-10 text-left border-2 border-black p-6 bg-gray-50">
              <label htmlFor="passcode" className="block text-xl font-bold font-display uppercase mb-2">Class Passcode (Optional)</label>
              <p className="text-sm text-gray-600 mb-4 font-mono">If your professor provided a passcode, enter it here so they can track your progress.</p>
              <input
                id="passcode"
                type="text"
                value={studentPasscode}
                onChange={(e) => setStudentPasscode(e.target.value.toUpperCase())}
                placeholder="e.g., CLASS-123"
                className="w-full p-4 border-2 border-black font-mono text-lg uppercase focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <button
              onClick={() => setShowIntro(false)}
              className="inline-flex items-center gap-3 px-6 py-3 bg-black text-white rounded-none text-lg font-bold hover:bg-yellow-400 hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] group mb-12 uppercase tracking-widest font-display"
            >
              Let's Get Started
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {!caseData.isCustom && (
              <div className="mt-8 pt-8 border-t-2 border-black flex flex-col items-center gap-4">
                <img 
                  src="https://www.gaska.com/wp-content/uploads/2023/05/header-bg.jpg" 
                  alt="Gaska Tape Inc. Logo" 
                  className="max-w-md h-auto rounded-none"
                  referrerPolicy="no-referrer"
                />
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-black uppercase">Gaska Tape Inc.</p>
                  <p className="text-sm text-gray-500 font-mono uppercase tracking-widest bg-yellow-100 px-2 inline-block mt-2">
                    1810 W. Lusher Ave., Elkhart, IN 46517
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    );
  }

  if (!discipline) {
    let totalCaseModules = disciplines.length * caseParts.length;
    let completedCaseModules = 0;
    disciplines.forEach(disc => {
      caseParts.forEach(part => {
        if (completedModules.has(`${disc}-${part.id}`)) {
          completedCaseModules++;
        }
      });
    });
    const overallProgress = totalCaseModules === 0 ? 0 : (completedCaseModules / totalCaseModules) * 100;

    return (
      <div className="min-h-screen bg-gray-200 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-8">
          <div className="max-w-4xl w-full text-center">
            <h2 className="text-5xl font-display font-bold text-black mb-12 uppercase tracking-tighter">Select Your Discipline</h2>
            
            <div className="mb-12 max-w-xl mx-auto">
              <div className="flex justify-between items-end mb-2">
                <span className="font-bold uppercase font-display text-lg text-black">Overall Progress</span>
                <span className="font-bold font-mono text-black">{Math.round(overallProgress)}%</span>
              </div>
              <div className="w-full bg-white border-2 border-black h-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <motion.div
                  className="bg-blue-500 h-full border-r-2 border-black"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {savedSession && (
              <div className="mb-12 bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col items-center">
                <h3 className="text-2xl font-bold mb-4 uppercase font-display text-center">Resume Progress</h3>
                <p className="text-gray-600 mb-6 text-center">You have an active session in <strong>{savedSession.discipline}</strong> (Part {savedSession.currentPhaseIndex + 1}).</p>
                <button
                  onClick={handleResumeSession}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-yellow-400 text-black rounded-none text-xl font-bold hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] uppercase tracking-widest font-display"
                >
                  Resume Session
                  <ArrowRight className="h-6 w-6" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 max-w-xl mx-auto">
              {disciplines.map((disc) => {
                let completedCount = 0;
                let score = 0;
                
                caseParts.forEach(part => {
                  const moduleId = `${disc}-${part.id}`;
                  if (completedModules.has(moduleId)) {
                    completedCount++;
                    score += moduleScores[moduleId] || 0;
                  }
                });
                
                const isFullyComplete = completedCount === caseParts.length;
                const maxScore = caseParts.length * 5;
                const discProgress = caseParts.length === 0 ? 0 : (completedCount / caseParts.length) * 100;

                return (
                  <button
                    key={disc}
                    onClick={() => handleDisciplineSelect(disc)}
                    className={`w-full py-5 px-8 border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-2xl font-bold text-center uppercase tracking-wide font-display flex flex-col gap-4 ${
                      isFullyComplete 
                        ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200' 
                        : 'bg-white text-black hover:bg-yellow-400'
                    }`}
                  >
                    <div className="w-full flex justify-between items-center">
                      <span>{disc}</span>
                      <span className={`text-sm font-mono px-3 py-1 border-2 border-black ${
                        isFullyComplete ? 'bg-emerald-400 text-black' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {score}/{maxScore}
                      </span>
                    </div>
                    {/* Individual Discipline Progress Bar */}
                    <div className="w-full bg-white border-2 border-black h-3">
                      <motion.div
                        className="bg-pink-500 h-full border-r-2 border-black"
                        initial={{ width: 0 }}
                        animate={{ width: `${discProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <Header />
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-4 sticky top-0 z-40 border-b-2 border-black">
        <motion.div 
          className="bg-yellow-400 h-full border-r-2 border-black"
          initial={{ width: 0 }}
          animate={{ width: `${((currentPhaseIndex + 1) / caseParts.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid md:grid-cols-5 gap-12"
          >
            {/* Left Column: Case Text */}
            <div className="md:col-span-3">
              <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-4">
                <div className="flex items-center gap-4">
                  {currentPhaseIndex > 0 && (
                    <button 
                      onClick={handlePrevPhase}
                      className="p-2 bg-black text-white hover:bg-yellow-400 hover:text-black transition-colors rounded-none"
                      title="Back to previous part"
                    >
                      <ArrowLeft className="h-6 w-6" />
                    </button>
                  )}
                  <h2 className="font-display text-4xl font-bold uppercase tracking-tight">{currentPhase.title}</h2>
                </div>
                <span className="text-sm font-bold uppercase tracking-widest text-black bg-yellow-300 px-3 py-1 border border-black">{discipline}</span>
              </div>

              <div className="case-text-container prose prose-lg max-w-none h-[60vh] overflow-y-auto pr-6 bg-white p-8 border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
                <ReactMarkdown>{currentPhase.content}</ReactMarkdown>
              </div>

              {/* Custom Case Exhibits / Diagrams */}
              {caseExhibits && caseExhibits.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-2xl font-display font-bold text-black uppercase mb-6">Exhibits & Diagrams</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {caseExhibits.map((exhibit, idx) => (
                      <div key={idx} className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <img src={exhibit.imageUrl} alt={exhibit.title} className="w-full h-auto border-2 border-black mb-4" />
                        <h4 className="font-bold font-display uppercase text-lg">{exhibit.title}</h4>
                        {exhibit.description && <p className="text-sm text-gray-600 font-mono mt-2">{exhibit.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Financial Chart */}
              {!caseData.isCustom && <GaskaFinancialChart discipline={discipline!} partId={currentPhase.id} />}
              
              {/* Discipline Specific Tools */}
              {!caseData.isCustom && <GaskaDisciplineTools discipline={discipline!} partId={currentPhase.id} />}

              {/* Questions Section */}
              <div className="space-y-8">
                <div className="flex items-center justify-between border-l-8 border-black pl-6 py-2 bg-gray-50">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-display font-bold text-black uppercase">Teaching Note Analysis</h3>
                    <div className="flex gap-4 text-sm font-bold uppercase tracking-widest">
                      <span className="text-emerald-700 bg-emerald-100 px-2">Correct: {correctCount}</span>
                      <span className="text-rose-700 bg-rose-100 px-2">Incorrect: {incorrectCount}</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-black uppercase tracking-widest border-2 border-black px-3 py-1 bg-white">
                    {selectedOptions.filter(o => o !== null).length} / 5 Answered
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center py-12 border-2 border-dashed border-gray-300">
                    <Loader2 className="h-12 w-12 text-black animate-spin mb-4" />
                    <p className="text-gray-500 font-mono uppercase">Generating Questions...</p>
                  </div>
                ) : (
                  <>
                    {questions.map((q, qIdx) => (
                      <div key={qIdx} className="bg-white p-8 border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 relative overflow-hidden">
                        {replacingIndices.has(qIdx) && (
                          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                            <Loader2 className="h-8 w-8 text-black animate-spin mb-2" />
                            <p className="text-xs font-bold text-black uppercase tracking-widest">Generating New Question...</p>
                          </div>
                        )}
                        
                        <p className="font-bold text-lg text-black font-display tracking-wide">{qIdx + 1}. {q.question}</p>
                        <div className="grid gap-3">
                          {q.options.map((option, oIdx) => {
                            const isSelected = selectedOptions[qIdx] === oIdx;
                            const isCorrect = q.correctAnswerIndex === oIdx;
                            const showResult = selectedOptions[qIdx] !== null;
                            
                            let buttonClass = "w-full text-left p-4 rounded-none border-2 transition-all font-medium text-base ";
                            if (!showResult) {
                              buttonClass += isSelected ? "border-black bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]" : "border-gray-200 hover:border-black hover:bg-yellow-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]";
                            } else {
                              if (isCorrect) {
                                buttonClass += "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-none";
                              } else if (isSelected && !isCorrect) {
                                buttonClass += "border-rose-600 bg-rose-50 text-rose-900 shadow-none";
                              } else {
                                buttonClass += "border-gray-100 opacity-40";
                              }
                            }

                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleOptionSelect(qIdx, oIdx)}
                                disabled={showResult || replacingIndices.has(qIdx)}
                                className={buttonClass}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`h-6 w-6 border-2 flex items-center justify-center shrink-0 font-bold text-sm ${
                                    showResult && isCorrect ? 'border-emerald-600 bg-emerald-600 text-white' : 
                                    showResult && isSelected && !isCorrect ? 'border-rose-600 bg-rose-600 text-white' :
                                    isSelected ? 'border-black bg-black text-white' : 'border-black bg-white text-black'
                                  }`}>
                                    {showResult && isCorrect ? '✓' : showResult && isSelected && !isCorrect ? '✕' : String.fromCharCode(65 + oIdx)}
                                  </div>
                                  <span>{option}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        
                        {selectedOptions[qIdx] !== null && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className={`p-6 border-l-4 ${selectedOptions[qIdx] === q.correctAnswerIndex ? 'border-emerald-500 bg-emerald-50/50' : 'border-rose-500 bg-rose-50/50'}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-bold text-lg uppercase font-display">
                                {selectedOptions[qIdx] === q.correctAnswerIndex ? 'Correct Analysis' : 'Incorrect Analysis'}
                              </p>
                              {selectedOptions[qIdx] !== q.correctAnswerIndex && (
                                <span className="text-[10px] font-bold uppercase bg-black text-white px-2 py-1 animate-pulse">
                                  Reviewing...
                                </span>
                              )}
                            </div>
                            <p className="text-gray-800 leading-relaxed mb-4">{q.explanation}</p>
                            
                            {selectedOptions[qIdx] !== q.correctAnswerIndex && (
                              <button
                                onClick={() => replaceQuestion(qIdx)}
                                disabled={replacingIndices.has(qIdx)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50"
                              >
                                {replacingIndices.has(qIdx) ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    Try Similar Question
                                    <ArrowRight className="h-4 w-4" />
                                  </>
                                )}
                              </button>
                            )}
                          </motion.div>
                        )}
                      </div>
                    ))}
                    
                    {feedback && (
                      <div className="p-6 bg-yellow-50 border-2 border-yellow-400 text-yellow-900 flex gap-4 items-start">
                        <AlertCircle className="h-6 w-6 shrink-0 mt-1" />
                        <p className="font-medium">{feedback}</p>
                      </div>
                    )}

                    {isUnlocked && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-50 border-2 border-emerald-600 p-10 rounded-none text-center mt-12 shadow-[12px_12px_0px_0px_rgba(5,150,105,0.2)]"
                      >
                        <CheckCircle2 className="h-20 w-20 text-emerald-600 mx-auto mb-6" />
                        <h3 className="text-4xl font-display font-bold text-emerald-900 mb-4 uppercase">Module Complete</h3>
                        
                        {isGeneratingFeedback ? (
                          <div className="flex flex-col items-center justify-center py-4">
                            <Loader2 className="h-6 w-6 text-emerald-700 animate-spin mb-2" />
                            <p className="text-emerald-700 font-mono text-sm uppercase">{caseData.isCustom ? "Reviewing your analysis..." : "Jack Smith is reviewing your analysis..."}</p>
                          </div>
                        ) : (
                          <div className="relative max-w-2xl mx-auto mb-10">
                            <div className="absolute -top-4 -left-4 text-6xl text-emerald-200 font-serif">"</div>
                            <p className="text-emerald-900 text-xl font-medium font-serif italic leading-relaxed px-8">
                              {jackFeedback || "Excellent work. You've demonstrated a strong grasp of the key concepts for this section."}
                            </p>
                            <div className="absolute -bottom-4 -right-4 text-6xl text-emerald-200 font-serif">"</div>
                            {!caseData.isCustom && <p className="text-right mt-4 font-display font-bold text-emerald-800 uppercase text-sm tracking-widest">— Jack Smith, Owner</p>}
                          </div>
                        )}
                        
                        {currentPhaseIndex < caseParts.length - 1 ? (
                          <button
                            onClick={handleNextPhase}
                            className="inline-flex items-center gap-4 px-12 py-6 bg-black text-white rounded-none text-2xl font-bold hover:bg-emerald-600 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] group uppercase tracking-widest font-display"
                          >
                            Proceed to Part {currentPhaseIndex + 2}
                            <ArrowRight className="h-8 w-8 group-hover:translate-x-2 transition-transform" />
                          </button>
                        ) : (
                          <div className="space-y-8">
                            <LeadershipProfile disciplineScores={disciplineScores} />

                            <div className="text-3xl font-display font-bold text-emerald-900 uppercase">
                              Case Study Analysis Complete
                            </div>
                            <button
                              onClick={handleBackToIntro}
                              className="inline-flex items-center gap-3 px-10 py-5 bg-black text-white rounded-none font-bold hover:bg-gray-800 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] uppercase tracking-widest"
                            >
                              Return to Dashboard
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {!isUnlocked && (
                      <div className="mt-16 pt-8 border-t-2 border-gray-100 flex justify-center">
                        <div className="w-full max-w-xs">
                          <label htmlFor="admin-bypass" className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3 text-center">
                            Admin Bypass
                          </label>
                          <input
                            id="admin-bypass"
                            type="password"
                            placeholder="ENTER CODE"
                            value={adminCode}
                            onChange={(e) => setAdminCode(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-none text-sm focus:outline-none focus:border-black focus:bg-white transition-colors text-center font-mono placeholder:text-gray-300"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Resources & Exhibits */}
            <div className="md:col-span-2">
              <div className="space-y-8 sticky top-12">
                {/* Exhibits Section */}
                {filteredExhibits.length > 0 && (
                  <div className="bg-white p-8 border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="font-display text-3xl font-bold mb-6 border-b-4 border-yellow-400 pb-2 uppercase tracking-tight">Case Exhibits</h2>
                    <div className="space-y-4">
                      {filteredExhibits.map((item, index) => (
                        <a 
                          key={index} 
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-white hover:bg-yellow-50 transition-all border-2 border-gray-100 hover:border-black group"
                        >
                          <span className="font-bold text-gray-900 group-hover:text-black text-lg">{item.title}</span>
                          <FileText className="h-6 w-6 text-gray-400 group-hover:text-black" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resources Section */}
                <div className="bg-white p-8 border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="font-display text-3xl font-bold mb-6 border-b-4 border-yellow-400 pb-2 uppercase tracking-tight">Case Resources</h2>
                  <div className="space-y-4">
                    {filteredResources.map((item, index) => (
                      <a 
                        key={index} 
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-white hover:bg-yellow-50 transition-all border-2 border-gray-100 hover:border-black group"
                      >
                        <span className="font-bold text-gray-900 group-hover:text-black text-lg">{item.title}</span>
                        <Youtube className="h-6 w-6 text-gray-400 group-hover:text-red-600" />
                      </a>
                    ))}
                  </div>
                </div>
                
                <div className="mt-8 p-6 bg-gray-50 border-2 border-dashed border-gray-300 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400 mb-3">
                    <Lock className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Module Status</span>
                  </div>
                  <p className="text-base font-medium text-gray-600">
                    {isUnlocked ? 'Next section unlocked.' : 'Correctly answer all 5 multiple-choice questions to unlock the next part of Jack\'s story.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
