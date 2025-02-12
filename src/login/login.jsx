import React from 'react';


export function Login() {
  return (
    <main className="container mt-4">
        <h2>Welcome to the Prisoner's Dilemma!</h2>
        <form method="get" action="game.html">
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
        </form>
    </main>
  );
}