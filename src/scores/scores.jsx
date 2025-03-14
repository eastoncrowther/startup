import React from 'react';
import './scores.css';

export function Scores() {
  const [scores, setScores] = React.useState([]);

  React.useEffect(() => {
    fetch('/api/scores', { credentials: 'include' }) 
      .then((response) => response.json())
      .then((scores) => setScores(scores))
      .catch((error) => console.error('Error fetching scores:', error));
  }, []);
  
  const clearScores = () => {
    fetch('/api/scores', { method: 'DELETE', credentials: 'include' }) 
      .then(() => setScores([]))
      .catch((error) => console.error('Error clearing scores:', error));
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

