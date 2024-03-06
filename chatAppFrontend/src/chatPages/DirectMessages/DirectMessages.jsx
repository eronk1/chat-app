import {useState,useEffect} from 'react'
import './DirectMessages.css'
import DirectMessageChannels from './DirectMessageChannels'
import { useParams, Outlet, useNavigate } from "react-router-dom";
import axios from 'axios';

function DirectMessages({userSummary, directMessages, setDirectMessages}) {
  const { messageId } = useParams();
  const navigate = useNavigate();
  const [gotDirect,setGotDirect] = useState(false);

  let selected = directMessages._id || null;
  
useEffect(() => {
  const fetchData = async (id) => {
    console.log(directMessages)
    if (!selected) {
      const token = JSON.parse(localStorage.getItem('userTokens'));
      try {
        const response = await axios.get(`http://localhost:3000/channel/@me/${id}`, {
          headers: {
            Authorization: `Bearer ${token.accessToken}`,
          },
        });
        setDirectMessages(response.data);
        setGotDirect(true);
      } catch (error) {
        console.error("Error fetching direct message:", error);
        setGotDirect(false);
      }
    }
  };

  fetchData(messageId);
}, []);
  let handleGetDirectMessage = async (id) => {
    if(selected === id){
      return;
    }
    const token = JSON.parse(localStorage.getItem('userTokens'));
    try {
      const response = await axios.get(`http://localhost:3000/channel/@me/${id}`, {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
          });
      setDirectMessages(response.data);
      setGotDirect(true);
      navigate(`/channel/@me/${id}`); 
    } catch (error) {
      setGotDirect(false);
      console.error("Error fetching direct message:", error);
    }
  };

  return (
    <div id='direct-messages-parent'>
      <DirectMessageChannels handleGetDirectMessage={handleGetDirectMessage} selectedChannel={selected} username={userSummary.username} directChannels={userSummary.directChannels} groupChannels={userSummary.groupChannels} />
      {messageId && gotDirect ? <Outlet context={{directMessages, setDirectMessages}} /> : <FriendListPage friends={userSummary.friends} />}
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
        <div className='the-friend-active-check' key={index}>
          <FriendListChannel />
          {friend.name}
        </div>
      ))}
    </div>
  );
}
function FriendListChannel({channelLogo, name, channelId, selectedChannel, handleGetDirectMessage}) {
  let parentHover = {
      backgroundColor: "#6b697178",
      cursor: "pointer"
  };
  let parentActive = {
      backgroundColor: "#7f7d8678",
      cursor: "pointer"
  };
  let parentClicked = {
      backgroundColor: "#98979e78"
  };
  let transparentColor = {
      backgroundColor: "#00000000",
      cursor: "default"
  }
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  

  const handleMouseEnter = () => {
      setIsHovered(true);
  };

  const handleMouseLeave = () => {
      setIsHovered(false);
      setIsMouseDown(false);
  };
  const handleMouseDown = () => {
      setIsMouseDown(true);
  };

  const handleMouseUp = () => {
      setIsMouseDown(false);
  };
  return (
  <div
  style={{
      ...(isHovered ? parentHover : transparentColor),
      ...(isMouseDown ? parentActive : ''),
      ...(channelId === selectedChannel ? parentClicked : '')
    }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={()=> handleGetDirectMessage(channelId)}
  className='direct-channel-box-parent'
   >
      <img src={channelLogo} alt="cags2 failed to load uwu" />
      <div className='direct-channel-box-name'>{name}</div>
  </div>
)
}


export default DirectMessages