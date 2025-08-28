import React from 'react';
import { Link } from 'react-router-dom';
import hero from '../assets/hero-bg.png';

const Home = ({ user }) => {
  return (
    <div className="text-center">
      <div
        className="w-full h-64 md:h-96 bg-cover bg-center flex flex-col justify-center items-center text-white"
        style={{ backgroundImage: `url(${hero})` }}
      >
        <h1 className="text-4xl md:text-6xl font-bold drop-shadow-lg">Playniti</h1>
        <p className="mt-4 text-lg md:text-2xl max-w-lg drop-shadow-lg">
          The ultimate platform for one‑minute skill games.  Compete in daily tournaments, climb
          the leaderboard and earn real rewards.
        </p>
        {user ? (
          <Link
            to="/dashboard"
            className="mt-6 inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full"
          >
            Go to Dashboard
          </Link>
        ) : (
          <div className="mt-6 space-x-4">
            <Link
              to="/signup"
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-full"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-0">
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Weekly Pass</h2>
          <p className="text-gray-300 mb-4">
            For just ₹49 per week, receive seven entries into our quick, one‑minute games.  Play at your own
            pace and aim for the top of the leaderboard.
          </p>
          <ul className="list-disc list-inside text-gray-300">
            <li>7 entries per week</li>
            <li>Dynamic reward distribution</li>
            <li>Burn rule ensures fairness</li>
          </ul>
        </div>
        <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Mega Event</h2>
          <p className="text-gray-300 mb-4">
            Ready for bigger stakes?  Purchase a ₹499 mega pass and compete in an exclusive weekly event.
            Rewards scale with participation and only the top performers earn the pot!
          </p>
          <ul className="list-disc list-inside text-gray-300">
            <li>Single entry into mega event</li>
            <li>Exclusive to mega pass holders</li>
            <li>Rewards scale up to 85% of revenue</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Home;