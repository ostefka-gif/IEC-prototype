import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area
} from 'recharts';
import { motion } from 'motion/react';
import { TrendingDown, TrendingUp, DollarSign, Activity } from 'lucide-react';

const revenueData = [
  { year: '2006', revenue: 100, overhead: 70, profit: 30 },
  { year: '2007', revenue: 110, overhead: 75, profit: 35 },
  { year: '2008', revenue: 85, overhead: 78, profit: 7 },
  { year: '2009', revenue: 60, overhead: 65, profit: -5 },
  { year: '2010', revenue: 75, overhead: 50, profit: 25 },
];

const marketData = [
  { year: '2006', autoIndex: 100, gaskaSales: 100 },
  { year: '2007', autoIndex: 105, gaskaSales: 110 },
  { year: '2008', autoIndex: 60, gaskaSales: 85 },
  { year: '2009', autoIndex: 45, gaskaSales: 60 },
  { year: '2010', autoIndex: 55, gaskaSales: 75 },
];

interface GaskaFinancialChartProps {
  discipline: string;
  partId: string;
}

export default function GaskaFinancialChart({ discipline, partId }: GaskaFinancialChartProps) {
  const [activeTab, setActiveTab] = useState<'revenue' | 'market'>('revenue');

  // Only show for Finance or Small Business
  if (!['Finance', 'Small Business'].includes(discipline)) {
    return null;
  }

  // Only show in Part B (The Crisis) or Part C (Resolution)
  if (partId === 'partA') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12"
    >
      <div className="flex items-center justify-between mb-6 border-b-4 border-yellow-400 pb-4">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-black" />
          <h3 className="text-2xl font-display font-bold uppercase tracking-tight">
            {discipline} Analysis: Financial Impact
          </h3>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-2 font-bold uppercase text-sm border-2 transition-all ${
              activeTab === 'revenue'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-200 hover:border-black'
            }`}
          >
            Revenue vs Overhead
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`px-4 py-2 font-bold uppercase text-sm border-2 transition-all ${
              activeTab === 'market'
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-200 hover:border-black'
            }`}
          >
            2008 Market Context
          </button>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'revenue' ? (
            <ComposedChart
              data={revenueData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" stroke="#000" tick={{ fill: '#000', fontWeight: 'bold' }} />
              <YAxis stroke="#000" tick={{ fill: '#000', fontWeight: 'bold' }} label={{ value: 'Index (2006=100)', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '2px solid #000',
                  borderRadius: '0px',
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="revenue" name="Revenue Index" fill="#000" barSize={40} />
              <Line
                type="monotone"
                dataKey="overhead"
                name="Overhead Costs"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
              />
              <Area type="monotone" dataKey="profit" name="Net Profit Estimate" fill="#10b981" stroke="#059669" fillOpacity={0.2} />
            </ComposedChart>
          ) : (
            <LineChart
              data={marketData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" stroke="#000" tick={{ fill: '#000', fontWeight: 'bold' }} />
              <YAxis stroke="#000" tick={{ fill: '#000', fontWeight: 'bold' }} label={{ value: 'Index (2006=100)', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '2px solid #000',
                  borderRadius: '0px',
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="autoIndex"
                name="Automotive Industry Index"
                stroke="#6b7280"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#6b7280' }}
              />
              <Line
                type="monotone"
                dataKey="gaskaSales"
                name="Gaska Sales Performance"
                stroke="#000"
                strokeWidth={4}
                dot={{ r: 6, fill: '#000', strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-6 p-4 bg-gray-50 border-l-4 border-black text-sm text-gray-700">
        <div className="flex items-start gap-3">
          {activeTab === 'revenue' ? (
            <>
              <DollarSign className="h-5 w-5 text-emerald-600 mt-1 shrink-0" />
              <div>
                <strong className="block text-black uppercase mb-1">Financial Insight:</strong>
                Notice the critical squeeze in 2008-2009 where overhead costs remained high despite plummeting revenue. This structural imbalance necessitated the painful "rightsizing" decisions discussed in Part C.
              </div>
            </>
          ) : (
            <>
              <TrendingDown className="h-5 w-5 text-rose-600 mt-1 shrink-0" />
              <div>
                <strong className="block text-black uppercase mb-1">Market Context:</strong>
                Gaska's performance closely tracked the collapse of the automotive sector. The sharp decline in 2008 illustrates the external market forces that compounded internal family disputes.
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
