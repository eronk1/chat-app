import { useState, useEffect } from 'react';
import './App.css';
import { Route , Routes, Navigate, useParams } from "react-router-dom";
import SignUp from './signUp/SignUp';
import Login from './login/Login';
import ErrorPage from './ErrorPage/ErrorPage';
import Home from './chatPages/Home/Home';
import ChannelMessage from './chatPages/chatHome/ChannelMessage';
import DirectMessages from './chatPages/DirectMessages/DirectMessages';
import ServerMessages from './chatPages/ServerMessages/ServerMessages';
import MessageScreen from './chatPages/MessageScreen/MessageScreen';
import axios from 'axios';

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
      }else{
        setAuthenticated(false)
      }
    }
  }else{
    setAuthenticated(false)
  }
}

function App() {
  const [isAuthenticated, setAuthenticated] = useState(undefined);
  const [loggedValue, setLoggedValue] = useState(() => {
    const userTokens = localStorage.getItem('userTokens');
    return userTokens ? JSON.parse(userTokens) : null;
  });
  const [userSummary, setUserSummary] = useState({});
  const [directMessages, setDirectMessages] = useState({});

  useEffect(() => {
    if (loggedValue) {
      localStorage.setItem('userTokens', JSON.stringify(loggedValue));
    }
  }, [loggedValue]);

  useEffect(() => {
    const fetchData = async () => {
      await renewRefreshToken(setLoggedValue, setAuthenticated); 
  
      const userTokens = localStorage.getItem('userTokens');
      if (userTokens) {
        const tokens = JSON.parse(userTokens);
        if (tokens.accessToken) { 
          try {
            const response = await axios.get('http://localhost:3000/getUserData', {
              headers: {
                'Authorization': `Bearer ${tokens.accessToken}`,
              },
            });
  
            setUserSummary(response.data);
          } catch (error) {
            console.error('There was an error fetching the user data:', error);
          }
        }
      }
    };
  
    fetchData();
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
  if (isAuthenticated === undefined) {
    return <div style={{color:"white", fontSize:"1.5rem"}}>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/channel/@me" /> : <SignUp setUserSummary={setUserSummary} setLoggedValue={setLoggedValue} setAuthStatus={setAuthenticated} authStatus={isAuthenticated} inputSignUp={signUpInputs} />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/channel/@me" /> : <Login setUserSummary={setUserSummary} setLoggedValue={setLoggedValue} setAuthStatus={setAuthenticated} authStatus={isAuthenticated} inputLogin={loginInputs} />} />
      <Route path="/home" element={isAuthenticated ? <Home authStatus={isAuthenticated} setAuthStatus={setAuthenticated} /> : <Navigate to="/login" />} />
      <Route path="/channel" element={<Navigate replace to="/channel/@me" />} />
      <Route path="/channel" element={Object.keys(userSummary).length > 0 ? <ChannelMessage userSummary={userSummary} authStatus={isAuthenticated} setAuthStatus={setAuthenticated} /> : <div>Loading...</div>}>
        <Route path="@me" element={<DirectMessages directMessages={directMessages} setDirectMessages={setDirectMessages} userSummary={userSummary} />} >
          <Route path=":messageId" element={<MessageScreen username={userSummary.username} />} /> 
        </Route>
        <Route path=":channelId" element={<ServerMessages />} > 
          <Route path=":messageId" element={<MessageScreen />} /> 
        </Route>
      </Route>
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;







function base64UrlDecode(input) {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  let padLength = (4 - (base64.length % 4)) % 4;
  base64 += '='.repeat(padLength);
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
