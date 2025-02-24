import React, {useState, useEffect} from 'react';
import './about.css';

export function About() {
  const [temp, setTemp] = useState('loading...');
  const [weather, setWeather] = useState('loading...');

  useEffect(() => {
    setTemp('40 degrees');
    setWeather('Sunny');
  }, []);

  return (
    <main>
        <div id="picture" className="picture-box"><img width="400px" src="prison.png" alt="random" /></div>

        <p>
            The Prisoner's Dilemma is a timeless problem in game theory that challenges players to make strategic decisions. 
            Two players must choose between confessing or staying silent. If both confess, they each earn 5 points. 
            If one confesses while the other remains silent, the confessor earns no points, while the silent player earns 8 points. 
            However, if both choose to stay silent, they each earn just 1 point.
        </p>

        <p>
            The Prisoner's Dilemma is a fascinating concept. While both players confessing yields the highest combined points, 
            each player is personally incentivized to stay silent to avoid losing significantly if their opponent chooses to confess. 
            The dilemma becomes far more intriguing in repeated interactions. In a single round, the stakes are straightforward, 
            but when players face each other repeatedly, consistently staying silent proves far less effective than building enough trust to cooperate by confessing 
        </p>

        <div className = 'temp-red'>{temp}</div>
        <div className = 'weather-red'>{weather}</div>
    </main>
  );
}