import {useRef, useState, useEffect} from 'react'
import './DirectMessageChannels.css'
import DirectChannels from '../DirectChannels/DirectChannels'

function DirectMessageChannels({handleGetDirectMessage, selectedChannel, directChannels, groupChannels, username}) {
    let preChannels = directChannels;
    let channels = preChannels.map(channel =>{
        if(channel.users[0]==username){
            return {name: channel.users[1], channelId:channel._id, logo:'/cags2.png'}
        }
        return {name: channel.users[0], channelId:channel._id}
    });
    const parentRef = useRef(null);
    return (
    <div id='direct-channels-parent-cags2'>
        <div id='add-direct-message-group'>
            <p className='user-title'>Direct Messages</p>
            <button className='create-group'>+</button>
        </div>
        <div ref={parentRef}>
                {channels.map((channel) => (
                    <DirectChannels
                        key={channel.channelId}
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