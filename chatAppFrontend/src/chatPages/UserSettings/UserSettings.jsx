import styles from './UserSettings.module.css';
import { motion } from 'framer-motion';
import axios from 'axios';
import React from 'react'
import { useNavigate } from 'react-router-dom';

export default function UserSettings({setShowSettingsContent, userSummary, setAuthStatus}) {

    const navigate = useNavigate();
    
    return (
        <div className={styles['user-settings-top-parent-superb']} >
            <div className={styles['settings-options-list']}>
                <button className={styles['logout-button']} onClick={()=> handleClick(navigate, setAuthStatus, setShowSettingsContent)}>Logout</button>
            </div>
            <div
                className={styles['user-settings-top-parent']}
            >
                <h2 className={styles['user-account-title']}>My Account</h2>
                <UserBriefSettings userSummary={userSummary} />
            </div>
            <ExitButton setShowSettingsContent={setShowSettingsContent} />
        </div>
    )
}


const handleClick = (navigate, setAuthStatus,setShowSettingsContent) => {
    const serverUrl = 'http://chat-app.cags2.com:4000/logout'; // Replace with your server's URL and endpoint
    const userTokens = JSON.parse(localStorage.getItem('userTokens'));
    const refreshToken = userTokens ? userTokens.refreshToken : null;
    const accessToken = userTokens ? userTokens.accessToken : null;

    if (!refreshToken || !accessToken) {
        console.error('No tokens found, redirecting to login');
        localStorage.removeItem('userTokens'); // Ensure tokens are cleared if they exist but are invalid
        setShowSettingsContent(old => !old)
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
        setShowSettingsContent(old => !old)
        navigate('/login'); // Navigate to login page
    });
};

const ExitButton = ({setShowSettingsContent}) => (
    <div className={styles['exit-settings-screen']} onClick={() => setShowSettingsContent(old => !old)} >
      <svg fill="#000000" width="100%" height="100%" viewBox="0 0 460.775 460.775" preserveAspectRatio="xMidYMid meet">
        <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55
          c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55
          c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505
          c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55
          l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719
          c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"/>
      </svg>
    </div>
  );


  const UserBriefSettings = ({userSummary}) => {
    return(
        <div className={styles['user-brief-settings-parent']}>
            <div className={styles['user-brief-settings-header']}>
                <img src="/cags2.png" alt="cags2 failed to load >.<" />
                <h1 className={styles['user-brief-username-header']}>{userSummary.preferredName}</h1>
            </div>
            <div className={styles['user-profile-mini-desc']}>
                <div className={styles['display-header-parent']}>
                    <div className={styles['mini-desc-catagory-parent']}>
                        <p className={styles['mini-desc-catagory-header']}>Display Name</p>
                        <p>{userSummary.preferredName}</p>
                    </div>
                    <EditButton />
                </div>
                <div className={styles['display-header-parent']}>
                    <div className={styles['mini-desc-catagory-parent']}>
                        <p className={styles['mini-desc-catagory-header']}>Username</p>
                        <p>{userSummary.username}</p>
                    </div>
                    <EditButton />
                </div>
                <div className={styles['display-header-parent']}>
                    <div className={styles['mini-desc-catagory-parent']}>
                        <p className={styles['mini-desc-catagory-header']}>Gender</p>
                        <p>{userSummary.gender}</p>
                    </div>
                    <EditButton />
                </div>
                <div className={styles['display-header-parent']}>
                    <div className={styles['mini-desc-catagory-parent']}>
                        <p className={styles['mini-desc-catagory-header']}>Birthday</p>
                        <div>
                        {userSummary.age.month} / {userSummary.age.day} / {userSummary.age.year}    
                        </div>
                    </div>
                    <EditButton />
                </div>
            </div>
        </div>
    )
  }

  const EditButton = () => {
    return (
        <div className={styles['edit-button-parent']}>
            Edit
        </div>
    )
  }