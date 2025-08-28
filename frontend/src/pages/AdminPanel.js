import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

// AdminPanel allows privileged users to manage events and trigger reward
// distribution.  It checks the current user's `is_admin` flag from
// Supabase, displays existing events, provides a form to create new
// events, and offers controls to toggle event activity and distribute
// rewards via an edge function.

const AdminPanel = ({ user }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    description: '',
    scheduled_at: '',
    entry_fee: 49,
    reward_percentage: 0.75,
    game_type: 'snake',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        setIsAdmin(data?.is_admin);
      } catch (err) {
        console.error(err);
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user.id]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('scheduled_at', { ascending: true });
      if (error) setError(error.message);
      setEvents(data || []);
      setLoading(false);
    };
    if (isAdmin) fetchEvents();
  }, [isAdmin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('events').insert({
        name: form.name,
        description: form.description,
        scheduled_at: form.scheduled_at,
        entry_fee: Number(form.entry_fee),
        reward_percentage: Number(form.reward_percentage),
        game_type: form.game_type,
        is_active: true,
      });
      if (error) throw error;
      alert('Event created');
      setForm({ name: '', description: '', scheduled_at: '', entry_fee: 49, reward_percentage: 0.75 });
      // Refresh list
      const { data: updated } = await supabase.from('events').select('*').order('scheduled_at', { ascending: true });
      setEvents(updated || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleEvent = async (id, current) => {
    try {
      await supabase.from('events').update({ is_active: !current }).eq('id', id);
      const { data } = await supabase.from('events').select('*').order('scheduled_at', { ascending: true });
      setEvents(data || []);
    } catch (err) {
      alert('Error updating event');
    }
  };

  const distributeRewards = async (id) => {
    // Calls the edge function updateRewards to distribute rewards for an event
    try {
      const { data, error } = await supabase.functions.invoke('updateRewards', { body: { event_id: id } });
      if (error) throw error;
      alert('Rewards distributed');
    } catch (err) {
      alert('Error distributing rewards: ' + err.message);
    }
  };

  if (!isAdmin) return <p>You do not have permission to view this page.</p>;
  if (loading) return <p>Loading admin panel…</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Admin Panel</h1>
      <section className="mb-8 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Create Event</h2>
        <form onSubmit={createEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Event name" className="p-2 bg-gray-700 text-white rounded" required />
          <input name="scheduled_at" type="datetime-local" value={form.scheduled_at} onChange={handleChange} className="p-2 bg-gray-700 text-white rounded" required />
          <input name="entry_fee" type="number" value={form.entry_fee} onChange={handleChange} step="1" min="0" className="p-2 bg-gray-700 text-white rounded" />
          <input name="reward_percentage" type="number" value={form.reward_percentage} onChange={handleChange} step="0.01" min="0" max="1" className="p-2 bg-gray-700 text-white rounded" />
        <select
          name="game_type"
          value={form.game_type}
          onChange={handleChange}
          className="p-2 bg-gray-700 text-white rounded"
        >
          <option value="snake">Snake</option>
          <option value="reaction">Reaction</option>
          <option value="target">Target</option>
          <option value="color">Colour Match</option>
          <option value="mole">Whack‑a‑Mole</option>
        </select>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="p-2 bg-gray-700 text-white rounded md:col-span-2"
        ></textarea>
        <div className="md:col-span-2 text-right">
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            Create
          </button>
        </div>
        </form>
      </section>
      <section className="p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Events</h2>
        {events.length === 0 && <p>No events created yet.</p>}
        {events.map((evt) => (
          <div key={evt.id} className="border-b border-gray-700 py-3 flex justify-between items-center">
            <div>
              <p className="font-semibold">{evt.name}</p>
              <p className="text-sm text-gray-400">Scheduled: {new Date(evt.scheduled_at).toLocaleString()}</p>
              <p className="text-sm text-gray-400">Entry fee: ₹{evt.entry_fee} | Reward %: {Math.round(evt.reward_percentage * 100)}%</p>
              <p className="text-sm text-gray-400">Game: {evt.game_type}</p>
              <p className="text-sm text-gray-400">Status: {evt.is_active ? 'Active' : 'Inactive'}</p>
            </div>
            <div className="space-x-2">
              <button onClick={() => toggleEvent(evt.id, evt.is_active)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                {evt.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => distributeRewards(evt.id)} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded">
                Distribute Rewards
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default AdminPanel;