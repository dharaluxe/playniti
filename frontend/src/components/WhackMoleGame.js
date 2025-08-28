import React, { useEffect, useState } from 'react';

// WhackMoleGame is a reflex training game similar to whack‑a‑mole. A 3×3
// grid of squares is presented. One square lights up at a time; the
// player must click the highlighted square to score a point. After each
// successful hit the target moves to a new random square. The game
// runs on a timer (30 seconds) and calls onGameEnd with the total
// number of hits and the duration when finished.

const GRID_SIZE = 3;
const GAME_DURATION_MS = 30000;
const MOLE_DURATION_MS = 800; // how long each mole stays before moving

const WhackMoleGame = ({ onGameEnd }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_MS);
  const [startTime, setStartTime] = useState(Date.now());

  // Pick a new random hole index (0–8)
  const randomHole = () => Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);

  useEffect(() => {
    // On mount, start the timer and mole movement
    setStartTime(Date.now());
    setActiveIndex(randomHole());
    const moleInterval = setInterval(() => {
      setActiveIndex(randomHole());
    }, MOLE_DURATION_MS);
    const timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, GAME_DURATION_MS - elapsed);
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(moleInterval);
        clearInterval(timerInterval);
        onGameEnd && onGameEnd({ score, time: GAME_DURATION_MS / 1000 });
      }
    }, 100);
    return () => {
      clearInterval(moleInterval);
      clearInterval(timerInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime]);

  const handleClick = (index) => {
    if (timeLeft <= 0) return;
    if (index === activeIndex) {
      setScore((s) => s + 1);
      // Immediately move mole to new location on successful hit
      setActiveIndex(randomHole());
    }
  };

  // Render grid cells
  const cells = [];
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const isActive = i === activeIndex;
    cells.push(
      <div
        key={i}
        onClick={() => handleClick(i)}
        className={`flex items-center justify-center border border-gray-700 cursor-pointer select-none`}
        style={{
          width: `${100 / GRID_SIZE}%`,
          height: `${100 / GRID_SIZE}%`,
          backgroundColor: isActive ? '#84cc16' : '#1f2937',
          transition: 'background-color 0.1s',
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-2 text-gray-300 text-center">Score: {score} | Time left: {(timeLeft / 1000).toFixed(1)}s</div>
      <div className="w-full h-64 bg-gray-800 rounded overflow-hidden flex flex-wrap">
        {cells}
      </div>
    </div>
  );
};

export default WhackMoleGame;