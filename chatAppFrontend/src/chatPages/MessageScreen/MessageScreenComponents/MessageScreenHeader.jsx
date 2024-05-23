import React from 'react'
import './MessageScreenHeader.css'
import { useEffect,useState } from 'react'
export default function MessageScreenHeader({channelLogo, userCurrentJoinedRoom}) {
  let [messageTypeGroup, setMessageTypeGroup] = useState(null);
  useEffect(()=>{
    if(userCurrentJoinedRoom[1]){
      setMessageTypeGroup(true)
    }else{
      setMessageTypeGroup(false)
    }
  },[userCurrentJoinedRoom])
  return (
    <div id="the-header-of-the-message-screen">
      <div
      className='direct-channel-box-parent-side'
      >
          <img src={channelLogo} alt="cags2 failed to load uwu" />
          <div className='direct-channel-box-name'>{messageTypeGroup ? 'Group Message' : 'Direct Message'}</div>
      </div>
      <img className='call-image-icon' src="/callIcon.svg" alt="cags2 drip failed to load" />          
    </div>
  )
}
