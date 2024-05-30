import { useState, useEffect, useRef, useCallback } from 'react';
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
import io, { Socket } from 'socket.io-client';
import useAuthenticatedSocket from './socket-io-functions/authenticate-socket.jsx';
import { onDirectMessageReceived,onDirectMessageTyping, onFriendRequestReceived, setSocketAccessToken } from './socket-io-functions/send-direct-message.jsx';
import { onFriendRequestAccepted,onFriendRequestDeclined, onFriendRequestCanceled, onRemoveFriend } from './socket-io-functions/send-direct-message.jsx';
import { getSocket } from './socket-io-functions/authenticate-socket.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import UserSettings from './chatPages/UserSettings/UserSettings.jsx';
import { useGroupChat } from './socket-io-functions/group-chat.jsx';

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
        setLoggedValue(newTokens); 
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
  const [gotDirect,setGotDirect] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(undefined);
  const [loggedValue, setLoggedValue] = useState(() => {
    const userTokens = localStorage.getItem('userTokens');
    return userTokens ? JSON.parse(userTokens) : null;
  });
  const [userSummary, setUserSummary] = useState({friendPending: []});
  const [directMessages, setDirectMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [userCurrentJoinedRoom, setUserCurrentJoinedRoom] = useState([]);
  const groupChat = useGroupChat(isAuthenticated, gotDirect);
  let [channels, setChannels] = useState([]);
  let [channelUsername, setChannelUsername] = useState({})
  const {
    createGroupChat,
    addUserToGroupChat,
    sendGroupMessage,
    leaveGroupChat,
    groupMessageTyping
  } = groupChat;


  useEffect(() => {
    if (loggedValue) {
      localStorage.setItem('userTokens', JSON.stringify(loggedValue));
    }
  }, [loggedValue]);
  useAuthenticatedSocket(isAuthenticated,userCurrentJoinedRoom[0])
  const directMessagesRef = useRef(directMessages);
directMessagesRef.current = directMessages; // Keep ref up-to-date with the latest directMessages

const handleDirectMessageReceived = useCallback((newMessage) => {
  const otherUsername = directMessagesRef.current.users.find(user => user !== userSummary.username);
  
  if (((newMessage.sender === otherUsername) || (newMessage.sender == userSummary.username)) && newMessage.id === directMessagesRef.current._id) {
    setDirectMessages(old => ({
      ...old,
      messages: [...old.messages, newMessage],
    }));
    console.log
    if(userCurrentJoinedRoom[0]!=newMessage.id){
      if(!channels.some((old)=> old.name==otherUsername)){
        setChannels(old => {
          return [...old, {name: otherUsername, logo: '/cags2.png'}]
        })
      }
      setChannelUsername(old => {
        return {...old, [otherUsername]: (old.otherUsername+1)||1}
      })
    }else{
      setChannelUsername(old => {
        return {...old, [otherUsername]: 0}
      })
    }
  }
  setTypingUsers(prevTypingUsers => {
    const {[newMessage.sender]: _, ...rest} = prevTypingUsers;
    return rest;
  });
}, [userSummary.username, setDirectMessages]); // Dependencies are reduced to what truly causes the callback to change

useEffect(() => {
  let cleanup = () => {};

  if (isAuthenticated && gotDirect) {
    try {
      cleanup = onDirectMessageReceived(handleDirectMessageReceived, directMessagesRef.current);
    } catch (error) {
      console.error(error);
    }
  }

  return cleanup;
}, [isAuthenticated, gotDirect, handleDirectMessageReceived]);

const handleDirectMessageTypingReceived = useCallback((typingData) => {
  if(typingData.message == ''){
    setTypingUsers(prevTypingUsers => {
      const {[typingData.username]: _, ...rest} = prevTypingUsers;
      return rest;
    });
  }else{
    setTypingUsers(oldTypingUsers => {
      const newTypingUsers = { ...oldTypingUsers };
      newTypingUsers[typingData.username] = typingData.message;
      return newTypingUsers;
    })
  }
}, [setTypingUsers]); // setTypingUsers is a state setter function managing typing users info
const handleFriendRequestReceived = useCallback((sender) => {
  
  if(userSummary){
    setUserSummary(old => {
      if(old.friendPending.includes(sender)) return old;
      return {
        ...old,
        friendPending: [...old.friendPending, sender]
      };
    })
  }
}, [userSummary,setUserSummary]);
const handleFriendRequestAccepted = useCallback((sender,dm) => {
  if(userSummary){
    setUserSummary(old => {
      if(old.friends.some(friend => friend.name === sender)) return old;
      return {
        ...old,
        directChannels: old.directChannels.some(val => val._id == dm._id) ? old.directChannels : [...old.directChannels, {users: dm.users, _id:dm._id, preferredName: dm.preferredName}] ,
        friends: old.friends.includes(sender) ? old.directChannels : [...old.friends, {name: sender}],
        friendRequest: old.friendRequest.filter(friend => friend !== sender)
      };
    })
  }
}, [userSummary,setUserSummary]);
const handleFriendRequestDeclined = useCallback((sender) => {
  if(userSummary){
    setUserSummary(old => {
      if(old.friendPending.includes(sender)) return old;
      return {
        ...old,
        friendRequest: old.friendRequest.filter(friend => friend !== sender)
      };
    })
  }

}, [userSummary,setUserSummary]);
const handleFriendRequestCanceled = useCallback((sender) => {
  if(userSummary){
    setUserSummary(old => {
      return {
        ...old,
        friendPending: old.friendPending.filter(friend => friend !== sender)
      };
    })
  }
}, [userSummary,setUserSummary]);
const handleRemoveFriend = useCallback((sender) => {
  if(userSummary){
    setUserSummary(old => {
      return {
        ...old,
        friends: old.friends.filter(friend => friend.name !== sender)
      };
    })
  }
}, [userSummary,setUserSummary]);


useEffect(() => {
  let cleanup = () => {};

  if (isAuthenticated && gotDirect) {
    try {
      cleanup = onDirectMessageTyping(handleDirectMessageTypingReceived, directMessagesRef.current);
    } catch (error) {
      console.error(error);
    }
  }

  return cleanup;
}, [isAuthenticated, gotDirect, handleDirectMessageTypingReceived]);
useEffect(() => {
  let cleanupAccepted = () => {};
  let cleanupDeclined = () => {};
  let cleanupCanceled = () => {};
  let cleanupRemove = () => {};
  let cleanupReceived = () => {};

  if (isAuthenticated) {
    try {
      cleanupAccepted = onFriendRequestAccepted(handleFriendRequestAccepted);
      cleanupDeclined = onFriendRequestDeclined(handleFriendRequestDeclined);
      cleanupCanceled = onFriendRequestCanceled(handleFriendRequestCanceled);
      cleanupRemove = onRemoveFriend(handleRemoveFriend);
      cleanupReceived = onFriendRequestReceived(handleFriendRequestReceived);
    } catch (error) {
      console.error(error);
    }
  }

  return () => {
    cleanupAccepted();
    cleanupDeclined();
    cleanupCanceled();
    cleanupRemove();
    cleanupReceived();
  };
}, [isAuthenticated, userSummary]);
  useEffect(() => {
    const fetchData = async () => {
    //  await renewRefreshToken(setLoggedValue, setAuthenticated); 
  
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
            setAuthenticated(true);
          } catch (error) {
            setAuthenticated(false);
            console.error('There was an error fetching the user data:', error);
          }
        }else{
          setAuthenticated(false);
        }
      }else{
        setAuthenticated(false);
      }
    };
  
    fetchData();
  }, []);
  useEffect(() => {
    const refreshAccessToken = async () => {
      const userTokens = JSON.parse(localStorage.getItem('userTokens'));
      if (userTokens && userTokens.refreshToken) {
        try {
          const response = await axios.post('http://localhost:4000/accessToken', {
            refreshToken: userTokens.refreshToken,
          });
          const newAccessToken = response.data.accessToken;
          if (newAccessToken) {
            localStorage.setItem('userTokens', JSON.stringify({ ...userTokens, accessToken: newAccessToken }));
            if(getSocket()){
              setSocketAccessToken(newAccessToken)
            }
          }
        } catch (error) {
          console.error('Error refreshing access token:', error);
        }
      }
    };

    refreshAccessToken();

    // Set up the interval to refresh the access token every 10 minutes
    const intervalId = setInterval(refreshAccessToken, 600000); // 600000ms = 10 minutes

    return () => clearInterval(intervalId);
  }, []);

  const signUpInputs = useState({
    inputUsername: "",
    inputPassword: "",
    inputConfirmPassword: "",
    inputGender: "none",
    // Adding new fields
    inputDay: "",
    inputMonth: "",
    inputYear: "",
    inputPreferredName: ""
});
  const loginInputs = useState({
    inputUsername: "",
    inputPassword: ""
  });
  
  const [showSettingsContent, setShowSettingsContent] = useState(false);
  if (isAuthenticated === undefined) {
    return <div style={{color:"white", fontSize:"1.5rem"}}>Loading...</div>;
  }
  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/channel/@me" /> : <SignUp setUserSummary={setUserSummary} setLoggedValue={setLoggedValue} setAuthStatus={setAuthenticated} authStatus={isAuthenticated} inputSignUp={signUpInputs} />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/channel/@me" /> : <Login setUserSummary={setUserSummary} setLoggedValue={setLoggedValue} setAuthStatus={setAuthenticated} authStatus={isAuthenticated} inputLogin={loginInputs} />} />
      <Route path="/channel" element={<Navigate replace to="/channel/@me" />} />
      <Route path="/channel" element={
        isAuthenticated ? (
          Object.keys(userSummary).length > 0 ? (
            <AppContent channelUsername={channelUsername} channels={channels} userCurrentJoinedRoom={userCurrentJoinedRoom} setAuthStatus={setAuthenticated} isAuthenticated={isAuthenticated} userSummary={userSummary} showSettingsContent={showSettingsContent} setShowSettingsContent={setShowSettingsContent} />
          ) : <div>Loading...</div>
        ) : <Navigate to="/login" />
      } >
        <Route path="@me" element={<DirectMessages createGroupChat={createGroupChat} userCurrentJoinedRoom={userCurrentJoinedRoom} setUserCurrentJoinedRoom={setUserCurrentJoinedRoom} setShowSettingsContent={setShowSettingsContent} gotDirect={gotDirect} setGotDirect={setGotDirect} setUserSummary={setUserSummary} directMessages={directMessages} setDirectMessages={setDirectMessages} userSummary={userSummary} />} >
          <Route path=":messageId" element={<MessageScreen userSummary={userSummary} groupChat={groupChat} typingUsers={typingUsers} userCurrentJoinedRoom={userCurrentJoinedRoom} directMessages={directMessages} setDirectMessages={setDirectMessages} username={userSummary.username} />} /> 
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






