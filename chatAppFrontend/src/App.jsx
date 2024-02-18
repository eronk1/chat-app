import { useState, useEffect } from 'react';
import './App.css';
import { Route , Routes, Navigate } from "react-router-dom";
import SignUp from './signUp/SignUp';
import Login from './login/Login';
import ErrorPage from './ErrorPage/ErrorPage';
import Home from './chatPages/Home/Home';

// New function outside of App for renewing the refresh token
async function renewRefreshToken(setLoggedValue, setAuthenticated) {
  const userTokens = localStorage.getItem('userTokens');
  if (userTokens) {
    const tokens = JSON.parse(userTokens);
    const decoded = decodeJWT(tokens.refreshToken);
    const username = decoded.username;

    const response = await fetch('http://localhost:4000/renewRefreshToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username, refreshToken: tokens.refreshToken }),
    });

    if (response.ok) {
      const newTokens = await response.json();
      if (newTokens.valid) {
        localStorage.setItem('userTokens', JSON.stringify(newTokens));
        setLoggedValue(newTokens); // Update state to trigger re-render if necessary
        setAuthenticated(true);
      }
    }
  }
}

function App() {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [loggedValue, setLoggedValue] = useState(() => {
    const userTokens = localStorage.getItem('userTokens');
    return userTokens ? JSON.parse(userTokens) : null;
  });

  useEffect(() => {
    if (loggedValue) {
      localStorage.setItem('userTokens', JSON.stringify(loggedValue));
    }
  }, [loggedValue]);

  useEffect(() => {
    renewRefreshToken(setLoggedValue, setAuthenticated);
  }, []);

  const signUpInputs = useState({
    inputUsername: "",
    inputPassword: "",
    inputConfirmPassword: "",
    inputGender: "none"
  });
  const loginInputs = useState({
    inputUsername: "",
    inputPassword: ""
  });

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <SignUp setLoggedValue={setLoggedValue} setAuthStatus={setAuthenticated} authStatus={isAuthenticated} inputSignUp={signUpInputs} />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login setLoggedValue={setLoggedValue} setAuthStatus={setAuthenticated} authStatus={isAuthenticated} inputLogin={loginInputs} />} />
      <Route path="/home" element={isAuthenticated ? <Home authStatus={isAuthenticated} setAuthStatus={setAuthenticated} /> : <Navigate to="/login" />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;







function base64UrlDecode(input) {
  // Replace non-url compatible chars with base64 standard chars
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  // Pad out with standard base64 required padding characters
  let padLength = (4 - (base64.length % 4)) % 4;
  base64 += '='.repeat(padLength);
  // Use atob to decode and return the original string
  return atob(base64);
}

function decodeJWT(token) {
  const parts = token.split('.');
  if (parts.length !== 3) {
      throw new Error('Invalid JWT: The token must have three parts');
  }

  const payload = parts[1];
  const decodedPayload = base64UrlDecode(payload);

  try {
      return JSON.parse(decodedPayload);
  } catch (e) {
      throw new Error('Invalid JWT: The payload is not valid JSON');
  }
}
