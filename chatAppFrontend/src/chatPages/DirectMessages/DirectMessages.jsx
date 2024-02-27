import React from 'react'
import './DirectMessages.css'
import DirectMessageChannels from './DirectMessageChannels'
import MessageScreen from '../MessageScreen/MessageScreen'

function DirectMessages() {
  return (
    <div id='direct-messages-parent'>
      <DirectMessageChannels />
      <MessageScreen />
    </div>
  )
}

export default DirectMessages