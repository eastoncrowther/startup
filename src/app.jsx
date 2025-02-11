import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  return <div className='body bg-dark text-light'>
    <header class="container">
            <h1 class="text-center">Prisoner's Dilemma</h1>

            <nav class="navbar navbar-expand-lg navbar-light bg-light">
                <div class="container-fluid">
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav">
                            <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
                            <li class="nav-item"><a class="nav-link" href="game.html">Play</a></li>
                            <li class="nav-item"><a class="nav-link" href="scores.html">Score Board</a></li>
                            <li class="nav-item"><a class="nav-link" href="about.html">Info</a></li>
                        </ul>
                    </div>
                </div>
            </nav>
        </header>

        <main>App components go here</main>

        <footer class="text-center mt-4">
            <span class="text-reset">Easton Crowther</span>
            <a href="https://github.com/eastoncrowther/startup.git">GitHub</a>
        </footer>
  </div>;
}