function AppContent({channelUsername,channels, userCurrentJoinedRoom, setAuthStatus, isAuthenticated, userSummary, showSettingsContent, setShowSettingsContent }) {
  let variantDuration = 0.2;
  const variants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9, // Start slightly smaller
      y: 0, // Start a bit below the center
      transition: { 
        duration: variantDuration,
        ease: "easeIn" 
      }
    },
    visible: { 
      opacity: 1, 
      scale: 1, // Scale to normal size
      y: 0, // Move to exact center
      transition: { 
        duration: variantDuration,
        ease: "easeIn",
        when: "beforeChildren", // Ensure parent animates before children
        staggerChildren: 0.3, // If the component has children, stagger their animation
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.9, // End slightly smaller
      y: 0, // Move a bit below center again
      transition: { 
        duration: variantDuration,
        ease: "easeInOut" 
      }
    }
  };
  return (
    <AnimatePresence>
      
      {showSettingsContent ? (
        <motion.div key="userSettings"
          className='motion-show-settings-content'
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
        >
          <UserSettings userCurrentJoinedRoom={userCurrentJoinedRoom} setAuthStatus={setAuthStatus} setShowSettingsContent={setShowSettingsContent} userSummary={userSummary} />
        </motion.div>
      ) : (
        <motion.div key="channelMessage" 
          className='motion-show-settings-content'
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={variants}
        >
          <ChannelMessage channelUsername={channelUsername} channels={channels} userSummary={userSummary} authStatus={isAuthenticated} setAuthStatus={setAuthStatus} /> 
        </motion.div>
      )}
    </AnimatePresence>
  );
}



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
