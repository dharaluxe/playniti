import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ColorMatchGame from '../components/ColorMatchGame';

/**
 * DemoGame
 *
 * This page renders a free demo of the colour‑matching game so that
 * prospective players can get a feel for the gameplay without signing in.
 * It does not record scores to the database and therefore does not
 * require a user session.  After the game completes it presents the
 * result and encourages the user to sign up or return to the home page.
 */
const DemoGame = () => {
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleGameEnd = ({ score, time }) => {
    setResult({ score, time });
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Play Demo</h1>
      {!result ? (
        <div>
          <p className="mb-4 text-gray-300 text-center">
            Try our colour‑matching game for free!  Click the button whose colour
            matches the word.  You have 30 seconds—good luck!
          </p>
          {/* Render the demo game component */}
          <ColorMatchGame onGameEnd={handleGameEnd} />
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Demo Finished!</h2>
          <p className="mb-2">
            Your score: <span className="font-bold">{result.score}</span>
          </p>
          <p className="mb-4">
            Time taken: {result.time.toFixed(1)}s
          </p>
          <p className="mb-6 text-green-500">
            Enjoyed the demo?  Sign up to compete in real tournaments and earn
            rewards!
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/signup')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Sign Up
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoGame;