import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Scale, 
  Lightbulb, 
  Users, 
  History, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Activity
} from 'lucide-react';

interface GaskaDisciplineToolsProps {
  discipline: string;
  partId: string;
}

export default function GaskaDisciplineTools({ discipline, partId }: GaskaDisciplineToolsProps) {
  const [sentiment, setSentiment] = useState(50);
  
  // Marketing & Brand Management - Part C (Community/Reputation)
  if (discipline === 'Marketing' && partId === 'partC') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12"
      >
        <div className="flex items-center gap-3 mb-6 border-b-4 border-yellow-400 pb-4">
          <Shield className="h-8 w-8 text-black" />
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight">
            Brand Reputation Analysis
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="bg-gray-100 p-4 border-2 border-black mb-4">
              <img 
                src="https://media.cnn.com/api/v1/images/stellar/prod/190123170911-swissguard03.jpg?q=w_1160,c_fill/f_webp" 
                alt="Swiss Guard Helmets using Gaska Tape" 
                className="w-full h-48 object-cover mb-2 grayscale hover:grayscale-0 transition-all"
              />
              <p className="text-xs font-mono uppercase text-gray-500">Global Reach: Gaska Tape used in Swiss Guard Helmets</p>
            </div>
            <div className="bg-blue-900 text-white p-4 border-2 border-black">
              <h4 className="font-bold uppercase mb-2">Exhibit 5: Community Action</h4>
              <p className="text-sm">
                "$30,000 Donation to Elkhart Police Department for new tactical equipment."
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-yellow-50 p-6 border-2 border-black">
              <h4 className="font-display font-bold uppercase text-lg mb-4">Challenge</h4>
              <p className="mb-4 font-medium">
                "Jack is fighting a public legal battle with his sister. How does his $30,000 donation to the Elkhart Police act as a strategic marketing move to protect the company's local reputation?"
              </p>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase">Rate Predicted Public Sentiment Impact:</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={sentiment} 
                  onChange={(e) => setSentiment(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <div className="flex justify-between text-xs font-mono">
                  <span>Negative (Buying Favor)</span>
                  <span>Positive (Community Pillar)</span>
                </div>
                <p className="text-center font-bold text-xl mt-2">{sentiment}% Positive</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Entrepreneurship & Business Ethics - Part B (The Crisis/Decision)
  if ((discipline === 'Business Ethics' || discipline === 'Entrepreneurship') && partId === 'partB') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12"
      >
        <div className="flex items-center gap-3 mb-6 border-b-4 border-yellow-400 pb-4">
          <Scale className="h-8 w-8 text-black" />
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight">
            Legal vs. Moral Framework
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="border-2 border-black p-4 bg-gray-50">
            <h4 className="font-bold uppercase border-b-2 border-black pb-2 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Indiana Business Code (Exhibit 4)
            </h4>
            <ul className="list-disc list-inside text-sm space-y-2">
              <li>Allows judicial dissolution if directors are deadlocked.</li>
              <li>Shareholders unable to break deadlock.</li>
              <li>Corporate assets are being misapplied or wasted.</li>
            </ul>
          </div>
          <div className="border-2 border-black p-4 bg-gray-50">
            <h4 className="font-bold uppercase border-b-2 border-black pb-2 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Company Bylaws (Exhibit 2)
            </h4>
            <ul className="list-disc list-inside text-sm space-y-2">
              <li>50/50 Ownership Split.</li>
              <li>No tie-breaking mechanism defined.</li>
              <li>Requires majority vote for major actions.</li>
            </ul>
          </div>
        </div>

        <div className="bg-black text-white p-6 border-2 border-black mb-8">
          <h4 className="font-display font-bold uppercase text-lg mb-4 text-yellow-400">The Virtue Cycle Framework</h4>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center">
            <div className="flex-1 p-4 border border-white/20 rounded bg-white/10">
              <div className="font-bold text-xl mb-1">1. Judgment</div>
              <div className="text-xs text-gray-300">Discern the "Right"</div>
            </div>
            <ArrowRight className="hidden md:block h-6 w-6 text-yellow-400" />
            <div className="flex-1 p-4 border border-white/20 rounded bg-white/10">
              <div className="font-bold text-xl mb-1">2. Action</div>
              <div className="text-xs text-gray-300">Do the "Right"</div>
            </div>
            <ArrowRight className="hidden md:block h-6 w-6 text-yellow-400" />
            <div className="flex-1 p-4 border border-white/20 rounded bg-white/10">
              <div className="font-bold text-xl mb-1">3. Habit</div>
              <div className="text-xs text-gray-300">Become "Right"</div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-6 border-2 border-black">
          <h4 className="font-display font-bold uppercase text-lg mb-2">Ethical Challenge</h4>
          <p className="font-medium">
            "Based on the legal grounds for dissolution in Exhibit 4, does Jack have a moral obligation to sell, or a fiduciary duty to the employees to fight? Use the 'Virtue Cycle' framework above to justify your choice."
          </p>
        </div>
      </motion.div>
    );
  }

  // Creativity & Innovation - Part B (R&D Investment)
  if (discipline === 'Creativity & Innovation' && partId === 'partB') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12"
      >
        <div className="flex items-center gap-3 mb-6 border-b-4 border-yellow-400 pb-4">
          <Lightbulb className="h-8 w-8 text-black" />
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight">
            Innovation & R&D Strategy
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 border-2 border-black">
            <div className="bg-black text-white px-4 py-2 font-bold uppercase text-sm">
              Technical Spec Sheet: Polyvinyl Foam Series V
            </div>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-3 font-bold bg-gray-50">Density</td>
                  <td className="p-3">15-25 lbs/ft³</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-3 font-bold bg-gray-50">Tensile Strength</td>
                  <td className="p-3">120 psi (min)</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-3 font-bold bg-gray-50">Temp Range</td>
                  <td className="p-3">-40°F to 200°F</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold bg-gray-50">Applications</td>
                  <td className="p-3">Automotive Seals, HVAC Gaskets, Marine</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="bg-gray-100 p-4 border-2 border-black flex flex-col justify-center items-center text-center">
            <Activity className="h-12 w-12 text-gray-400 mb-2" />
            <div className="font-bold uppercase text-sm">Exhibit 6 Trend</div>
            <div className="text-xs mt-1">Shift towards eco-friendly & lightweight materials in 2009.</div>
          </div>
        </div>

        <div className="bg-yellow-50 p-6 border-2 border-black">
          <h4 className="font-display font-bold uppercase text-lg mb-2">Innovation Challenge</h4>
          <p className="font-medium">
            "In Part B, Jack mentions investing in R&D despite the crisis. Look at the manufacturing trends in Exhibit 6; what new product category should Gaska have entered in 2009 to diversify away from the 50/50 deadlock risk?"
          </p>
        </div>
      </motion.div>
    );
  }

  // Leadership & Organizational Behavior - Part B (The Termination/Conflict)
  if ((discipline === 'Leadership' || discipline === 'Organizational Behavior') && partId === 'partB') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12"
      >
        <div className="flex items-center gap-3 mb-6 border-b-4 border-yellow-400 pb-4">
          <Users className="h-8 w-8 text-black" />
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight">
            Organizational Heatmap
          </h3>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="border-2 border-black p-6 bg-rose-50 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-rose-200">
              <AlertTriangle className="h-16 w-16" />
            </div>
            <h4 className="font-bold uppercase text-lg mb-4 border-b-2 border-rose-200 pb-2">Current: The Deadlock</h4>
            <div className="flex justify-center items-center gap-8 mb-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-2">50%</div>
                <div className="font-bold">Jack</div>
              </div>
              <div className="h-px w-16 bg-black border-t-2 border-dashed border-black relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-100 px-1 text-xs font-bold text-rose-600">CONFLICT</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-400 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-2">50%</div>
                <div className="font-bold">Judy</div>
              </div>
            </div>
            <p className="text-sm text-center italic">"Ticking Time Bomb"</p>
          </div>

          <div className="border-2 border-black p-6 bg-emerald-50 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-emerald-200">
              <CheckCircle2 className="h-16 w-16" />
            </div>
            <h4 className="font-bold uppercase text-lg mb-4 border-b-2 border-emerald-200 pb-2">Ideal: Centralized</h4>
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-2">CEO</div>
                <div className="font-bold">Unified Vision</div>
              </div>
              <div className="w-full border-t-2 border-black"></div>
              <div className="flex gap-4 w-full justify-around">
                <div className="text-center text-xs font-bold uppercase">Ops</div>
                <div className="text-center text-xs font-bold uppercase">Sales</div>
                <div className="text-center text-xs font-bold uppercase">R&D</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-6 border-2 border-black">
          <h4 className="font-display font-bold uppercase text-lg mb-2">Leadership Challenge</h4>
          <p className="font-medium">
            "Jack terminated Judy and John after receiving the letter. Based on the 'Trust Issues' noted in Part A, map out the communication breakdown. Was the 50/50 split a 'ticking time bomb' as Jack reflects in Part B?"
          </p>
        </div>
      </motion.div>
    );
  }

  // Family Business Management - Part B (Succession/Buyout)
  if (discipline === 'Family Business' && partId === 'partB') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12"
      >
        <div className="flex items-center gap-3 mb-6 border-b-4 border-yellow-400 pb-4">
          <History className="h-8 w-8 text-black" />
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight">
            Legacy & Succession Timeline
          </h3>
        </div>

        <div className="relative border-l-4 border-black ml-4 my-8 space-y-8">
          <div className="relative pl-8">
            <div className="absolute -left-[14px] top-0 w-6 h-6 bg-black rounded-full border-4 border-white shadow-sm"></div>
            <h4 className="font-bold uppercase text-lg">Generation 1: The Founders</h4>
            <p className="text-sm text-gray-600 mb-2">Jack Sr. buys out his sister Barbara.</p>
            <div className="inline-block bg-gray-100 px-2 py-1 text-xs font-mono border border-black">Historical Precedent</div>
          </div>

          <div className="relative pl-8">
            <div className="absolute -left-[14px] top-0 w-6 h-6 bg-rose-500 rounded-full border-4 border-white shadow-sm"></div>
            <h4 className="font-bold uppercase text-lg text-rose-600">Generation 2: The Crisis</h4>
            <p className="text-sm text-gray-600 mb-2">Jack vs. Judy (50/50 Split). Legal Dissolution.</p>
            <div className="inline-block bg-rose-100 text-rose-800 px-2 py-1 text-xs font-mono border border-rose-800">Current Conflict</div>
          </div>

          <div className="relative pl-8">
            <div className="absolute -left-[14px] top-0 w-6 h-6 bg-yellow-400 rounded-full border-4 border-white shadow-sm"></div>
            <h4 className="font-bold uppercase text-lg">Generation 3: The Future</h4>
            <p className="text-sm text-gray-600 mb-2">Jack's Twins. Succession Planning needed.</p>
            <div className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 text-xs font-mono border border-yellow-600">Opportunity</div>
          </div>
        </div>

        <div className="bg-yellow-50 p-6 border-2 border-black">
          <h4 className="font-display font-bold uppercase text-lg mb-2">Succession Challenge</h4>
          <p className="font-medium">
            "History is repeating itself. Jack Sr. bought out his sister Barbara; now Jack must buy out Judy. Create a 'Succession Protocol' for Jack's twins (mentioned in Part B) to ensure this cycle ends with them."
          </p>
        </div>
      </motion.div>
    );
  }

  return null;
}
