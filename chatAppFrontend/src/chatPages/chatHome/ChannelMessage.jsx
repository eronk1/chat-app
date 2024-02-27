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
      </div>
    );
}

export default ChannelMessage