import React from 'react'
import { useParams } from "react-router-dom";
import DirectMessages from '../DirectMessages/DirectMessages';
import ServerMessages from '../ServerMessages/ServerMessages';
import Channel from '../Channel/Channel';
import './ChannelMessage.css';

function ChannelMessage() {
    const { channelId, messageId } = useParams();

    return (
      <div id='channel-parent'>
        <Channel />
        {channelId=="@me" ? <DirectMessages /> : <ServerMessages />}
        <h2>Channel ID: {channelId}</h2>
        <h3>Message ID: {messageId}</h3>
      </div>
    );
}

export default ChannelMessage