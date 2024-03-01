import React from 'react'
import './MessageScreenChatPartsParent.css'

// sender true means the user is the sender
export default function MessageScreenChatPartsParent() {
  let messages = [{sender:'@me', order:1, message:"blah blah blah blah something i ate something then something uwu something something"}]
  return (
    <div id='the-actual-fr-message-parent'>
      <ActualMessage sender="@me" message={"blah blah blah asfkdjkladfsjklfd sajklfasd klkfjladsjlk dfaslj fasdklkjlfadskjladfsj kjlfadskjlafsjd kljklasdfjkafsdkjj asklfdlkjfadsljk flsadkjkjlf daskadfs kllfkadskdafslkj fl adskj"} />
      <ActualMessage sender="@me" message={"blah blah blah asfkdjkladfsjklfd sajklfasd klkfjladsjlk dfaslj fasdklkjlfadskjladfsj kjlfadskjlafsjd kljklasdfjkafsdkjj asklfdlkjfadsljk flsadkjkjlf daskadfs kllfkadskdafslkj fl adskj"} />
      <ActualMessage sender="@me" message={"blah blah blah asfkdjkladfsjklfd sajklfasd klkfjladsjlk dfaslj fasdklkjlfadskjladfsj kjlfadskjlafsjd kljklasdfjkafsdkjj asklfdlkjfadsljk flsadkjkjlf daskadfs kllfkadskdafslkj fl adskj"} />
      <ActualMessage pfp="/cags2.png" sender="anton pro" message={"blah blah blah asfkdjkla fadsjf jkklad flkj fdkjf djkkf dsfdjfs dljkj fk4jije jirf jir ejio erji erjio erji jeiogj erjie joer joijo eriij egiojg e oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjeio egijogejioegijeoj gj ge"} />
      <ActualMessage pfp="/cags2.png" sender="anton pro" message={"blah blah blah asfkdjkla fadsjf jkklad flkj fdkjf djkkf dsfdjfs dljkj fk4jije jirf jir ejio erji erjio erji jeiogj erjie joer joijo eriij egiojg e oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjeio egijogejioegijeoj gj ge"} />
      <ActualMessage pfp="/cags2.png" sender="anton pro" message={"blah blah blah asfkdjkla fadsjf jkklad flkj fdkjf djkkf dsfdjfs dljkj fk4jije jirf jir ejio erji erjio erji jeiogj erjie joer joijo eriij egiojg e oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjee oijegjioeg jiogjeio egijogejioegijeoj gj ge"} />
    </div>
  )
}

function ActualMessage({sender, message, pfp}){
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
      <div id='the-actual-fr-message-parent-fr'>
        <img className='very-pro-image-lol' src={pfp} alt="cags2 (uwu) failed" />
        <div className='the-parent-amongst-parents-into-the-wild'>
          <p className='very-pro-sender-message'>{sender}</p>
          <div className='actual-message-user-message-sent-other'>
            <div className='triangle-right-up-other'></div>
            <div className='the-actual-message-parent-place-server-other'>
              <div className='the-message-body'>
                {message}
              </div>
            </div>
          </div>
        </div>
      </div>
    )

  }
}