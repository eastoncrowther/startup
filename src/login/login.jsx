import React from 'react';

import { Authenticated } from './authenticated';
import { AuthState } from './authState'

export function Login({ userName, authState, onAuthChange }) {
  return (
    <main className="container mt-4">
        {authState !== AuthState.Unknown && <h2>Welcome to the Prisoner's Dilemma!</h2>}
        {authState === AuthState.Authenticated && (
          <Authenticated userName = {userName} onLogout = {() => onAuthChange(userName, AuthState.Unauthenticated)} />
        )}

        
      
        {/* <form method="get" action="game.html">
            <div className="mb-3">
                <label htmlFor="username" className="form-label">Enter Username:</label>
                <input type="text" className="form-control" id="username" name="username" placeholder="Username" />
            </div>
            <div className="mb-3">
                <label htmlFor="password" className="form-label">Enter Password:</label>
                <input type="password" className="form-control" id="password" name="password" placeholder="Password" />
            </div>
            <button type="submit" className="btn btn-primary">Create</button>
            <button type="submit" className="btn btn-secondary">Login</button>
        </form> */}
    </main>
  );
}