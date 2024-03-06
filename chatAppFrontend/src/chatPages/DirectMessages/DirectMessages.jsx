import {useState} from 'react'
import './DirectMessages.css'
import DirectMessageChannels from './DirectMessageChannels'
import { useParams, Outlet, useNavigate } from "react-router-dom";
import axios from 'axios';

function DirectMessages({userSummary, directMessages, setDirectMessages}) {
  const { messageId } = useParams();
  const navigate = useNavigate();

  let selected = null;

  let handleGetDirectMessage = async (id) => {
    const token = JSON.parse(localStorage.getItem('userTokens'));
    try {
      const response = await axios.get(`http://localhost:3000/channel/@me/${id}`, {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
          });
      setDirectMessages(response.data);
      navigate(`/channel/@me/${id}`); 
    } catch (error) {
      console.error("Error fetching direct message:", error);
    }
  };

  return (
    <div id='direct-messages-parent'>
      <DirectMessageChannels handleGetDirectMessage={handleGetDirectMessage} selectedChannel="" username={userSummary.username} directChannels={userSummary.directChannels} groupChannels={userSummary.groupChannels} />
      {messageId ? <Outlet context={{directMessages, setDirectMessages}} /> : <FriendListPage friends={userSummary.friends} />}
    </div>
  )
}



function FriendListPage({ friends = [] }) {
  if (friends.length === 0) {
    return <div id="no-friends-component-display">No friends to display</div>;
  }

  return (
    <div id="friends-list">
      {friends.map((friend, index) => (
        <div key={index}>{friend.name}</div> // Assuming each friend is an object with a name property
      ))}
    </div>
  );
}



export default DirectMessages