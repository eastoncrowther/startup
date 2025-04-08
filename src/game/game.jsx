import React, { useState, useEffect, useRef } from 'react';
import './game.css';

export function Game({ userName }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(5);
  const [yourScore, setYourScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
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
      console.log('Received WS message:', msg);
  
      if (msg.type === 'start') {
        setOpponentName(msg.opponentName || 'Opponent'); 
        console.log('Game started against:', msg.opponentName);
        setGameStarted(true);
        setRound(1); 
        setTimeLeft(5); 
        setYourScore(0);
        setOpponentScore(0);
        setGameOver(false);
        setHasSubmitted(false);
        scoreSaved.current = false;

      } else if (msg.type === 'result') {
        // Update scores based on the result message
        setYourScore(prev => prev + msg.yourScore);
        setOpponentScore(prev => prev + msg.opponentScore);
        setTimeLeft(5);
        setHasSubmitted(false);
         if (msg.round < 5) { 
             setRound(prevRound => prevRound + 1);
         }
      } else if (msg.type === 'game_over') {
        console.log('Processing game_over message'); 
        setYourScore(msg.yourTotal); 
        setOpponentScore(msg.opponentTotal);
        setGameOver(true);
        // add save scores logic here
        saveScore(userName, yourScore, opponentName, opponentScore)
  
      } else if (msg.type === 'opponent_left') {
        alert("Your opponent has disconnected.");
        setGameOver(true);
      }
    };
  
    return () => {
      socket.current?.close();
    };
  }, []);

  async function saveScore(player1, player1Score, player2, player2Score) {
    const date = new Date().toLocaleString();

    const newScore = {
      user1Name: player1,
      user1Score: player1Score,
      user2Name: player2,
      player2Score: player2Score,
      date
    };
    
    await fetch('/api/score', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newScore),
      credentials: 'include',
    });    
  }

  // Countdown Timer Effect
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // default choice
      if (!hasSubmitted) {
        handleChoice("quiet");
      }
      setHasSubmitted(true);
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
    setGameStarted(false);
    setGameOver(false);
     // Crucially, tell the backend we want to join again
    if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({ type: 'join', userName }));
    } else {
        // Handle case where socket might be closed (optional, depends on desired robustness)
        console.error("WebSocket connection is not open. Cannot restart game.");
        // You might want to re-initialize the WebSocket connection here if it closed.
    }
  };

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
          <h3>YOUR SCORE: {yourScore}</h3>
          <h3>{(opponentName || 'Opponent').toUpperCase()}'S SCORE: {opponentScore}</h3>
        </>
      )}
    </main>
  );
}




