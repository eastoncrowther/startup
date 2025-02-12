import React from 'react';

export function Game() {
  return (
    <main>
                
        <h1> ROUND 1 OF 5           SECONDS REMAINIG 30</h1>

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
            <button onClick="alert('You chose to confess!')">Confess</button>
            <button onClick="alert('You chose to stay quiet!')">Stay Quiet</button>
        </div>
            
        <h3> YOUR SCORE: 000 </h3>
        <h3> OPPONENT'S SCORE: 000</h3>

    </main>
  );
}