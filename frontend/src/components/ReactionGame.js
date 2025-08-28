import React, { useState, useEffect } from 'react';

// ReactionGame displays a screen that turns from red to green after a random
// delay.  The player must click as quickly as possible once it turns green.
// The time between the colour change and the click is recorded as the
// reaction time.  A lower reaction time yields a higher score.  Once a
// reaction is recorded the game ends and onGameEnd is called.

const ReactionGame = ({ onGameEnd }) => {
  const [phase, setPhase] = useState('idle'); // idle, waiting, ready, done
  const [startTime, setStartTime] = useState(null);
  const [message, setMessage] = useState('Click to start');
  const [bgColor, setBgColor] = useState('#991b1b');

  useEffect(() => {
    let timer;
    if (phase === 'waiting') {
      // Random delay between 1 and 3 seconds
      const delay = Math.random() * 2000 + 1000;
      timer = setTimeout(() => {
        setBgColor('#166534');
        setMessage('Click!');
        setStartTime(Date.now());
        setPhase('ready');
      }, delay);
    }
    return () => clearTimeout(timer);
  }, [phase]);

  const handleClick = () => {
    if (phase === 'idle') {
      setPhase('waiting');
      setMessage('Wait for green…');
      setBgColor('#991b1b');
    } else if (phase === 'ready') {
      const end = Date.now();
      const reaction = end - startTime;
      setPhase('done');
      setMessage(`Reaction time: ${reaction} ms`);
      // Score inversely proportional to reaction time (max 1000 points)
      const score = Math.max(0, 1000 - reaction);
      onGameEnd && onGameEnd({ score, time: reaction / 1000 });
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer flex items-center justify-center text-white text-2xl font-bold"
      style={{ width: '100%', height: '300px', backgroundColor: bgColor, borderRadius: '0.5rem' }}
    >
      {message}
    </div>
  );
};

export default ReactionGame;