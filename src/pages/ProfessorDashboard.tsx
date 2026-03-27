import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ProfessorDashboard() {
  const { profile, loading } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const q = query(collection(db, 'student_sessions'));
        const snapshot = await getDocs(q);
        let data = snapshot.docs.map(doc => doc.data());
        
        // Filter by professor's passcode if they have one
        if (profile?.passcode) {
          data = data.filter(session => session.passcode === profile.passcode);
        }
        
        setSessions(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'student_sessions');
      } finally {
        setIsLoading(false);
      }
    }

    if (profile?.role === 'professor' || profile?.role === 'admin') {
      fetchAnalytics();
    }
  }, [profile]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-200 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-8">
          <p className="text-2xl font-display font-bold uppercase">Loading Dashboard...</p>
        </main>
      </div>
    );
  }

  if (profile?.role !== 'professor' && profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-200 flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center p-8">
          <p className="text-2xl font-display font-bold uppercase text-red-500">Access Denied. Professor role required.</p>
        </main>
      </div>
    );
  }

  // Calculate analytics
  const disciplineCounts: Record<string, number> = {};
  const partFailures: Record<string, number> = {};

  sessions.forEach(session => {
    // Count disciplines
    disciplineCounts[session.discipline] = (disciplineCounts[session.discipline] || 0) + 1;

    // Count failures per part
    if (session.partIncorrectCount) {
      Object.entries(session.partIncorrectCount).forEach(([partId, count]) => {
        if ((count as number) > 0) {
          const key = `${session.discipline} - ${partId}`;
          partFailures[key] = (partFailures[key] || 0) + 1;
        }
      });
    }
  });

  const disciplineData = Object.entries(disciplineCounts).map(([name, count]) => ({ name, count }));
  const failureData = Object.entries(partFailures)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 hardest parts

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <Header />
      <main className="flex-grow p-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-display font-bold text-black uppercase tracking-tighter mb-2">Class Analytics Dashboard</h1>
            {profile?.passcode && (
              <div className="inline-block bg-yellow-100 border-2 border-yellow-400 px-4 py-2 mt-2">
                <span className="font-bold uppercase text-yellow-800 mr-2">Your Class Passcode:</span>
                <span className="font-mono text-xl font-bold text-black">{profile.passcode}</span>
                <p className="text-sm text-yellow-800 mt-1 font-mono">Share this code with your students to track their progress.</p>
              </div>
            )}
          </div>
          <Link
            to="/professor-portal"
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-bold uppercase tracking-widest font-display"
          >
            Upload New Case
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Disciplines */}
          <div className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-display font-bold text-black mb-6 uppercase">Most Popular Disciplines</h2>
            {disciplineData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={disciplineData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12, fontFamily: 'monospace' }} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} />
                    <Bar dataKey="count" fill="#3b82f6" stroke="#000" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500 font-mono">No data available yet.</p>
            )}
          </div>

          {/* Hardest Sections */}
          <div className="bg-white p-8 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-display font-bold text-black mb-6 uppercase">Where Students Get Stuck</h2>
            <p className="text-sm text-gray-500 mb-4 font-mono">Number of students who failed at least once per section</p>
            {failureData.length > 0 ? (
              <div className="space-y-4">
                {failureData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border-2 border-black bg-red-50">
                    <span className="font-bold font-display uppercase">{item.name}</span>
                    <span className="font-mono bg-red-500 text-white px-3 py-1 border-2 border-black">{item.count} students</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 font-mono">No data available yet.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
