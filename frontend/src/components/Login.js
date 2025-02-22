import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Simple authentication
        if (username === 'admin' && password === 'password') {
        navigate('/dashboard');
        } else {
        alert('Invalid username or password');
        }
    };

    return (
        <div className="login-container">
        <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <label>
            Username:
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            </label>
            <label>
            Password:
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            </label>
            <button type="submit">Login</button>
        </form>
        </div>
    );
}

export default Login;
