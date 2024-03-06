import React from 'react'
import './MessageScreenFooter.css'

export default function MessageScreenFooter({name,handleSendMessageChange, handleSubmitMessage, message}) {
  return (
    <div id='message-screen-footer-parent'>
      <div className='chat-box-inputs'>
        <button className='the-message-input'>+</button>
        <input 
          value={message} onChange={handleSendMessageChange} placeholder={'Message @'+name} type="text" 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmitMessage();
            }
          }}
        />
        <img onClick={handleSubmitMessage} className='chat-send-message' src="/sendMessage.svg" alt="cags2, oh no, failed :(" />
      </div>
    </div>
  )
}
