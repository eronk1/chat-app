import React from 'react'
import './MessageScreen.css'
import MessageScreenHeader from './MessageScreenComponents/MessageScreenHeader'
import MessageScreenChatPartsParent from './MessageScreenChatParts/MessageScreenChatPartsParent'
import MessageScreenFooter from './MessageScreenComponents/MessageScreenFooter'

function MessageScreen() {
  return (
    <div id='the-message-screen-parent'>
        <MessageScreenHeader />
        <MessageScreenChatPartsParent />
        <MessageScreenFooter />
    </div>
  )
}

export default MessageScreen