import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameCanvas from '../components/GameCanvas';
import ReactionGame from '../components/ReactionGame';
import TargetGame from '../components/TargetGame';
import ColorMatchGame from '../components/ColorMatchGame';
import WhackMoleGame from '../components/WhackMoleGame';
import { supabase } from '../supabaseClient';

// Game page
// This component renders a single event game.  It loads the event details
// from Supabase based on the `eventId` route parameter and displays a
// GameCanvas.  When the game completes it records the player's score
// and time in the matches table.  Afterwards it displays a summary and
// provides navigation back to the dashboard or leaderboard.

const Game = ({ user }) => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      if (error) setError(error.message);
      else setEvent(data);
      setLoading(false);
    };
    if (eventId) fetchEvent();
  }, [eventId]);

  const handleGameEnd = async ({ score, time }) => {
    // Called when GameCanvas finishes.  Insert match record and
    // capture result for UI.
    try {
      await supabase.from('matches').insert({
        event_id: eventId,
        user_id: user.id,
        score,
        time_taken: time,
      });
      setResult({ score, time });
    } catch (err) {
      console.error(err);
      setError('Failed to record your result.');
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!event) return <p>No event found.</p>;

  // Determine which game component to render based on the event's game_type.
  const gameType = event.game_type || 'snake';
  let GameComponent;
  switch (gameType) {
    case 'reaction':
      GameComponent = ReactionGame;
      break;
    case 'target':
      GameComponent = TargetGame;
      break;
    case 'color':
      GameComponent = ColorMatchGame;
      break;
    case 'mole':
      GameComponent = WhackMoleGame;
      break;
    default:
      GameComponent = GameCanvas;
      break;
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
      <p className="text-gray-400 mb-4">Scheduled at: {new Date(event.scheduled_at).toLocaleString()}</p>
      {!result ? (
        <div>
          {/* Display instructions depending on game type */}
          {gameType === 'snake' && (
            <p className="mb-2">
              Use the arrow keys to control the snake.  Eat food to score points.  Avoid hitting the walls or yourself.  You have 60 seconds!
            </p>
          )}
          {gameType === 'reaction' && (
            <p className="mb-2">
              Wait for the box to turn green, then click as quickly as possible.  Your reaction time determines your score!
            </p>
          )}
          {gameType === 'target' && (
            <p className="mb-2">
              Click the target as many times as you can in 30 seconds.  Each hit moves the target to a new location.
            </p>
          )}
          {gameType === 'color' && (
            <p className="mb-2">
              Match the colour of the text by clicking the correct coloured button.  You have 30 seconds!
            </p>
          )}
          {gameType === 'mole' && (
            <p className="mb-2">
              Click the highlighted square as quickly as you can. Each hit moves the highlight. Keep up for 30 seconds!
            </p>
          )}
          {/* Render the appropriate game component */}
          {gameType === 'snake' ? (
            <GameCanvas width={400} height={400} onGameEnd={handleGameEnd} />
          ) : (
            <GameComponent onGameEnd={handleGameEnd} />
          )}
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Game Finished!</h2>
          <p className="mb-2">Your score: <span className="font-bold">{result.score}</span></p>
          <p className="mb-4">Time taken: {result.time.toFixed(1)}s</p>
          <p className="mb-6 text-green-500">Your result has been recorded.  Good luck!</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded"
            >
              View Leaderboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;