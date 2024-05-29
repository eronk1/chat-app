import {useState,useEffect, useRef} from 'react'
import './DirectMessages.css'
import DirectMessageChannels from './DirectMessageChannels'
import { useParams, Outlet, useNavigate } from "react-router-dom";
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '../../socket-io-functions/authenticate-socket';
import useOutsideCheck from './extra-direct-message-stuff/use-outside-check';

function DirectMessages({createGroupChat,userCurrentJoinedRoom,setUserCurrentJoinedRoom,setShowSettingsContent,gotDirect,setGotDirect,userSummary, setUserSummary, directMessages, setDirectMessages}) {
  const { messageId } = useParams();
  const navigate = useNavigate();

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
        console.log(response.data, 'check pro ahiafhdsihfadsio noadfkn fjas')
        console.log(response.data.isGroup)
        if(response.data.isGroup){
          setUserCurrentJoinedRoom([id,true])
        }else{
          setUserCurrentJoinedRoom([id,false])
        }
        setDirectMessages(response.data);
        setGotDirect(true);
        let socket = await getSocket();
        // if(response.data.channel){
          socket.emit('direct-message-join', {groupId: response.data._id});
        // }else{
        //   socket.emit('joinRoom', {groupId: response.data._id});
        // }
      } catch (error) {
        console.error("Error fetching direct message:", error);
        setGotDirect(false);
      }
    }
  };

  fetchData(messageId);
}, [userCurrentJoinedRoom, directMessages]);
  let handleGetDirectMessage = async (id,username="",isGroup=false) => {
    if(selected === id){
      navigate(`/channel/@me/${id}`); 
      return;
    }
    const token = JSON.parse(localStorage.getItem('userTokens'));
    console.log(id,"id")
    console.log(username, 'username')
    console.log(!id && username, "check !id username")
    if(!id && username != ""){
      console.log('getting sent out here')
      try {
        const response = await axios.get(`http://localhost:3000/channel/getDirectChannel/${username}`, {
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
              },
              params: {
                group: isGroup,
              }
            });
        let socket = getSocket();
        if(userCurrentJoinedRoom[0]){
          socket.emit('direct-message-leave', {groupId: userCurrentJoinedRoom[0]});
        }
        console.log(response);
        setDirectMessages(response.data);
        socket.emit('direct-message-join', {groupId: response.data._id});
    
        setGotDirect(true);
        navigate(`/channel/@me/${response.data._id}`); 
      } catch (error) {
        setGotDirect(false);
        console.error("Error fetching direct message:", error);
      }
    }
    if(!id) return;
    if(username) id = findChannelIdByUsername(userSummary, username);

    try {
      const response = await axios.get(`http://localhost:3000/channel/@me/${id}`, {
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
            params: {
              group: isGroup,
            }
          });
      setDirectMessages(response.data)
      setGotDirect(true);
      let socket = getSocket();
      if(userCurrentJoinedRoom[0]){
        socket.emit('direct-message-leave', {groupId: userCurrentJoinedRoom[0]});
      }
      setUserCurrentJoinedRoom([response.data._id,isGroup])

      setDirectMessages(response.data);
      socket.emit('direct-message-join', {groupId: response.data._id});
      navigate(`/channel/@me/${id}`); 
    } catch (error) {
      setGotDirect(false);
      console.error("Error fetching direct message:", error);
    }
  };

  return (
      <div id='direct-messages-parent'>
        <DirectMessageChannels setUserCurrentJoinedRoom={setUserCurrentJoinedRoom} setDirectMessages={setDirectMessages} createGroupChat={createGroupChat} setShowSettingsContent={setShowSettingsContent} userSummary={userSummary} currentActive={messageId ? false : true} handleGetDirectMessage={handleGetDirectMessage} selectedChannel={selected} username={userSummary.username} directChannels={userSummary.directChannels} groupChannels={userSummary.groupChannels} />
        {messageId && gotDirect ? <Outlet context={{directMessages, setDirectMessages}} /> : <FriendListPage setUserCurrentJoinedRoom={setUserCurrentJoinedRoom} setGotDirect={setGotDirect} setDirectMessages={setDirectMessages} userSummary={userSummary} setUserSummary={setUserSummary} handleGetDirectMessage={handleGetDirectMessage} />}
      </div>
  )
}



