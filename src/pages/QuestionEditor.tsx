import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { Save, Edit2, Check, X } from 'lucide-react';

export default function QuestionEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  // Expecting caseData and generatedQuestions from ProfessorPortal
  const caseData = location.state?.caseData;
  const initialQuestions = location.state?.generatedQuestions;

  const [questions, setQuestions] = useState<any[]>(initialQuestions || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!caseData || !questions) {
    return (
      <div className="min-h-screen bg-gray-200 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-8">
          <p className="text-2xl font-display font-bold uppercase text-red-500">No case data found. Please upload a PDF first.</p>
        </main>
      </div>
    );
  }

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...questions[index] });
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const updated = [...questions];
      updated[editingIndex] = editForm;
      setQuestions(updated);
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleSaveCase = async () => {
    if (!profile || (profile.role !== 'professor' && profile.role !== 'admin')) return;
    
    setIsSaving(true);
    try {
      const caseId = caseData.id || `custom-${Date.now()}`;
      const newCase = {
        ...caseData,
        id: caseId,
        authorId: profile.uid,
        createdAt: new Date().toISOString(),
        questions: {
          // For prototype, we save the generated questions under a default discipline "General"
          // In a full version, we'd map this to specific disciplines and parts
          'General': {
            'part-1': questions // Simplification for prototype
          }
        }
      };

      await setDoc(doc(db, 'cases', caseId), newCase);
      alert('Case saved successfully!');
      navigate('/professor-dashboard');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'cases');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <Header />
      <main className="flex-grow p-8 max-w-5xl mx-auto w-full">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-display font-bold text-black uppercase tracking-tighter">Question Editor Sandbox</h1>
          <button
            onClick={handleSaveCase}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-widest font-display disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {isSaving ? 'Saving...' : 'Publish Case'}
          </button>
        </div>

        <div className="space-y-8">
          {questions.map((q, index) => (
            <div key={index} className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              {editingIndex === index ? (
                <div className="space-y-4">
                  <div>
                    <label className="block font-bold font-display uppercase mb-2">Question</label>
                    <textarea
                      value={editForm.question}
                      onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                      className="w-full p-4 border-2 border-black font-mono text-sm"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block font-bold font-display uppercase mb-2">Options</label>
                    {editForm.options.map((opt: string, optIdx: number) => (
                      <div key={optIdx} className="flex items-center gap-4 mb-2">
                        <input
                          type="radio"
                          name={`correct-${index}`}
                          checked={editForm.correctAnswerIndex === optIdx}
                          onChange={() => setEditForm({ ...editForm, correctAnswerIndex: optIdx })}
                          className="w-5 h-5 accent-black"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...editForm.options];
                            newOpts[optIdx] = e.target.value;
                            setEditForm({ ...editForm, options: newOpts });
                          }}
                          className="flex-grow p-2 border-2 border-black font-mono text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block font-bold font-display uppercase mb-2">Explanation</label>
                    <textarea
                      value={editForm.explanation}
                      onChange={(e) => setEditForm({ ...editForm, explanation: e.target.value })}
                      className="w-full p-4 border-2 border-black font-mono text-sm"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t-2 border-black">
                    <button
                      onClick={handleSaveEdit}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white font-bold uppercase font-display hover:bg-yellow-400 hover:text-black transition-colors"
                    >
                      <Check className="h-4 w-4" /> Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-black font-bold uppercase font-display hover:bg-gray-300 transition-colors"
                    >
                      <X className="h-4 w-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold font-display leading-tight pr-8">{q.question}</h3>
                    <button
                      onClick={() => handleEdit(index)}
                      className="p-2 bg-yellow-400 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {q.options.map((opt: string, optIdx: number) => (
                      <div 
                        key={optIdx} 
                        className={`p-4 border-2 border-black font-mono text-sm ${q.correctAnswerIndex === optIdx ? 'bg-emerald-100 border-emerald-500' : 'bg-gray-50'}`}
                      >
                        {optIdx === q.correctAnswerIndex && <span className="font-bold text-emerald-700 mr-2">[CORRECT]</span>}
                        {opt}
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-blue-50 border-2 border-blue-200">
                    <span className="font-bold font-display uppercase text-blue-800 block mb-1">Explanation:</span>
                    <p className="font-mono text-sm text-blue-900">{q.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
