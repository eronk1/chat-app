import React from 'react'
import { useParams, Outlet } from "react-router-dom";
import Channel from '../Channel/Channel';
import './ChannelMessage.css';

function ChannelMessage({userSummary, channels, channelUsername}) {
    
    return (
      <div id='channel-parent'>
        <Channel channels={channels} channelUsername={channelUsername} />
        <Outlet />
      </div>
    );
}

export default ChannelMessage