function FriendListPage({ setGotDirect, setDirectMessages,setUserSummary, handleGetDirectMessage, userSummary, setUserCurrentJoinedRoom }) {
  const {friendRequest, friendPending, friends} = userSummary;
  const [activeTab, setActiveTab] = useState('all-friends'); // State to track active tab
  const [receivedMessage, setRecievedMessage] = useState("");
  let theFriendsFlickerSwitch = (inputData, check='')=>{
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
  }
  let parentClicked = {
    backgroundColor: "#98979e78",
    opacity: 1
  };
  let [addFriendInputFocus, setAddFriendInputFocus] = useState(false);
  const [sendFriendRequestButtonStyle, setSendFriendRequestButtonStyle] = useState({border: "0.1rem solid var(--background4)"})

  

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
    let socket = getSocket();
    
    if (!accessToken) {
      console.error('Access token is not available');
      return;
    }

    socket.emit('friendRequest', { username, token: accessToken }, (response) => {
        if (response.status >= 200 && response.status < 300) {
          friendRequest.push(username);
          setRecievedMessage(response.message);
          setSendFriendRequestButtonStyle({ border: "0.1rem solid var(--submit-button)" });
          setTrueChangeFriend(true);
          setTempUsername(username);
          setUsername('');
        } else {
          if (response && response.status === 500) {
            setRecievedMessage("Something went wrong"); 
          } else {
            setRecievedMessage(response.message);
          }
          setSendFriendRequestButtonStyle({ border: "0.1rem solid var(--logout)" });
          setTrueChangeFriend(true);
        }
      });
  };
  const [friendUserSumamry, setFriendUserSummary] = useState(null);
  const [openFriendSummaryBox, setOpenFriendSummaryBox] = useState(false);
  
  const friendSummaryDialogRef = useRef(null);
  useEffect(()=>{
    console.log('started hi mode pro bla29')
    let currentDialog = friendSummaryDialogRef.current;
    console.log(openFriendSummaryBox,'frienduserSum:', friendUserSumamry)
    if(openFriendSummaryBox && friendUserSumamry){
      currentDialog.showModal();
    }else{
      setFriendUserSummary(null);
      if(currentDialog){
        currentDialog.close();
      }
    }
  },[openFriendSummaryBox])

  useEffect(() => {
    const handleClickOutside = (e) => {
      const dialogFS = friendSummaryDialogRef.current;
      if (dialogFS) {
        const dialogDimensions = dialogFS.getBoundingClientRect();
        if (
          e.clientX < dialogDimensions.left ||
          e.clientX > dialogDimensions.right ||
          e.clientY < dialogDimensions.top ||
          e.clientY > dialogDimensions.bottom
        ) {
          dialogFS.close();
          setOpenFriendSummaryBox(null);
          
        }
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  const handleGetFriendSummary = (username) => {
    const userTokens = JSON.parse(localStorage.getItem('userTokens'));
    const accessToken = userTokens?.accessToken;
    let socket = getSocket();

    socket.emit('getFriendUserSummary', {username, token: accessToken}, (response) => {
      if(response.status >= 200 && response.status < 300){
        setFriendUserSummary(response.friendUserSummary);
        setOpenFriendSummaryBox(true);
      }else{
        if(response && response.message){
          console.error(response.message);
          return;
        }
        console.error('something went wrong');
      }
    })
  }

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
const calculateAge = (birthdate) => {
  const today = new Date();
  const birthDate = new Date(birthdate.year, birthdate.month - 1, birthdate.day); // month is 0-indexed
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};
let mSum = null;
if(friendUserSumamry){
  mSum = friendUserSumamry.friends.map((friend, key) => {
    if (userSummary.friends.some(val => val.name === friend.name)) {
      return <div className='friend-names' key={key}>{friend.preferredName} / {friend.name}</div>;
    }
    return null;
  })
}
if(mSum){
  mSum = mSum.filter(sum => sum != null)
}
let friendNames = friendUserSumamry ? friendUserSumamry.friends.map((friend, key) => {
  return <div className='friend-names' key={key}>{friend.preferredName} / {friend.name}</div>;
}) : null;
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
          <FriendListChannel handleGetFriendSummary={handleGetFriendSummary} setUserSummary={setUserSummary} handleGetDirectMessage={handleGetDirectMessage} channelLogo={'/cags2.png'} name={friend.name} preferredName={friend.preferredName}/>
        </div>
      ))}
      {(activeTab === "pending-friends") && friendRequest.map((friend, index) => (
        <div className='the-friend-active-check' key={index}>
          <PendingFriendListChannel setUserCurrentJoinedRoom={setUserCurrentJoinedRoom} setGotDirect={setGotDirect} setUserSummary={setUserSummary} userSummary={userSummary} setDirectMessages={setDirectMessages} flickerCheckFriendSwitch={theFriendsFlickerSwitch} friendRequest={true} handleGetDirectMessage={handleGetDirectMessage} channelLogo={'/cags2.png'} name={friend} />
        </div>
      ))}
      {(activeTab === "pending-friends") && friendPending.map((friend, index) => (
        <div className='the-friend-active-check' key={index}>
          <PendingFriendListChannel setUserCurrentJoinedRoom={setUserCurrentJoinedRoom} setGotDirect={setGotDirect} setUserSummary={setUserSummary} userSummary={userSummary} setDirectMessages={setDirectMessages} flickerCheckFriendSwitch={theFriendsFlickerSwitch} friendRequest={false} handleGetDirectMessage={handleGetDirectMessage} channelLogo={'/cags2.png'} name={friend} />
        </div>
      ))}
      {activeTab === "add-friends" && 
          <div
            style={{
              ...(sendFriendRequestButtonStyle),
              ...((!trueChangeFriend && addFriendInputFocus) ? { border: "0.1rem solid var(--accent)" } : ''),
              ...((!trueChangeFriend && !addFriendInputFocus) ? { border: "0.1rem solid var(--background4)" } : {})
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
          {receivedMessage}
        </div>
      }
      {((activeTab === "add-friends" && trueChangeFriend) && sendFriendRequestButtonStyle.border == "0.1rem solid var(--logout)" ) && 
        <div className='awe-man-you-failed-request-cags2'>
          {receivedMessage}
        </div>
      }
      <AnimatePresence>
      {friendUserSumamry && (
        <motion.dialog
          ref={friendSummaryDialogRef}
          id='friend-user-summary-box-parent'
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className='exit-settings-screen' onClick={() => setOpenFriendSummaryBox(false)}>
            <svg fill="#000000" width="100%" height="100%" viewBox="0 0 460.775 460.775" preserveAspectRatio="xMidYMid meet">
              <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55
                c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55
                c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505
                c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55
                l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719
                c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"/>
            </svg>
          </div>
          <div id='friend-user-summary-general-info'>
            <div className='names'><span className='starters'>Display Name:</span> {friendUserSumamry.preferredName}</div>
            <div className='names'><span className='starters'>Username:</span> {friendUserSumamry.username}</div>
            <div className='names'><span className='starters'>Gender:</span> {friendUserSumamry.gender}</div>
            <div className='names'>
              <span className='starters'>Age:</span> {calculateAge(friendUserSumamry.age)}
            </div>
            <div className='names'>
              <span className='starters'>Birthday:</span> {friendUserSumamry.age.month}/{friendUserSumamry.age.day}/{friendUserSumamry.age.year}
            </div>
          </div>
          <div className='friend-dialog-tab names'>
            <p className='starters'>Mutual friends:</p>
            <div className='friend-names-parent'>
              {mSum.length ? <div className='friend-names-header'>Display Name / Username</div>:''}
              {mSum.length? mSum : 'No Mutuals :('}
            </div>
          </div>
          <div className='friend-dialog-tab friend-dialog-tab-area-c names'>
            <p className='starters'>All <span id='mm-friends-pre'>{friendUserSumamry.preferredName}</span>'s friends:</p>
            <div className='friend-names-parent'>
              {friendNames && <div className='friend-names-header'>Display Name / Username</div>}
              {friendNames ?
                friendNames
              : 'No Friends :('}
            </div>
          </div>
        </motion.dialog>
      )}
    </AnimatePresence>
    </div>
  );
}










function FriendListChannel({handleGetFriendSummary,setUserSummary,channelLogo,preferredName, name, handleGetDirectMessage}) {
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
  let friendListMainParentRef = useRef(null);
  useOutsideCheck(friendListMainParentRef, isCheckVisible, setIsCheckVisible);
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
      ref={friendListMainParentRef}
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
          <div className='friend-list-channel-box-name'>{preferredName}<span className='actual-username'>{name}</span></div>
      </div>
      <MoreOptionsSVG handleGetFriendSummary={handleGetFriendSummary} name={name} setUserSummary={setUserSummary} style={style} setStyle={setStyle} setIsCheckOut={setIsCheckOut} isVisible={isCheckVisible} setIsVisible={setIsCheckVisible} isHovered={isOptionsHovered} setIsHovered={setIsOptionsHovered} />
    </div>
)
}

