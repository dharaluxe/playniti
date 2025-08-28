import React, { useRef, useEffect, useState } from 'react';

// GameCanvas implements a simple snake game played on an HTML5 canvas.  The
// player uses arrow keys to direct the snake.  Each time the snake eats
// food the score increases.  The game ends if the snake collides with
// itself or the wall, or after 60 seconds have elapsed.  When the game
// ends the onGameEnd callback is invoked with the final score and time
// taken.

const GRID_SIZE = 20;
const INITIAL_SPEED = 150; // milliseconds between moves
const GAME_DURATION = 60; // seconds

const randomPosition = (max) => Math.floor(Math.random() * max);

const GameCanvas = ({ width = 400, height = 400, onGameEnd }) => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([[5, 5], [4, 5], [3, 5]]);
  const [direction, setDirection] = useState('RIGHT');
  const [food, setFood] = useState([randomPosition(width / GRID_SIZE), randomPosition(height / GRID_SIZE)]);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [gameOver, setGameOver] = useState(false);

  // Handle keyboard events
  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [direction]);

  // Game loop
  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setSnake((prev) => {
        const head = [...prev[0]];
        switch (direction) {
          case 'UP': head[1] -= 1; break;
          case 'DOWN': head[1] += 1; break;
          case 'LEFT': head[0] -= 1; break;
          case 'RIGHT': head[0] += 1; break;
          default: break;
        }
        // Check collisions with walls
        if (head[0] < 0 || head[1] < 0 || head[0] >= width / GRID_SIZE || head[1] >= height / GRID_SIZE) {
          setGameOver(true);
          return prev;
        }
        // Check collisions with self
        for (let segment of prev) {
          if (segment[0] === head[0] && segment[1] === head[1]) {
            setGameOver(true);
            return prev;
          }
        }
        const newSnake = [head, ...prev];
        // Check food
        if (head[0] === food[0] && head[1] === food[1]) {
          setScore((s) => s + 1);
          setFood([randomPosition(width / GRID_SIZE), randomPosition(height / GRID_SIZE)]);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
      // Check time expiration
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= GAME_DURATION) {
        setGameOver(true);
      }
    }, INITIAL_SPEED);
    return () => clearInterval(interval);
  }, [direction, food, gameOver, startTime, width, height]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);
    // Draw snake
    ctx.fillStyle = '#c77dff';
    snake.forEach(([x, y]) => {
      ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
    });
    // Draw food
    ctx.fillStyle = '#f2545b';
    ctx.fillRect(food[0] * GRID_SIZE, food[1] * GRID_SIZE, GRID_SIZE - 1, GRID_SIZE - 1);
  }, [snake, food, width, height]);

  // When gameOver changes to true, call onGameEnd
  useEffect(() => {
    if (gameOver) {
      const elapsed = (Date.now() - startTime) / 1000;
      onGameEnd && onGameEnd({ score, time: elapsed });
    }
  }, [gameOver, onGameEnd, score, startTime]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={width} height={height} className="border border-gray-700" />
      <div className="mt-2 text-sm">Score: {score} &bull; Time left: {Math.max(0, Math.floor(GAME_DURATION - (Date.now() - startTime) / 1000))}s</div>
      {gameOver && <div className="mt-2 text-lg text-red-500">Game Over</div>}
    </div>
  );
};

export default GameCanvas;