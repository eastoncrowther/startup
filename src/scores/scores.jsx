import React from 'react';
import './scores.css';

export function Scores() {
  const [scores, setScores] = React.useState([]);

  React.useEffect(() => {
    const scoresText = localStorage.getItem('scores');
    if (scoresText) {
      setScores(JSON.parse(scoresText));
    }
  }, []);

  // Function to clear scores
  const clearScores = () => {
    localStorage.removeItem('scores'); // Clear stored scores
    setScores([]); // Update UI
  };

  return (
    <main>
      <button onClick={clearScores} className="clear-button">
        Clear Scores
      </button>

      <table className='scores-table'>
        <thead>
          <tr>
            <th>#</th>
            <th>Player 1</th>
            <th>Score</th>
            <th>Player 2</th>
            <th>Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {scores.length ? (
            scores.map((score, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{score.user1Name}</td>
                <td>{score.user1Score}</td>
                <td>{score.user2Name}</td>
                <td>{score.user2Score}</td>
                <td>{score.date}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">Be the first to score!</td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}