function PendingFriendListChannel({setUserCurrentJoinedRoom,setGotDirect, userSummary, setUserSummary, setDirectMessages,flickerCheckFriendSwitch, friendRequest, channelLogo, name, handleGetDirectMessage}) {
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
  let navigate = useNavigate();

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
    let socket = getSocket();
    const userTokens = JSON.parse(localStorage.getItem('userTokens'));
    const accessToken = userTokens?.accessToken;
  
    if (!accessToken) {
      console.error('Access token is not available');
      return;
    }
  
    socket.emit('acceptFriendRequest', {
        token: accessToken,
        username: name
    }, (response) => {
        if (response.status >= 200 && response.status < 300) {
            flickerCheckFriendSwitch(name, 'accept');
            try{
              let dm = response.directMessages;
              setDirectMessages(dm)
              setGotDirect(true);
              setUserCurrentJoinedRoom([dm._id,false])
              if(userSummary){
                setUserSummary(old => {
                  return {
                    ...old,
                    directChannels: old.directChannels.some(val => val._id == dm._id) ? old.directChannels : [...old.directChannels, {users: dm.users, _id:dm._id, preferredName: dm.preferredName}] ,
                    friends: old.friends.includes(response.sender) ? old.friends : [...old.friends, {name: response.sender}],
                    friendPending: old.friendPending.filter(friend => friend !== response.sender)
                  };
                })
              }
              navigate(`/channel/@me/${dm._id}`); 
            }catch(e){
              setGotDirect(false);
              console.log(e)
            }
            console.log('Friend request accepted:', response.message);
        } else {
            console.error('Error accepting friend request:', response.message);
        }
    });
  };
  
  const handleDeclineFriendRequest = (name) => {
    const userTokens = JSON.parse(localStorage.getItem('userTokens'));
    const accessToken = userTokens?.accessToken;
  
    if (!accessToken) {
      console.error('Access token is not available');
      return;
    }
    let socket = getSocket();
    socket.emit('declineFriendRequest', {
        token: accessToken,
        username: name
    }, (response) => {
        if (response.status >= 200 || response.status < 300) {
            flickerCheckFriendSwitch(name);
            console.log('Friend request declined:', response.message);
        } else {
            console.error('Error declining friend request:', response.message);
        }
    });
  };
  
  const handleCancelFriendRequest = (name) => {
      const userTokens = JSON.parse(localStorage.getItem('userTokens'));
      const accessToken = userTokens?.accessToken;
      let socket = getSocket();
      if (!accessToken) {
          console.error('Access token is not available');
          return;
      }

      socket.emit('cancelFriendRequest', {
          token: accessToken,
          username: name
      }, (response) => {
          if (response.status >= 200 && response.status < 300) {
              flickerCheckFriendSwitch(name);
              console.log('Friend request cancelled:', response.message);
          } else {
              console.error('Error cancelling friend request:', response.message);
          }
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

const MoreOptionsSVG = ({handleGetFriendSummary,name,setUserSummary,style, setStyle,setIsCheckOut,isVisible, setIsVisible, isHovered, setIsHovered}) => {
  const handleDeclineFriendRequest = (name) => {
    const userTokens = JSON.parse(localStorage.getItem('userTokens'));
    const accessToken = userTokens?.accessToken;
  
    if (!accessToken) {
      console.error('Access token is not available');
      return;
    }
  let socket = getSocket();
    socket.emit('removeFriend', {
        token: accessToken,
        username: name
    }, (response) => {
        if (response.status >= 200 && response.status < 300) {
            setUserSummary(old => ({
                ...old,
                friends: old.friends.filter(friend => friend.name !== name)
            }));
            console.log('Friend removed:', response.message);
        } else if (response.status === 404) {
            setUserSummary(old => ({
                ...old,
                friends: old.friends.filter(friend => friend.name !== name)
            }));
            console.error('Error removing friend:', response.message);
        } else {
            console.error('Error removing friend:', response.message);
        }
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
    if(action === 'view'){
      handleGetFriendSummary(name)
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
            <li className='friend-options-spy-call' onClick={() => handleAction('view')}>Friend Profile</li>
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