import React from 'react'
import './MessageScreenFooter.css'
import { getSocket } from '../../../socket-io-functions/authenticate-socket';

export default function MessageScreenFooter({groupId, userCurrentJoinedRoom, name,handleSendMessageChange, handleSubmitMessage, message}) {
  let socket = getSocket();
  return (
    <div id='message-screen-footer-parent'>
      <div className='chat-box-inputs'>
        <button className='the-message-input'>+</button>
        <input 
          value={message} onChange={handleSendMessageChange} placeholder={'Message @'+name} type="text" 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmitMessage(e);
            }
          }}
        />
        <img onClick={handleSubmitMessage} className='chat-send-message' src="/sendMessage.svg" alt="cags2, oh no, failed :(" />
      </div>
    </div>
  )
}
