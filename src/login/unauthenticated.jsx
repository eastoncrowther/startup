import React from 'react';

import Button from 'react-bootstrap/Button';
import { MessageDialog } from './messageDialog';

export function Unauthenticated(props) {
  const [userName, setUserName] = React.useState(props.userName);
  const [password, setPassword] = React.useState('');
  const [displayError, setDisplayError] = React.useState(null);

  async function loginUser() {
    loginOrCreate(`/api/auth/login`);
  }

  async function createUser() {
    loginOrCreate(`/api/auth/create`);
  }

  async function loginOrCreate(endpoint) {
    const res = await fetch(endpoint, {
      method: 'post',
      body: JSON.stringify({ username: userName, password: password }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },

    });
    if (res?.status === 200) {
      localStorage.setItem('userName', userName);
      props.onLogin(userName);
    } else {
      const body = await res.json();
      setDisplayError(`⚠ Error: ${body.msg}`);
    }
  }

  return (
    <>
        <div className="mb-3">
            <input type="text" className="form-control" value = {userName} onChange={(e) => setUserName(e.target.value)} placeholder="Username" />
        </div>

        <div className="mb-3">
            <input type="password" className="form-control" onChange ={(e) => setPassword(e.target.value)} placeholder="Password" />

            <Button variant='primary' onClick={() => loginUser()} disabled={!userName || !password}>
                Login
            </Button>
            <Button variant='secondary' onClick={() => createUser()} disabled={!userName || !password}>
                Create
            </Button>

            <MessageDialog message={displayError} onHide={() => setDisplayError(null)} />
        </div>
    </>
  );
}
