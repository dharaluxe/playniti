import React, { useEffect, useState, useRef } from 'react';

// TargetGame presents a single target (a coloured circle) that appears at a
// random position within a container.  Each time the player clicks the
// target, the score increases and the target relocates.  The game runs
// for a fixed duration (30 seconds) after which onGameEnd is called
// with the total hits and time elapsed.

const GAME_DURATION_MS = 30000;
const TARGET_SIZE = 50; // pixels

const TargetGame = ({ onGameEnd }) => {
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_MS);

  // Place the target at a random position within the container
  const randomPosition = () => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rect = container.getBoundingClientRect();
    const x = Math.random() * (rect.width - TARGET_SIZE);
    const y = Math.random() * (rect.height - TARGET_SIZE);
    return { x, y };
  };

  useEffect(() => {
    // Start game
    setStartTime(Date.now());
    setPosition(randomPosition());
    // Timer interval to update time left
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setTimeLeft(Math.max(0, GAME_DURATION_MS - elapsed));
      if (elapsed >= GAME_DURATION_MS) {
        clearInterval(interval);
        onGameEnd && onGameEnd({ score, time: GAME_DURATION_MS / 1000 });
      }
    }, 100);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime]);

  const handleClick = () => {
    // Only count hits while game is active
    if (timeLeft > 0) {
      setScore((s) => s + 1);
      setPosition(randomPosition());
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-80 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden"
    >
      {timeLeft > 0 && (
        <div
          onClick={handleClick}
          style={{
            position: 'absolute',
            left: position.x,
            top: position.y,
            width: TARGET_SIZE,
            height: TARGET_SIZE,
            borderRadius: '50%',
            backgroundColor: '#f59e0b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontWeight: 'bold',
          }}
        >
          🎯
        </div>
      )}
      <div className="absolute bottom-0 left-0 p-2 text-sm text-gray-300">
        Hits: {score} | Time left: {(timeLeft / 1000).toFixed(1)}s
      </div>
    </div>
  );
};

export default TargetGame;