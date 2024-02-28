import React from 'react'
import './MessageScreenChatPartsParent.css'

// sender true means the user is the sender
export default function MessageScreenChatPartsParent() {
  let messages = [{sender:'@me', order:1, message:"blah blah blah blah something i ate something then something uwu something something"}]
  return (
    <div>
      <ActualMessage sender="@me" message={"blah blah blah asfkdjkladfsjklfd sajklfasd klkfjladsjlk dfaslj fasdklkjlfadskjladfsj kjlfadskjlafsjd kljklasdfjkafsdkjj asklfdlkjfadsljk flsadkjkjlf daskadfs kllfkadskdafslkj fl adskj"} />
    </div>
  )
}

function ActualMessage({sender, message}){
  if(sender==='@me'){
    return(
      <div className='actual-message-user-message-sent'>
        <div className='the-actual-message-parent-place'>
          <div className='the-message-body'>
            {message}
          </div>
        </div>
        <div className='triangle-right-up'></div>
      </div>
    )
  }else{
    return(
      <div className='actual-message-user-message-sent'>
        <div className='the-actual-message-parent-place'>
          <div className='the-message-body'>
            {message}
          </div>
        </div>
        <div className='triangle-right-up'></div>
      </div>
    )

  }
}