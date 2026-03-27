import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { motion } from 'motion/react';

interface LeadershipProfileProps {
  disciplineScores: Record<string, number>;
}

const allDisciplines = [
  'Marketing', 'Small Business', 'Entrepreneurship', 'Creativity & Innovation', 
  'Business Ethics', 'Family Business', 'Operations', 'Finance', 
  'Leadership', 'Organizational Behavior'
];

export default function LeadershipProfile({ disciplineScores }: LeadershipProfileProps) {
  // Transform scores into data format for Recharts
  const data = allDisciplines.map(discipline => ({
    subject: discipline,
    A: disciplineScores[discipline] || 0, // Current User Score
    fullMark: 100,
  }));

  // Calculate completion percentage
  const completedCount = Object.values(disciplineScores).filter(score => score > 0).length;
  const totalCount = allDisciplines.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-12"
    >
      <div className="text-center mb-8">
        <h3 className="text-3xl font-display font-bold text-black uppercase mb-2">Your Leadership Profile</h3>
        <p className="text-gray-600">
          Visualizing your expertise across the 10 dimensions of business leadership.
        </p>
        <div className="mt-4 inline-block bg-gray-100 px-4 py-2 border border-black">
          <span className="font-bold text-lg">{completionPercentage}%</span>
          <span className="text-sm uppercase tracking-wider ml-2">Profile Complete</span>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#000', fontSize: 10, fontWeight: 'bold' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Your Score"
              dataKey="A"
              stroke="#000000"
              strokeWidth={3}
              fill="#fbbf24" // Yellow-400
              fillOpacity={0.6}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '2px solid #000', 
                borderRadius: '0px',
                boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' 
              }}
              itemStyle={{ color: '#000', fontWeight: 'bold' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 italic">
          Complete more disciplines to expand your leadership profile.
        </p>
      </div>
    </motion.div>
  );
}
