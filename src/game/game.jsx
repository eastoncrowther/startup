import React, { useState, useEffect, useRef } from 'react';
import './game.css';

export function Game({ userName }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(5);
  const [yourScore, setYourScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [displayedYourScore, setDisplayedYourScore] = useState(0);
  const [displayedOpponentScore, setDisplayedOpponentScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [opponentName, setOpponentName] = useState('Opponent');
  

  const socket = useRef(null);
  const scoreSaved = useRef(false);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    socket.current = new WebSocket(`${protocol}://${window.location.hostname}:4000`);
  
    socket.current.onopen = () => {
      socket.current.send(JSON.stringify({ type: 'join', userName }));
    };

    socket.current.onmessage = (event) => {
      const msg = JSON.parse(event.data);
  
      if (msg.type === 'start') {
        setOpponentName(msg.opponentName);
        console.log(msg.opponentName)
        setGameStarted(true);
      } else if (msg.type === 'result') {
        setDisplayedYourScore(prev => prev + msg.yourScore);
        setDisplayedOpponentScore(prev => prev + msg.opponentScore);
        // Continue to next round
        setTimeout(() => {
          setRound(r => r + 1);
          setTimeLeft(5);
          setHasSubmitted(false);
        }, 1000);
      } else if (msg.type === 'opponent_left') {
        alert("Your opponent has disconnected.");
        setGameOver(true);
      }
    };
  
    return () => {
      socket.current?.close();
    };
  }, []);

  // Countdown Timer Effect
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setDisplayedYourScore(yourScore);
      setDisplayedOpponentScore(opponentScore);
    
      if (round < 5) {
        setTimeout(() => {
          setRound(round + 1);
          setTimeLeft(5);
          setHasSubmitted(false);
        }, 1000);
      } else {
        if (!scoreSaved.current) {
          setGameOver(true);
          saveScore(displayedYourScore, displayedOpponentScore); 
          scoreSaved.current = true; 
        }
      }
    }
  }, [timeLeft, gameStarted, gameOver]);

  // Handle Player Choice
  const handleChoice = (playerChoice) => {
    if (!gameStarted || hasSubmitted) return;
  
    socket.current.send(JSON.stringify({ type: 'choice', choice: playerChoice }));
    setHasSubmitted(true);
  };

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setRound(1);
    setTimeLeft(5);
    setYourScore(0);
    setOpponentScore(0);
    setDisplayedYourScore(0);
    setDisplayedOpponentScore(0);
    setGameOver(false);
    setHasSubmitted(false);
    scoreSaved.current = false;
  };

  async function saveScore(finalYourScore, finalOpponentScore) {
    console.log('saveScore called with:', finalYourScore, finalOpponentScore);
    const date = new Date().toLocaleString();
  
    const [user1Name, user2Name] = [userName, opponentName].sort();
    const user1Score = user1Name === userName ? finalYourScore : finalOpponentScore;
    const user2Score = user2Name === opponentName ? finalOpponentScore : finalYourScore;
  
    console.log('userName:', userName, 'user1Name:', user1Name);
    if (userName === user1Name) {
      const newScore = {
        user1Name,
        user1Score,
        user2Name,
        user2Score,
        date,
      };
  
      await fetch('/api/score', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(newScore),
        credentials: 'include',
      });
    }
  }
  


  return (
    <main>
      {!gameStarted ? (
        <>
          <h1>Welcome, {userName}!</h1>
          <p>Waiting for an opponent to join...</p>
        </>
      ) : gameOver ? (
        <>
          <h2>Game Over! Final Score: {userName}: {yourScore} - {opponentName}: {opponentScore}</h2>
          <button onClick={startGame} className="restart-button">Restart Game</button>
        </>
      ) : (
        <>
          <h1>ROUND {round} OF 5 — SECONDS REMAINING: {timeLeft}</h1>
          <progress value={timeLeft} max="5" className="timer-bar"></progress>

          <h2>Choose Your Strategy</h2>
          <p>Decide whether to confess or stay quiet. The points earned depend on both players' choices:</p>

          <table className="outcome-table">
            <thead>
              <tr>
                <th></th>
                <th>Opponent Confesses</th>
                <th>Opponent Stays Quiet</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>You Confess</th>
                <td>Both: 5 points</td>
                <td>You: 0, Opponent: 8</td>
              </tr>
              <tr>
                <th>You Stay Quiet</th>
                <td>You: 8, Opponent: 0</td>
                <td>Both: 1 point</td>
              </tr>
            </tbody>
          </table>

          <div>
            <button onClick={() => handleChoice("confess")} disabled={hasSubmitted}>Confess</button>
            <button onClick={() => handleChoice("quiet")} disabled={hasSubmitted}>Stay Quiet</button>
          </div>

          {/* Scores always visible but update only after round ends */}
          <h3>YOUR SCORE: {displayedYourScore}</h3>
          <h3>{(opponentName || 'Opponent').toUpperCase()}'S SCORE: {displayedOpponentScore}</h3>
        </>
      )}
    </main>
  );
}




