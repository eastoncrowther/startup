import React, { useState, useEffect } from 'react';
import './game.css';

export function Game({ userName }) {
    const [gameStarted, setGameStarted] = useState(false);
    const [round, setRound] = useState(1);
    const [timeLeft, setTimeLeft] = useState(5);
    const [yourScore, setYourScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);
    const [displayedYourScore, setDisplayedYourScore] = useState(0); // Stores the last updated score
    const [displayedOpponentScore, setDisplayedOpponentScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

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
                setGameOver(true);
                // Store the scores in local storage
                const date = new Date().toLocaleDateString();
                const newScore = {
                    user1Name: userName,
                    user1Score: yourScore,
                    user2Name: 'bot',
                    user2Score: opponentScore,
                    date: date
                };

                // Retrieve existing scores or initialize an empty array
                const existingScores = JSON.parse(localStorage.getItem('scores')) || [];
                
                // Append the new score
                existingScores.push(newScore);

                // Save back to local storage
                localStorage.setItem('scores', JSON.stringify(existingScores));
            }
        }
    }, [timeLeft, gameStarted, gameOver]);

    // Handle Player Choice
    const handleChoice = (playerChoice) => {
        if (!gameStarted || hasSubmitted) return;

        const opponentChoice = Math.random() < 0.5 ? "confess" : "quiet";

        let newYourScore = yourScore;
        let newOpponentScore = opponentScore;

        if (playerChoice === "confess" && opponentChoice === "confess") {
            newYourScore += 5;
            newOpponentScore += 5;
        } else if (playerChoice === "confess" && opponentChoice === "quiet") {
            newOpponentScore += 8;
        } else if (playerChoice === "quiet" && opponentChoice === "confess") {
            newYourScore += 8;
        } else {
            newYourScore += 1;
            newOpponentScore += 1;
        }

        setYourScore(newYourScore);
        setOpponentScore(newOpponentScore);
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
    };

    return (
        <main>
            {!gameStarted ? (
                <>
                    <h1>Welcome, {userName}!</h1>
                    <button onClick={startGame} className="start-button">
                        Start Game
                    </button>
                </>
            ) : gameOver ? (
                <>
                    <h2>Game Over! Final Score: {userName}: {displayedYourScore} - Opponent {displayedOpponentScore}</h2>
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
                    <h3>OPPONENT'S SCORE: {displayedOpponentScore}</h3>
                </>
            )}
        </main>
    );
}



