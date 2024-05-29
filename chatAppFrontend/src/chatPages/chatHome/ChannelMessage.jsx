import React from 'react'
import { useParams, Outlet } from "react-router-dom";
import Channel from '../Channel/Channel';
import './ChannelMessage.css';

function ChannelMessage({userSummary}) {
    
    return (
      <div id='channel-parent'>
        {/* <Channel /> */}
        <Outlet />
      </div>
    );
}

export default ChannelMessage