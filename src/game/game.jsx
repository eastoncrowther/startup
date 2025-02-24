import React, { useState, useEffect } from 'react';
import './game.css'

export function Game() {
    const [round, setRound] = useState(1);
    const [timeLeft, setTimeLeft] = useState(30);
    const [yourScore, setYourScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);


    // Countdown timer
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (round < 5) {
            setRound(round + 1);
            setTimeLeft(30);
        } else {
            setGameOver(true);
        }
    }, [timeLeft, round]);


    // Handle Player Choice
    const handleChoice = (playerChoice) => {
        const opponentChoice = Math.random() < 0.5 ? "confess" : "quiet";

        let newYourScore = yourScore;
        let newOpponentScore = opponentScore;

        if (playerChoice === "confess" && opponentChoice === "confess") {
            newYourScore += 5;
            newOpponentScore += 5;
        } else if (playerChoice === "confess" && opponentChoice === "quiet") {
            // only your opponent scores points
            newOpponentScore += 8;
        } else if (playerChoice === "quiet" && opponentChoice === "confess") {
            // only you score points
            newYourScore += 8;
        } else if (playerChoice === "quiet" && opponentChoice === "quiet") {
            newYourScore += 1;
            newOpponentScore += 1;
        }

        setYourScore(newYourScore);
        setOpponentScore(newOpponentScore);
    };

    const restartGame = () => {
        setRound(1);
        setTimeLeft(30);
        setYourScore(0);
        setOpponentScore(0);
        setGameOver(false);
    }

    return (
        <main>
          <h1>ROUND {round} OF 5 — SECONDS REMAINING: {timeLeft}</h1>
    
          {/* Countdown Visual */}
          <progress value={timeLeft} max="30" className="timer-bar"></progress>
    
          {gameOver ? (
            <>
              <h2>Game Over! Final Score: You {yourScore} - Opponent {opponentScore}</h2>
              <button onClick={restartGame} className="restart-button">Play Again</button>
            </>
          ) : (
            <>
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
                <button onClick={() => handleChoice("confess")}>Confess</button>
                <button onClick={() => handleChoice("quiet")}>Stay Quiet</button>
              </div>
    
              <h3>YOUR SCORE: {yourScore}</h3>
              <h3>OPPONENT'S SCORE: {opponentScore}</h3>
            </>
          )}
        </main>
      );
}