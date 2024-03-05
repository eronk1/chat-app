import React, { useState } from 'react';
import './DirectChannels.css'

function DirectChannels({channelLogo, name}) {

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
    const handleButtonClick = ()=>{

    }
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
        onClick={handleButtonClick}
    className='direct-channel-box-parent'
     >
        <img src={channelLogo} alt="cags2 failed to load uwu" />
        <div className='direct-channel-box-name'>{name}</div>
    </div>
  )
}

export default DirectChannels