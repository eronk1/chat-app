import React from 'react'
import './MessageScreenFooter.css'

export default function MessageScreenFooter({name}) {
  return (
    <div id='message-screen-footer-parent'>
      <div className='chat-box-inputs'>
        <button className='the-message-input'>+</button>
        <input placeholder={'Message @'+name} type="text" />
        <img className='chat-send-message' src="/sendMessage.svg" alt="cags2, oh no, failed :(" />
      </div>
    </div>
  )
}
