import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Game } from './game/game';
import { Scores } from './scores/scores';
import { About } from './about/about';
import { AuthState } from './login/authState';



export default function App() {
    const [userName, setUserName] = React.useState(localStorage.getItem('userName' || ''));
    const currentAuthState = userName ? AuthState.Authenticated : AuthState.Unauthenticated;
    const [authState, setAuthState] = React.useState(currentAuthState);

  return (
    <BrowserRouter>
        <div className='body bg-dark text-light'>
            <header className="container">
                    <h1 className="text-center">Prisoner's Dilemma</h1>

                    <nav className="navbar navbar-expand-lg navbar-light bg-light">
                        <div className="container-fluid">
                            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                                <span className="navbar-toggler-icon"></span>
                            </button>
                            <div className="collapse navbar-collapse" id="navbarNav">
                                <ul className="navbar-nav">
                                    <li className="nav-item"><NavLink className = 'nav-link' to = ''>Login</NavLink></li>
                                    
                                    {authState === AuthState.Authenticated && (
                                        <li className='nav-item'>
                                        <NavLink className='nav-link' to='game'>Play</NavLink>
                                        </li>
                                    )}
                                    {authState === AuthState.Authenticated && (
                                        <li className='nav-item'>
                                        <NavLink className='nav-link' to='scores'>Scores</NavLink>
                                        </li>
                                    )}

                                    <li className="nav-item"><NavLink className = 'nav-link' to = 'about'>About</NavLink></li>
                                </ul>
                            </div>
                        </div>
                    </nav>
            </header>

            <Routes>
                <Route path='/' element={<Login
                    userName = {userName}
                    authState = {authState}
                    onAuthChange = { (userName, authState) => {
                        setAuthState(authState);
                        setUserName(userName);
                    }}
                />} exact />
                <Route path='/game' element={<Game />} />
                <Route path='/scores' element={<Scores />} />
                <Route path='/about' element={<About />} />
                <Route path='*' element={<NotFound />} />
            </Routes>


            <footer>
                <span>Easton Crowther</span>
                <a href="https://github.com/eastoncrowther/startup.git">GitHub</a>
            </footer>
        </div>
    </BrowserRouter>
  );
}
function NotFound() {
    return <main className='container-fluid bg-secondary text-center'>404: Return to sender. Address unknown.</main>;
}