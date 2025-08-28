import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
  return (
    <nav className="bg-gray-900 text-white py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="text-xl font-bold">
          <Link to="/">Playniti</Link>
        </div>
        <div className="flex space-x-4">
          <Link to="/" className="hover:text-purple-400">Home</Link>
          <Link to="/leaderboard" className="hover:text-purple-400">Leaderboard</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-purple-400">Dashboard</Link>
              {user?.user_metadata?.is_admin && (
                <Link to="/admin" className="hover:text-purple-400">Admin</Link>
              )}
              <button
                onClick={handleSignOut}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-purple-400">Login</Link>
              <Link to="/signup" className="hover:text-purple-400">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;