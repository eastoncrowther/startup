import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Game } from './game/game';
import { Scores } from './scores/scores';
import { About } from './about/about';



export default function App() {
  return (
    <BrowserRouter>
        <div className='body bg-dark text-light'>
            <header class="container">
                    <h1 class="text-center">Prisoner's Dilemma</h1>

                    <nav class="navbar navbar-expand-lg navbar-light bg-light">
                        <div class="container-fluid">
                            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                                <span class="navbar-toggler-icon"></span>
                            </button>
                            <div class="collapse navbar-collapse" id="navbarNav">
                                <ul class="navbar-nav">
                                    <li class="nav-item"><NavLink className = 'nav-link' to = ''>Login</NavLink></li>
                                    <li class="nav-item"><NavLink className = 'nav-link' to = 'game'>Play</NavLink></li>
                                    <li class="nav-item"><NavLink className = 'nav-link' to = 'scores'>Scores</NavLink></li>
                                    <li class="nav-item"><NavLink className = 'nav-link' to = 'about'>About</NavLink></li>
                                </ul>
                            </div>
                        </div>
                    </nav>
            </header>

            <Routes>
                <Route path='/' element={<Login />} exact />
                <Route path='/game' element={<Game />} />
                <Route path='/scores' element={<Scores />} />
                <Route path='/about' element={<About />} />
                <Route path='*' element={<NotFound />} />
            </Routes>


            <footer class="text-center mt-4">
                <span class="text-reset">Easton Crowther</span>
                <a href="https://github.com/eastoncrowther/startup.git">GitHub</a>
            </footer>
        </div>
    </BrowserRouter>
  );
}
function NotFound() {
    return <main className='container-fluid bg-secondary text-center'>404: Return to sender. Address unknown.</main>;
}