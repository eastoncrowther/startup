import React from 'react';
import './scores.css';

export function Scores() {
  return (
    <main>
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
          <tr>
            <td>1</td>
            <td>도윤 이</td>
            <td>5</td>
            <td>Annie James</td>
            <td>37</td>
            <td>May 20, 2024</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Annie James</td>
            <td>25</td>
            <td>Trudy Williams</td>
            <td>25</td>
            <td>June 2, 2024</td>
          </tr>
        </tbody>
      </table>
      <div>30 degrees and sunny</div>
    </main>
  );
}