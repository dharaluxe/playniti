import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Dashboard = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch active events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('scheduled_at', { ascending: true });
      if (!eventsError) setEvents(eventsData || []);
      // Fetch user's subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('expires_at', { ascending: false });
      if (!subsError) setSubscriptions(subsData || []);
      setLoading(false);
    };
    fetchData();
  }, [user.id]);

  const buyWeeklyPass = async () => {
    // This function creates a new subscription row with 7 entries and an expiry one week from now.
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan: 'weekly',
      entries_remaining: 7,
      expires_at: expiresAt.toISOString(),
    });
    alert('Weekly pass purchased!');
    window.location.reload();
  };

  // Top up the user's weekly pass by adding extra entries.  Finds the
  // first active weekly subscription and increments its entries_remaining
  // by 3.  If no weekly pass exists the user is prompted to purchase
  // one first.
  const topUpWeeklyPass = async () => {
    // Find the most recent valid weekly pass
    const activeWeekly = subscriptions.find(
      (sub) => sub.plan === 'weekly' && new Date(sub.expires_at) > new Date()
    );
    if (!activeWeekly) {
      alert('Please purchase a weekly pass before topping up.');
      return;
    }
    try {
      await supabase
        .from('subscriptions')
        .update({ entries_remaining: activeWeekly.entries_remaining + 3 })
        .eq('id', activeWeekly.id);
      alert('Top up successful! 3 additional entries added.');
      window.location.reload();
    } catch (err) {
      alert('Error topping up: ' + err.message);
    }
  };

  const buyMegaPass = async () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan: 'mega',
      entries_remaining: 1,
      expires_at: expiresAt.toISOString(),
    });
    alert('Mega pass purchased!');
    window.location.reload();
  };

  const handleJoinEvent = async (eventId) => {
    // Check if user has available entries (weekly) or is mega event
    const weeklySub = subscriptions.find((sub) => sub.plan === 'weekly' && new Date(sub.expires_at) > new Date());
    const megaSub = subscriptions.find((sub) => sub.plan === 'mega' && new Date(sub.expires_at) > new Date());
    if (!weeklySub && !megaSub) {
      alert('You need an active pass to join events.');
      return;
    }
    // Deduct an entry
    if (weeklySub && weeklySub.entries_remaining > 0) {
      await supabase
        .from('subscriptions')
        .update({ entries_remaining: weeklySub.entries_remaining - 1 })
        .eq('id', weeklySub.id);
      navigate(`/game/${eventId}`);
    } else if (megaSub && megaSub.entries_remaining > 0) {
      await supabase
        .from('subscriptions')
        .update({ entries_remaining: megaSub.entries_remaining - 1 })
        .eq('id', megaSub.id);
      navigate(`/game/${eventId}`);
    } else {
      alert('No entries remaining. Purchase a top up.');
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Your Passes</h2>
        {subscriptions.length === 0 && <p className="text-gray-400">You do not have any active passes.</p>}
        {subscriptions.map((sub) => (
          <div key={sub.id} className="flex justify-between items-center text-sm py-2 border-b border-gray-700 last:border-b-0">
            <div>
              <p className="font-semibold">{sub.plan === 'weekly' ? 'Weekly Pass' : 'Mega Pass'}</p>
              <p className="text-gray-400">Entries remaining: {sub.entries_remaining} | Expires: {new Date(sub.expires_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
        <div className="mt-4 space-x-4">
          <button
            onClick={buyWeeklyPass}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Buy Weekly Pass (₹49)
          </button>
          <button
            onClick={buyMegaPass}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Buy Mega Pass (₹499)
          </button>
          {/* Top up button adds extra entries to an existing weekly pass */}
          <button
            onClick={topUpWeeklyPass}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Top Up +3 Entries (₹29)
          </button>
        </div>
      </div>
      <div className="p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Available Events</h2>
        {events.length === 0 && <p className="text-gray-400">No active events. Please check back later.</p>}
        {events.map((event) => (
          <div key={event.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
            <div>
              <p className="font-semibold">{event.name}</p>
              <p className="text-gray-400 text-sm">{new Date(event.scheduled_at).toLocaleString()}</p>
            </div>
            <button
              onClick={() => handleJoinEvent(event.id)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
            >
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;