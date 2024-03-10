import {useState,useEffect, useRef} from 'react'
import './DirectMessages.css'
import DirectMessageChannels from './DirectMessageChannels'
import { useParams, Outlet, useNavigate } from "react-router-dom";
import axios from 'axios';

function DirectMessages({userSummary, setUserSummary, directMessages, setDirectMessages}) {
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
      {messageId && gotDirect ? <Outlet context={{directMessages, setDirectMessages}} /> : <FriendListPage userSummary={userSummary} setUserSummary={setUserSummary} handleGetDirectMessage={handleGetDirectMessage} friendPendings={userSummary.friendPending} friendRequests={userSummary.friendRequest} friends={userSummary.friends} />}
    </div>
  )
}



function FriendListPage({ setUserSummary, friends = [''], handleGetDirectMessage, userSummary, friendRequests, friendPendings }) {
  const {friendRequest, friendPending} = userSummary;
  const [activeTab, setActiveTab] = useState('all-friends'); // State to track active tab
  const [receivedMessage, setRecievedMessage] = useState("");
  console.log(friendRequests)
  console.log(friendPendings)
  console.log(userSummary)
  let theFriendsFlickerSwitch = (inputData, check='')=>{
    console.log('--start')
    setUserSummary((old)=>{
      const updatedFriendRequests = old.friendRequest.filter(item => item !== inputData);
      const updatedFriendPendings = old.friendPending.filter(item => item !== inputData);
      if(check== 'accept'){
        return {
          ...old,
          friends: [...old.friends, {name: inputData}],
          friendRequest: updatedFriendRequests,
          friendPending: updatedFriendPendings,
        }
      }else{
        return {
          ...old,
          friendRequest: updatedFriendRequests,
          friendPending: updatedFriendPendings,
        }
      }
    })
    console.log('--end')
  }
  let parentClicked = {
    backgroundColor: "#98979e78",
    opacity: 1
  };
  let [addFriendInputFocus, setAddFriendInputFocus] = useState(false);
  const [sendFriendRequestButtonStyle, setSendFriendRequestButtonStyle] = useState({border: "0.1rem solid transparent"})

  let elementInputAddFriend = {
    border: "0.2rem solid transparent"
  }

  const getTabStyle = (tabName) => {
    
    if (activeTab === tabName) {
      if(tabName == 'add-friends'){
        return {
          color: "var(--submit-button)",
          backgroundColor: "#98979e78",
          opacity: 1
        }
      }
      return parentClicked
    };
    if(tabName == 'add-friends'){
      return {
        color: "var(--submit-button)",
        opacity: 1
      }
    }
    return;
  };
  const [trueChangeFriend, setTrueChangeFriend ] = useState(false);
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');

  const handleSendFriendRequest = () => {
    const userTokens = JSON.parse(localStorage.getItem('userTokens'));
    const accessToken = userTokens?.accessToken;

    if (!accessToken) {
      console.error('Access token is not available');
      return;
    }

    axios.post('http://localhost:3000/friendRequest', { username }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(response => {
      friendRequests.push(username)
      setSendFriendRequestButtonStyle({ border: "0.1rem solid var(--submit-button)" });
      setTrueChangeFriend(true)
      setTempUsername(username)
      setUsername('');
    })
    .catch(error => {
      if (error.response && error.response.status === 500) {
        setRecievedMessage("Something went wrong"); 
    } else {
        setRecievedMessage(error.response.data.message);
    }
      setSendFriendRequestButtonStyle({ border: "0.1rem solid var(--logout)" });
      setTrueChangeFriend(true)
    });
  };
  const handleKeyPress = (e) => {
    if(!username) return;
    if(trueChangeFriend){
      setTrueChangeFriend(false)
      setSendFriendRequestButtonStyle({ border: "0.1rem solid var(--accent)" });
    }
    if (e.key === 'Enter') {
      handleSendFriendRequest();
    }
  };
  const inputRef = useRef(null); // Create a ref for the input element

useEffect(() => {
  setUsername('');
  if (activeTab === "add-friends") {
    inputRef.current.focus();
  }
}, [activeTab]);
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
          onClick={() => { setActiveTab('all-friends'); }}
        >All Friends</div>
        <div 
          className='pending-friends' 
          style={getTabStyle('pending-friends')}
          onClick={() => { setActiveTab('pending-friends'); }}
        >Pending</div>
        <div 
          className='add-friends' 
          style={getTabStyle('add-friends')}
          onClick={() => { setActiveTab('add-friends'); }}
        >Add Friend</div>
      </div>
      {activeTab === "all-friends" && friends.map((friend, index) => (
        <div className='the-friend-active-check' key={index}>
          <FriendListChannel setUserSummary={setUserSummary} handleGetDirectMessage={handleGetDirectMessage} channelLogo={'/cags2.png'} name={friend.name} />
        </div>
      ))}
      {(activeTab === "pending-friends") && friendRequests.map((friend, index) => (
        <div className='the-friend-active-check' key={index}>
          <PendingFriendListChannel  flickerCheckFriendSwitch={theFriendsFlickerSwitch} friendRequest={true} handleGetDirectMessage={handleGetDirectMessage} channelLogo={'/cags2.png'} name={friend} />
        </div>
      ))}
      {(activeTab === "pending-friends") && friendPendings.map((friend, index) => (
        <div className='the-friend-active-check' key={index}>
          <PendingFriendListChannel flickerCheckFriendSwitch={theFriendsFlickerSwitch} friendRequest={false} handleGetDirectMessage={handleGetDirectMessage} channelLogo={'/cags2.png'} name={friend} />
        </div>
      ))}
      {activeTab === "add-friends" && 
          <div
            style={{
              ...(sendFriendRequestButtonStyle),
              ...((!trueChangeFriend && addFriendInputFocus) ? { border: "0.1rem solid var(--accent)" } : ''),
              ...((!trueChangeFriend && !addFriendInputFocus) ? { border: "0.1rem solid transparent" } : {})
            }}
            className='add-friends-tab-for-user'>
            <input
              onFocus={() => {
                setTrueChangeFriend(false)
                setAddFriendInputFocus(true)
              }}
              onBlur={() => setAddFriendInputFocus(false)}
              ref={inputRef}
              type="text" 
              placeholder='Add Friends with their username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              disabled={!username} // Disables the button if username is empty
              style={{
                backgroundColor: !username ? 'var(--background4)': '',
                cursor: username ? 'pointer' : 'not-allowed'
              }}
              onClick={handleSendFriendRequest}
            >Send Friend Request</button>
          </div>
      }
      {((activeTab === "add-friends" && trueChangeFriend) && sendFriendRequestButtonStyle.border == "0.1rem solid var(--submit-button)" ) && 
        <div className='winner-winner-message'>
          Friend request to {tempUsername} has been sent!
        </div>
      }
      {((activeTab === "add-friends" && trueChangeFriend) && sendFriendRequestButtonStyle.border == "0.1rem solid var(--logout)" ) && 
        <div className='awe-man-you-failed-request-cags2'>
          {receivedMessage}
        </div>
      }
    </div>
  );
}










