import {useRef, useState, useEffect} from 'react'
import styles from './DirectMessageChannels.module.css'
import DirectChannels from '../DirectChannels/DirectChannels'
import { useNavigate } from 'react-router-dom';

function DirectMessageChannels({setShowSettingsContent,userSummary,handleGetDirectMessage, selectedChannel, directChannels, groupChannels, username, currentActive}) {
    let preChannels = directChannels;
    let preChannels2 = groupChannels;
    let channels = preChannels.map(channel =>{
        if(channel.users[0]==username){
            return {name: channel.users[1], channelId:channel._id, logo:'/cags2.png'}
        }
        return {name: channel.users[0], channelId:channel._id, logo:'/cags2.png'}
    });
    let channels2 = preChannels2.map(channel =>{
      if(channel.users[0]==username){
          return {name: channel.channelName, channelId: channel._id, logo:'/cags2.png'}
      }
      return {name: channel.users[0], channelId:channel._id, logo:'/cags2.png'}
    })
    const navigate = useNavigate();
    const parentRef = useRef(null);
    
    let parentHover = {
        backgroundColor: "var(--parent-hover)",
        cursor: "pointer"
    };
    let parentActive = {
        backgroundColor: "var(--parent-active)",
        cursor: "pointer"
    };
    let parentClicked = {
        backgroundColor: "var(--parent-clicked)",
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
    const handleFriendsPageRenderButton = () => {
        if(!currentActive){
            navigate('/channel/@me')
        }
    }


    
    const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
    const handleCreateGroupChannelClick = () => {
            setIsGroupDialogOpen(!isGroupDialogOpen);
    }

    const [checkedDialogState, setCheckedDialogState] = useState(
        userSummary.friends.reduce((acc, friend) => ({ ...acc, [friend.name]: false }), {})
      );
    
      // Adjusted to handle checkbox change based on friend's name
      const handleCheckboxDialogChange = (friendName) => {
        setCheckedDialogState((prevCheckedState) => ({
          ...prevCheckedState,
          [friendName]: !prevCheckedState[friendName],
        }));
      };
      
      useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
      }, []);;
      const myDivRefDialogBox = useRef()
      const myDivRefDialogBox2 = useRef()
      const handleClickOutside = (event) => {
          if((myDivRefDialogBox.current && !myDivRefDialogBox.current.contains(event.target))&&(myDivRefDialogBox2.current && !myDivRefDialogBox2.current.contains(event.target))) {
            setIsGroupDialogOpen(false);
          }
        };
    return (
    <div className={styles["direct-channels-parent-cags2"]}>
        <div className={styles['friends-page-render-button']}
            style={{
                ...(isHovered ? parentHover : transparentColor),
                ...(isMouseDown ? parentActive : ''),
                ...(currentActive ? parentClicked : '')
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onClick={handleFriendsPageRenderButton} 
        >
            <svg className={styles['svg-icon-pro']} style={{ width: '1.25em', height: '1em', verticalAlign: 'middle', fill: 'currentColor', overflow: 'hidden' }} viewBox="0 0 1280 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M384 512c123.8 0 224-100.2 224-224S507.8 64 384 64 160 164.2 160 288s100.2 224 224 224z m153.6 64h-16.6c-41.6 20-87.8 32-137 32s-95.2-12-137-32h-16.6C103.2 576 0 679.2 0 806.4V864c0 53 43 96 96 96h576c53 0 96-43 96-96v-57.6c0-127.2-103.2-230.4-230.4-230.4zM960 512c106 0 192-86 192-192s-86-192-192-192-192 86-192 192 86 192 192 192z m96 64h-7.6c-27.8 9.6-57.2 16-88.4 16s-60.6-6.4-88.4-16H864c-40.8 0-78.4 11.8-111.4 30.8 48.8 52.6 79.4 122.4 79.4 199.6v76.8c0 4.4-1 8.6-1.2 12.8H1184c53 0 96-43 96-96 0-123.8-100.2-224-224-224z" />
            </svg>
            <div className={styles['friends']}>Friends</div>
            {userSummary.friendPending.length != 0 && <div className={styles['friends-notification-number']}>{userSummary.friendPending.length<=9 ? userSummary.friendPending.length : "9+"}</div>}
        </div>
        <div className={styles['add-direct-message-group']}>
            <p className={styles['user-title']}>Direct Messages</p>
            <div ref={myDivRefDialogBox2} className={`allow-for-title-header-parent ${styles['parent-header-add-dm']}`}>
                <div className={`${styles['addition-title-dm-option']} allow-for-title-header`}>Create Group Chat</div>
                <svg id="Layer_1" onClick={handleCreateGroupChannelClick} className={styles['create-group']} data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 122.88"><title>add</title><path d="M61.44,0A61.46,61.46,0,1,1,18,18,61.25,61.25,0,0,1,61.44,0ZM88.6,56.82v9.24a4,4,0,0,1-4,4H70V84.62a4,4,0,0,1-4,4H56.82a4,4,0,0,1-4-4V70H38.26a4,4,0,0,1-4-4V56.82a4,4,0,0,1,4-4H52.84V38.26a4,4,0,0,1,4-4h9.24a4,4,0,0,1,4,4V52.84H84.62a4,4,0,0,1,4,4Zm8.83-31.37a50.92,50.92,0,1,0,14.9,36,50.78,50.78,0,0,0-14.9-36Z"/></svg>
            </div>
            {isGroupDialogOpen && <GroupMessageCreate
                friends={userSummary.friends}
                isGroupDialogOpen={isGroupDialogOpen}
                checkedState={checkedDialogState}
                setCheckedState={setCheckedDialogState}
                handleCheckboxChange={handleCheckboxDialogChange}
                myDivRefDialogBox={myDivRefDialogBox}
            />}
        </div>
        <div className={styles['direct-message-parent-pro-very']} ref={parentRef}>
                {channels.map((channel,index) => (
                    <DirectChannels
                        key={`${channel.channelId}-${index}`}
                        currentActive={currentActive}
                        channelLogo={channel.logo}
                        name={channel.name}
                        channelId={channel.channelId}
                        selectedChannel={selectedChannel}
                        handleGetDirectMessage={handleGetDirectMessage}
                    />
                ))}
                {channels2.map((channel,index) => (
                    <DirectChannels
                        key={`${channel.channelId}-${index}`}
                        currentActive={currentActive}
                        channelLogo={channel.logo}
                        name={channel.name}
                        channelId={channel.channelId}
                        selectedChannel={selectedChannel}
                        handleGetDirectMessage={handleGetDirectMessage}
                        isGroup={true}
                    />
                ))}
            </div>
            <UserSettingsParent setShowSettingsContent={setShowSettingsContent} userSummary={userSummary}/>
    </div>
  )
}

function GroupMessageCreate({myDivRefDialogBox, isGroupDialogOpen, friends, checkedState, setCheckedState, handleCheckboxChange }) {
    
  
    return (
      <div ref={myDivRefDialogBox} className={styles['group-message-dialog-box']}>
        <div className={styles["modal-content-dialog-group-channel"]}>
          <h2 className={styles['group-dialog-model-header']}>Create Group Channel</h2>
          <h3 className={styles['group-dialog-model-header-2']}>Maximum members of 10</h3>
          <div className={styles["checkbox-list"]}>
            {friends.map((friend, index) =>
              <div key={index} className={`${styles['checkbox-group-item-parent']} ${checkedState[friend.name] ? styles['parentForDialogGroupClicked'] : ''}`} onClick={() => handleCheckboxChange(friend.name)}>
                <div className={styles['each-group-item-checkbox-label']} htmlFor={`checkbox-${friend.name}`}>{friend.name}</div>
                <input
                    className={styles['each-group-item-checkbox']}
                    type="checkbox"
                    id={`checkbox-${friend.name}`}
                    checked={checkedState[friend.name]}
                    onChange={()=> handleCheckboxChange(friend.name)}
                />
              </div>
            )}
          </div>
          <button className={styles['create-group-channel-dialog']}>Create</button>
        </div>
      </div>
    );
  }





function UserSettingsParent({userSummary,setShowSettingsContent}){
  
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
      <div className={styles['user-settings-svg-parent']}>
        <div
          className={styles['direct-channel-box-parent']}
        >
            <img src='/cags2.png' alt="cags2 failed to load uwu" />
            <div className={styles['direct-channel-box-name']}
            >{userSummary.username}</div>
        </div>
        <svg
          className={styles['user-settings-svg-icon']} fill="#000000" height="800px" width="800px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 489.802 489.802" xmlSpace="preserve"
          style={{
            ...(isHovered ? parentHover : transparentColor),
            ...(isMouseDown ? parentActive : ''),
          }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onClick={() => setShowSettingsContent(old => !old)}
          >
          <g>
            <path d="M20.701,281.901l32.1,0.2c4.8,24.7,14.3,48.7,28.7,70.5l-22.8,22.6c-8.2,8.1-8.2,21.2-0.2,29.4l24.6,24.9 c8.1,8.2,21.2,8.2,29.4,0.2l22.8-22.6c21.6,14.6,45.5,24.5,70.2,29.5l-0.2,32.1c-0.1,11.5,9.2,20.8,20.7,20.9l35,0.2 c11.5,0.1,20.8-9.2,20.9-20.7l0.2-32.1c24.7-4.8,48.7-14.3,70.5-28.7l22.6,22.8c8.1,8.2,21.2,8.2,29.4,0.2l24.9-24.6 c8.2-8.1,8.2-21.2,0.2-29.4l-22.6-22.8c14.6-21.6,24.5-45.5,29.5-70.2l32.1,0.2c11.5,0.1,20.8-9.2,20.9-20.7l0.2-35 c0.1-11.5-9.2-20.8-20.7-20.9l-32.1-0.2c-4.8-24.7-14.3-48.7-28.7-70.5l22.8-22.6c8.2-8.1,8.2-21.2,0.2-29.4l-24.6-24.9 c-8.1-8.2-21.2-8.2-29.4-0.2l-22.8,22.6c-21.6-14.6-45.5-24.5-70.2-29.5l0.2-32.1c0.1-11.5-9.2-20.8-20.7-20.9l-35-0.2 c-11.5-0.1-20.8,9.2-20.9,20.7l-0.3,32.1c-24.8,4.8-48.8,14.3-70.5,28.7l-22.6-22.8c-8.1-8.2-21.2-8.2-29.4-0.2l-24.8,24.6 c-8.2,8.1-8.2,21.2-0.2,29.4l22.6,22.8c-14.6,21.6-24.5,45.5-29.5,70.2l-32.1-0.2c-11.5-0.1-20.8,9.2-20.9,20.7l-0.2,35 C-0.099,272.401,9.201,281.801,20.701,281.901z M179.301,178.601c36.6-36.2,95.5-35.9,131.7,0.7s35.9,95.5-0.7,131.7 s-95.5,35.9-131.7-0.7S142.701,214.801,179.301,178.601z"/>
          </g>
        </svg>
      </div>
  )
}




export default DirectMessageChannels
