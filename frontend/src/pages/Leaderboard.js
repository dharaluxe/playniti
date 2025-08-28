import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// Leaderboard page
// Displays the top players across all events.  It fetches match data
// joined with user and event info from Supabase and sorts by score
// descending and time ascending.  Only the top 20 records are shown.

const Leaderboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // Join matches with users and events to get names.  Order by score desc, time asc.
        const { data, error } = await supabase
          .from('matches')
          .select('score, time_taken, user_id, event_id, users(username), events(name)')
          .order('score', { ascending: false })
          .order('time_taken', { ascending: true })
          .limit(20);
        if (error) throw error;
        setRecords(data || []);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <p>Loading leaderboard…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Leaderboard</h1>
      {records.length === 0 ? (
        <p className="text-gray-400">No results available yet.</p>
      ) : (
        <table className="w-full text-left text-sm bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="py-2 px-2">Rank</th>
              <th className="py-2 px-2">Player</th>
              <th className="py-2 px-2">Event</th>
              <th className="py-2 px-2">Score</th>
              <th className="py-2 px-2">Time (s)</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}>
                <td className="py-2 px-2 font-semibold">{idx + 1}</td>
                <td className="py-2 px-2">{rec.users?.username || rec.user_id}</td>
                <td className="py-2 px-2">{rec.events?.name || rec.event_id}</td>
                <td className="py-2 px-2">{rec.score}</td>
                <td className="py-2 px-2">{rec.time_taken.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Leaderboard;