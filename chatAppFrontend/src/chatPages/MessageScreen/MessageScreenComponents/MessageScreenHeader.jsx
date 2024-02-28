import React from 'react'
import './MessageScreenHeader.css'

export default function MessageScreenHeader({channelLogo, name}) {

  return (
    <div id="the-header-of-the-message-screen">
      <div
      className='direct-channel-box-parent-side'
      >
          <img src={channelLogo} alt="cags2 failed to load uwu" />
          <div className='direct-channel-box-name'>{name}</div>
      </div>
      <img className='call-image-icon' src="/callIcon.svg" alt="cags2 drip failed to load" />          
    </div>
  )
}
