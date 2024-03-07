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
    if (!selected && id) {
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
  let handleGetDirectMessage = async (id,username="") => {
    console.log(username)
    if(selected === id){
      navigate(`/channel/@me/${id}`); 
      return;
    }
    if(username) id = findChannelIdByUsername(userSummary, username);

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
      <DirectMessageChannels currentActive={messageId ? false : true} handleGetDirectMessage={handleGetDirectMessage} selectedChannel={selected} username={userSummary.username} directChannels={userSummary.directChannels} groupChannels={userSummary.groupChannels} />
      {messageId && gotDirect ? <Outlet context={{directMessages, setDirectMessages}} /> : <FriendListPage handleGetDirectMessage={handleGetDirectMessage} friendPendings={userSummary.friendPending} friendRequests={userSummary.friendRequest} friends={userSummary.friends} />}
    </div>
  )
}



function FriendListPage({ friends = [], handleGetDirectMessage, friendRequests, friendPendings }) {
  let [friendSubPage, setFriendSubPage] = useState("All Friends");
  const [activeTab, setActiveTab] = useState('all-friends'); // State to track active tab

  if (friends.length === 0) {
    return <div id="no-friends-component-display">No friends to display</div>;
  }

  let transparentColor = {
      backgroundColor: "#00000000"
  };

  let parentClicked = {
    backgroundColor: "#98979e78"
  };
  console.log(activeTab)
  const getTabStyle = (tabName) => {
    
    if (activeTab === tabName) {
      if(tabName == 'add-friends'){
        return {
          color: "var(--submit-button)",
          backgroundColor: "#98979e78",
          cursor: "pointer"
        }
      }
      return parentClicked
    };
    if(tabName == 'add-friends'){
      return {
        background: "none",
        color: "var(--submit-button)"
      }
    }
    return transparentColor;
  };

  return (
    <div id="friends-list">
      <div className='friend-list-header'>
        <div id='the-real-pro-friend-icon' className='friends-page-render-button'>
            <svg className="svg-icon-pro" style={{ width: '1.25em', height: '1em', verticalAlign: 'middle', fill: 'currentColor', overflow: 'hidden' }} viewBox="0 0 1280 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M384 512c123.8 0 224-100.2 224-224S507.8 64 384 64 160 164.2 160 288s100.2 224 224 224z m153.6 64h-16.6c-41.6 20-87.8 32-137 32s-95.2-12-137-32h-16.6C103.2 576 0 679.2 0 806.4V864c0 53 43 96 96 96h576c53 0 96-43 96-96v-57.6c0-127.2-103.2-230.4-230.4-230.4zM960 512c106 0 192-86 192-192s-86-192-192-192-192 86-192 192 86 192 192 192z m96 64h-7.6c-27.8 9.6-57.2 16-88.4 16s-60.6-6.4-88.4-16H864c-40.8 0-78.4 11.8-111.4 30.8 48.8 52.6 79.4 122.4 79.4 199.6v76.8c0 4.4-1 8.6-1.2 12.8H1184c53 0 96-43 96-96 0-123.8-100.2-224-224-224z" />
            </svg>
            <div>Friends</div>
        </div>
        <div 
          className='all-friends' 
          style={getTabStyle('all-friends')}
          onClick={() => { setFriendSubPage("All Friends"); setActiveTab('all-friends'); }}
        >All Friends</div>
        <div 
          className='pending-friends' 
          style={getTabStyle('pending-friends')}
          onClick={() => { setFriendSubPage("Pending"); setActiveTab('pending-friends'); }}
        >Pending</div>
        <div 
          className='add-friends' 
          style={getTabStyle('add-friends')}
          onClick={() => { setFriendSubPage("Add Friend"); setActiveTab('add-friends'); }}
        >Add Friend</div>
      </div>
      {activeTab === "all-friends" && friends.map((friend, index) => (
        <div className='the-friend-active-check' key={index}>
          <FriendListChannel handleGetDirectMessage={handleGetDirectMessage} channelLogo={'/cags2.png'} name={friend.name} />
        </div>
      ))}
      {activeTab === "pending-friends" && friendRequests.map((friend, index) => (
        <div className='the-friend-active-check' key={index}>
          <PendingFriendListChannel friendRequest={true} handleGetDirectMessage={handleGetDirectMessage} channelLogo={'/cags2.png'} name={friend} />
        </div>
      ))}
      {activeTab === "pending-friends" && friendPendings.map((friend, index) => (
        <div className='the-friend-active-check' key={index}>
          <PendingFriendListChannel friendRequest={false} handleGetDirectMessage={handleGetDirectMessage} channelLogo={'/cags2.png'} name={friend} />
        </div>
      ))}
      {activeTab === "add-friends" && 
          <div>
            <input type="text" placeholder='Add Friends with their username' />
          </div>
      }
    </div>
  );
}










function FriendListChannel({channelLogo, name, handleGetDirectMessage}) {
  let parentHover = {
      backgroundColor: "#6b697178",
      cursor: "pointer",
      borderTop: "0.1rem #00000000 solid"
  };
  let parentActive = {
      backgroundColor: "#7f7d8678",
      cursor: "pointer",
      borderTop: "0.1rem #00000000 solid"
  };
  let transparentColor = {
      backgroundColor: "#00000000",
      cursor: "default",
      borderTop: "0.1rem var(--background4) solid"
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
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={()=> handleGetDirectMessage(false,name)}  
      className='friend-list-main-parent'
    >
      <div
        className='friend-list-channel-box-parent'
      >
          <img src={channelLogo} alt="cags2 failed to load uwu" />
          <div className='friend-list-channel-box-name'>{name}</div>
      </div>
    </div>
)
}

function PendingFriendListChannel({friendRequest, channelLogo, name, handleGetDirectMessage}) {
  let parentHover = {
      backgroundColor: "#6b697178",
      cursor: "pointer",
      borderTop: "0.1rem #00000000 solid"
  };
  let parentActive = {
      backgroundColor: "#7f7d8678",
      cursor: "pointer",
      borderTop: "0.1rem #00000000 solid"
  };
  let transparentColor = {
      backgroundColor: "#00000000",
      cursor: "default",
      borderTop: "0.1rem var(--background4) solid"
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
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      // onClick={()=> handleGetDirectMessage(false,name)}  
      className='friend-list-main-parent'
    >
      <div
        className='friend-list-channel-box-parent'
      >
          <img src={channelLogo} alt="cags2 failed to load uwu" />
          <div className='friend-list-channel-box-name'>{name}</div>
      </div>
      {friendRequest && 
        <div>
          <div>Accept</div>
          <div>Decline</div>
        </div>
      }
      {!friendRequest && 
        <div>
          <div>Cancel</div>
        </div>
      }
    </div>
)
}

function findChannelIdByUsername(userData, username) {
  for (let channel of userData.directChannels) {
      if (channel.users.includes(username)) {
          return channel._id;
      }
  }
  return null; 
}



export default DirectMessages