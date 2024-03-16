import styles from './UserSettings.module.css';
import { motion } from 'framer-motion';
import axios from 'axios';
import React from 'react'
import { useNavigate } from 'react-router-dom';

export default function UserSettings({setShowSettingsContent, userSummary, setAuthStatus}) {

    const navigate = useNavigate();
    return (
        <div
            className={styles['user-settings-top-parent']}
        >
            <button onClick={() => setShowSettingsContent(old => !old)}>Esc</button>
            <button onClick={()=>handleClick(navigate, setAuthStatus)}>logout</button>
        </div>
    )
}

const handleClick = (navigate, setAuthStatus) => {
    const serverUrl = 'http://localhost:4000/logout'; // Replace with your server's URL and endpoint
    const userTokens = JSON.parse(localStorage.getItem('userTokens'));
    const refreshToken = userTokens ? userTokens.refreshToken : null;
    const accessToken = userTokens ? userTokens.accessToken : null;

    if (!refreshToken || !accessToken) {
        console.error('No tokens found, redirecting to login');
        localStorage.removeItem('userTokens'); // Ensure tokens are cleared if they exist but are invalid
        navigate('/login');
        return;
    }

    axios.delete(serverUrl, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: {
            refreshToken: refreshToken
        }
    })
    .then(response => {
        // Log out the user locally regardless of the server's response
        return { valid: true };
    })
    .catch(error => {
        console.error('Logout failed:', error);
        // Handle logout failure (optionally log the error)
        return { valid: false }; // Consider how you want to handle this case. Here we assume logout should proceed anyway.
    })
    .finally(() => {
        // Actions to always perform after logout attempt
        localStorage.removeItem('userTokens'); // Clear local storage tokens
        setAuthStatus(false); // Update auth state
        navigate('/login'); // Navigate to login page
    });
};