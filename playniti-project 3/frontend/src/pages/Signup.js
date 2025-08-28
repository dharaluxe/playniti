import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });
    if (signUpError) {
      setError(signUpError.message);
    } else {
      // Create corresponding user record in users table
      await supabase.from('users').insert({ id: data.user.id, email, username, is_admin: false });
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Create an Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          />
        </div>
        <div>
          <label className="block mb-1" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          />
        </div>
        <div>
          <label className="block mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 bg-gray-700 text-white rounded"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded"
        >
          {loading ? 'Creating account…' : 'Sign Up'}
        </button>
        <p className="text-sm text-gray-400 text-center">
          Already have an account? <Link to="/login" className="text-purple-500 hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;