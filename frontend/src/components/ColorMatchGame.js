import React, { useEffect, useState } from 'react';

// ColorMatchGame presents the player with a colour word rendered in a
// particular colour.  The player must click the button whose colour
// matches the colour of the text (not the word itself).  Each correct
// match increases the score.  The game is time limited (30 seconds)
// after which onGameEnd is called with the total score.

const colours = [
  { name: 'Red', value: '#dc2626' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Yellow', value: '#ca8a04' },
];

const GAME_TIME_MS = 30000;

const ColorMatchGame = ({ onGameEnd }) => {
  const [current, setCurrent] = useState({ word: 'Red', colour: colours[0] });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_MS);
  const [startTime, setStartTime] = useState(Date.now());

  // Start a timer on mount
  useEffect(() => {
    setStartTime(Date.now());
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, GAME_TIME_MS - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        onGameEnd && onGameEnd({ score, time: GAME_TIME_MS / 1000 });
      }
    }, 100);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime]);

  // Choose a new random colour/word combination
  const nextRound = () => {
    const wordIndex = Math.floor(Math.random() * colours.length);
    const colourIndex = Math.floor(Math.random() * colours.length);
    setCurrent({ word: colours[wordIndex].name, colour: colours[colourIndex] });
  };

  const handleClick = (clicked) => {
    if (timeLeft <= 0) return;
    if (clicked.value === current.colour.value) {
      setScore((s) => s + 1);
    }
    nextRound();
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg text-center">
      <div className="mb-4">
        <p className="text-xl font-bold" style={{ color: current.colour.value }}>
          {current.word}
        </p>
        <p className="text-sm text-gray-400">Select the button matching the colour above</p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {colours.map((c) => (
          <button
            key={c.name}
            onClick={() => handleClick(c)}
            style={{ backgroundColor: c.value }}
            className="py-2 rounded text-gray-200 font-bold hover:opacity-80"
          >
            {c.name}
          </button>
        ))}
      </div>
      <p className="text-gray-300 text-sm">Score: {score} | Time left: {(timeLeft / 1000).toFixed(1)}s</p>
    </div>
  );
};

export default ColorMatchGame;