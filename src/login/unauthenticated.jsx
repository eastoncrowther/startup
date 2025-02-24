import React from 'react';

import Button from 'react-bootstrap/Button';
// import { MessageDialog } from './messageDialog';

export function Unauthenticated(props) {
  const [userName, setUserName] = React.useState(props.userName);
  const [password, setPassword] = React.useState('');
  const [displayError, setDisplayError] = React.useState(null);

  async function loginUser() {
    localStorage.setItem('userName', userName);
    props.onLogin(userName);
  }

  async function createUser() {
    localStorage.setItem('userName', userName);
    props.onLogin(userName);
  }

  return (
    <>
        <div className="mb-3">
            <label htmlFor="username" className="form-label">Enter Username:</label>
            <input type="text" className="form-control" value = {userName} onChange={(e) => setUserName(e.target.value)} placeholder="Username" />
        </div>
        <div className="mb-3">
            <label htmlFor="password" className="form-label">Enter Password:</label>
            <input type="password" className="form-control" onChange ={(e) => setPassword(e.target.value)} placeholder="Password" />

            <Button variant='primary' onClick={() => loginUser()} disabled={!userName || !password}>
                Login
            </Button>
            <Button variant='secondary' onClick={() => createUser()} disabled={!userName || !password}>
                Create
            </Button>
        </div>
        
        {/* <MessageDialog message={displayError} onHide={() => setDisplayError(null)} /> */}
    </>
  );
}
