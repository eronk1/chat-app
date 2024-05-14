import React from 'react'
import { useState, useEffect } from 'react'
import './Home.css'
import {Link} from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
export default function Home(props) {
  let navigate = useNavigate();
  const handleClick = () => {
    const serverUrl = 'http://chat-app.cags2.com:4000/logout'; // Replace with your server's URL and endpoint

    const userTokens = JSON.parse(localStorage.getItem('userTokens'));
    const refreshToken = userTokens ? userTokens.refreshToken : null;
    const accessToken = userTokens ? userTokens.accessToken : null; // Updated to use the access token from local storage

    if (!refreshToken || !accessToken) {
      console.error('No tokens found, redirecting to login');
      navigate('/login'); // Assuming navigate is defined and imported from your routing library
      return;
    }

    fetch(serverUrl, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: refreshToken }),
    })
    .then((response) => {
      if (response.ok || response.status === 404) {
        return { valid: true }; // Consider valid if the response is OK (200-299) or specifically a 404 Not Found
      }
      throw new Error('Network response was not ok');
    })
    .then((data) => {
      if (data.valid) {
        props.setAuthStatus(false);
        navigate('/login');
      }
    })
    .catch((error) => {
      console.error('Logout failed:', error);
    });
  }
  if(props.authStatus){
    return (
      <div id='homeParent'>
            <Link className='virtualDiningLink' to="/virtualDining">Start Dining</Link>
            <button onClick={handleClick} id='homPageLogOutButton'>Logout</button>
      </div>
    )
  }
}
