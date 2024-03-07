import {useRef, useState, useEffect} from 'react'
import './DirectMessageChannels.css'
import DirectChannels from '../DirectChannels/DirectChannels'
import { useNavigate } from 'react-router-dom';

function DirectMessageChannels({handleGetDirectMessage, selectedChannel, directChannels, groupChannels, username, currentActive}) {
    let preChannels = directChannels;
    let channels = preChannels.map(channel =>{
        if(channel.users[0]==username){
            return {name: channel.users[1], channelId:channel._id, logo:'/cags2.png'}
        }
        return {name: channel.users[0], channelId:channel._id}
    });
    const navigate = useNavigate();
    const parentRef = useRef(null);
    
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
    const handleFriendsPageRenderButton = () => {
        if(!currentActive){
            navigate('/channel/@me')
        }
    }

    return (
    <div id='direct-channels-parent-cags2'>
        <div className='friends-page-render-button'
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
            <svg className="svg-icon-pro" style={{ width: '1.25em', height: '1em', verticalAlign: 'middle', fill: 'currentColor', overflow: 'hidden' }} viewBox="0 0 1280 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <path d="M384 512c123.8 0 224-100.2 224-224S507.8 64 384 64 160 164.2 160 288s100.2 224 224 224z m153.6 64h-16.6c-41.6 20-87.8 32-137 32s-95.2-12-137-32h-16.6C103.2 576 0 679.2 0 806.4V864c0 53 43 96 96 96h576c53 0 96-43 96-96v-57.6c0-127.2-103.2-230.4-230.4-230.4zM960 512c106 0 192-86 192-192s-86-192-192-192-192 86-192 192 86 192 192 192z m96 64h-7.6c-27.8 9.6-57.2 16-88.4 16s-60.6-6.4-88.4-16H864c-40.8 0-78.4 11.8-111.4 30.8 48.8 52.6 79.4 122.4 79.4 199.6v76.8c0 4.4-1 8.6-1.2 12.8H1184c53 0 96-43 96-96 0-123.8-100.2-224-224-224z" />
            </svg>
            <div>Friends</div>
        </div>
        <div id='add-direct-message-group'>
            <p className='user-title'>Direct Messages</p>
            <button className='create-group'>+</button>
        </div>
        <div ref={parentRef}>
                {channels.map((channel) => (
                    <DirectChannels
                        key={channel.channelId}
                        currentActive={currentActive}
                        channelLogo={channel.logo}
                        name={channel.name}
                        channelId={channel.channelId}
                        selectedChannel={selectedChannel}
                        handleGetDirectMessage={handleGetDirectMessage}
                    />
                ))}
            </div>
    </div>
  )
}

export default DirectMessageChannels