function FriendListChannel({setUserSummary,channelLogo, name, handleGetDirectMessage}) {
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
  const [isCheckVisible, setIsCheckVisible] = useState(false);
  const [isCheckOut, setIsCheckOut] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [makeActiveParentImpossible, setMakeActiveParentImpossible] = useState(false);

  const handleMouseEnter = () => {
      setIsHovered(true);
  };
  let [style, setStyle] = useState({
    stroke: 'var(--text)',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: '0.1rem',
  });

  const handleMouseLeave = () => {
      setIsHovered(false);
      setIsMouseDown(false);
      setIsCheckVisible(false);
      setStyle({
        stroke: 'var(--text)',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: '0.1rem',
      })
  };
  const handleMouseDown = () => {
    if(!isOptionsHovered && isCheckOut){
      setIsMouseDown(true);
    }
  };

  const handleMouseUp = () => {
    if(!isOptionsHovered && isCheckOut) setIsMouseDown(false);
  };
  const [isOptionsHovered, setIsOptionsHovered] = useState(false);
  useEffect(() => {
    setMakeActiveParentImpossible(true)
  },[isOptionsHovered])
  const friendParentMainParentClicked = (a,b) => {
    if(!isOptionsHovered && isCheckOut) handleGetDirectMessage(a,b);
  }
  
  return (
    <div 
      style={{
        ...(isHovered ? parentHover : transparentColor),
        ...(isMouseDown ? parentActive : ''),
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={ handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={()=> friendParentMainParentClicked(false,name)}  
      className='friend-list-main-parent'
    >
      <div
        className='friend-list-channel-box-parent'
      >
          <img src={channelLogo} alt="cags2 failed to load uwu" />
          <div className='friend-list-channel-box-name'>{name}</div>
      </div>
      <MoreOptionsSVG name={name} setUserSummary={setUserSummary} style={style} setStyle={setStyle} setIsCheckOut={setIsCheckOut} isVisible={isCheckVisible} setIsVisible={setIsCheckVisible} isHovered={isOptionsHovered} setIsHovered={setIsOptionsHovered} />
    </div>
)
}

function PendingFriendListChannel({flickerCheckFriendSwitch, friendRequest, channelLogo, name, handleGetDirectMessage}) {
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
  const handleAcceptFriendRequest = () => {
    const userTokens = JSON.parse(localStorage.getItem('userTokens'));
    const accessToken = userTokens?.accessToken;
  
    if (!accessToken) {
      console.error('Access token is not available');
      return;
    }
  
    axios.post('http://localhost:3000/acceptFriendRequest', {
      username: name
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(response => {
      flickerCheckFriendSwitch(name,'accept')
      console.log('Friend request accepted:', response.data);
    })
    .catch(error => {
      console.error('Error accepting friend request:', error);
    });
  };
  
  const handleDeclineFriendRequest = (name) => {
    const userTokens = JSON.parse(localStorage.getItem('userTokens'));
    const accessToken = userTokens?.accessToken;
  
    if (!accessToken) {
      console.error('Access token is not available');
      return;
    }
  
    axios.delete(`http://localhost:3000/declineFriendRequest/${name}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(response => {
      flickerCheckFriendSwitch(name)
      console.log('Friend request declined:', response.data);
      // Handle further actions upon success
    })
    .catch(error => {
      console.error('Error declining friend request:', error);
      // Handle errors
    });
  };
  
  const handleCancelFriendRequest = (name) => {
    const userTokens = JSON.parse(localStorage.getItem('userTokens'));
    const accessToken = userTokens?.accessToken;
  
    if (!accessToken) {
      console.error('Access token is not available');
      return;
    }
  
    axios.delete(`http://localhost:3000/cancelFriendRequest/${name}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(response => {
      flickerCheckFriendSwitch(name)
      console.log('Friend request canceled:', response.data);
    })
    .catch(error => {
      console.error('Error canceling friend request:', error);
    });
  };
  return (
    <div 
      style={{
        ...(isHovered ? parentHover : transparentColor),
        ...(isMouseDown ? parentActive : ''),
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      // onMouseDown={handleMouseDown}
      // onMouseUp={handleMouseUp}
      // onClick={()=> handleGetDirectMessage(false,name)}  
      className='friend-list-main-parent the-parent-of-something'
    >
      <div
        className='friend-list-channel-box-parent better-width-pro-parent'
      >
          <img src={channelLogo} alt="cags2 failed to load uwu" />
          <div className='the-income-out-parent'>
            <div className='friend-list-channel-box-name'>{name}</div>
            {!friendRequest&&
              <div className='incomeOutFriendRequest'>
                Incoming Friend Request
              </div>
            }
            {friendRequest&&
              <div className='incomeOutFriendRequest'>
                Outgoing Friend Request
              </div>
            }
          </div>
      </div>
      
      {!friendRequest &&
        <div className='accept-decline-friend-request'>
          <div className='accept' onClick={handleAcceptFriendRequest}>Accept</div>
          <div className='decline' onClick={() => handleDeclineFriendRequest(name)}>Decline</div>
        </div>
      }
      
      {friendRequest && 
        <div className='cancel-friend-request'>
          <div onClick={() => handleCancelFriendRequest(name)}>Cancel</div>
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

const MoreOptionsSVG = ({name,setUserSummary,style, setStyle,setIsCheckOut,isVisible, setIsVisible, isHovered, setIsHovered}) => {
  const handleDeclineFriendRequest = (name) => {
    const userTokens = JSON.parse(localStorage.getItem('userTokens'));
    const accessToken = userTokens?.accessToken;
  
    if (!accessToken) {
      console.error('Access token is not available');
      return;
    }
  
    axios.delete(`http://localhost:3000/removeFriend/${name}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    .then(response => {
      setUserSummary(old => {
        return {
          ...old,
          friends: old.friends.filter(friend => friend.name !== name)
        }
      })
    })
    .catch(error => {
      if(error.response && error.response.status === 404){
        setUserSummary(old => {
          return {
            ...old,
            friends: old.friends.filter(friend => friend.name !== name)
          }
        })
      }
      console.error('Error declining friend request:', error);
    });
  };

  const handleOptionsClick = () => {
    setIsVisible(!isVisible);
    setStyle({
      stroke: 'var(--text)',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: '0.1rem',
      fill: "var(--text)",
      opacity: '1',
    })

  }
  const toggleRef = useRef(null); 


  useEffect(() => {
    function handleClickOutside(event) {
      if (toggleRef.current && !toggleRef.current.contains(event.target)) {
        setIsVisible(false);
        setStyle({
          stroke: 'var(--text)',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeWidth: '0.1rem',
        })
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [toggleRef]);
  
  const handleAction = (action) => {
    
    setIsVisible(false); 
    setStyle({
      stroke: 'var(--text)',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeWidth: '0.1rem',
    })
    if(action === 'remove'){
      handleDeclineFriendRequest(name)
    }
  };
  const listStyles = {
    position: 'absolute',
    transform: 'translate(-105%,0%)',
    zIndex: 1000,
  };

  
  return (
    <div className='more-options-button-parent'>
      {isVisible && (
        <div style={listStyles}
          ref={toggleRef}
          onMouseEnter={() => setIsCheckOut(false)}
          onMouseLeave={() => setIsCheckOut(true)}
          className='the-friend-options-parent'
        >
          <ul className='friend-options-list-parent' style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <li className='friend-options-spy-call' onClick={() => handleAction('call')}>Start Voice Call</li>
            <li className='friend-options-spy-call' onClick={() => handleAction('view')}>Friend History</li>
            <li className='friend-options-remove' onClick={() => handleAction('remove')}>Remove Friend</li>
          </ul>
        </div>
      )}
      <div className='allow-for-title-header-parent'>
        <div className='more-options-message allow-for-title-header'>Options</div>
        <svg 
          ref={toggleRef}
          onClick={handleOptionsClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className='more-options-svg allow-for-title-header-parent' width="800px" height="800px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <g id="more">
            <circle style={style} cx="16" cy="16" r="3" />
            <circle style={style} cx="6" cy="16" r="3" />
            <circle style={style} cx="26" cy="16" r="3" />
          </g>
        </svg>
      </div>
    </div>
  );
};


export default DirectMessages