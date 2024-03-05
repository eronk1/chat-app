import {useRef, useState, useEffect} from 'react'
import './DirectMessageChannels.css'
import DirectChannels from '../DirectChannels/DirectChannels'

function DirectMessageChannels() {
    let channels = [{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'},{name: 'Direct Messages', logo: '/cags2.png'}]
    const parentRef = useRef(null);
    return (
    <div id='direct-channels-parent-cags2'>
        <div id='add-direct-message-group'>
            <p className='user-title'>Direct Messages</p>
            <button className='create-group'>+</button>
        </div>
        <div ref={parentRef}>
                {channels.map((channel, index) => (
                    <DirectChannels
                    key={index}
                    channelLogo={channel.logo}
                    name={channel.name}
                    />
                ))}
            </div>
    </div>
  )
}

export default DirectMessageChannels