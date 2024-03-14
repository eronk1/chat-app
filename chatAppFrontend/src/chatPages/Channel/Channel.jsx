import React from 'react'
import { useState, useEffect, useRef } from 'react';
import './Channel.css'
function Channel() {
    let channels = [{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'}]
    const [childTop, setChildTop] = useState(0); // Initial top position of the child
    const parentRef = useRef(null);
    useEffect(() => {
        const handleScroll = () => {
          if (parentRef.current) {
            const scrolled = parentRef.current.scrollTop;
            setChildTop(scrolled); // Adjust 50 to your initial fixed position
          }
        };
    
        const parent = parentRef.current;
        parent.addEventListener('scroll', handleScroll);
    
        return () => parent.removeEventListener('scroll', handleScroll);
      }, []);
    return (
        <div id='channel-left-side-bar-parent'>
            <div id='direct-messages-channel'>
                <img id='direct-messages-channel-app-logo' src={channels[0].logo} alt="chrizz failed to load :(" />
                <div className='show-channel-desc'>Direct Messages</div>
            </div>
            <div id='server-channels' ref={parentRef}>
                {channels.map((channel, index) => (
                    <ServerChannel
                    key={index}
                    childTop={childTop} // Assuming childTop is defined somewhere in your code
                    channelLogo={channel.logo}
                    serverName={"water"} // Assuming you want to pass a static name to each ServerChannel
                    />
                ))}
            </div>
        </div>
    )
}

function ServerChannel({channelLogo, serverName, childTop}){
    return (
        <div className='server-messages-channel'>
            <img className='server-channel-app-logo' src={channelLogo} alt="chrizz failed to load :(" />
            <div style={{ transform: `translate(110%,-${childTop}px)` }} className='show-channel-desc'>{serverName}</div>
        </div>
    )
}
export default Channel