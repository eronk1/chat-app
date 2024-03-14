import {useEffect} from 'react'
import './MessageScreenChatPartsParent.css'
// sender true means the user is the sender
export default function MessageScreenChatPartsParent({directMessages, username}) {
  useEffect(()=>{
    scrollToEnd();
  },[directMessages])
  if(!directMessages.messages){
    return <div></div>;
  }
  let messages = directMessages.messages.map((message)=>{
    if(!message) return {sender: null}
    if(message.sender === username){
      return {sender: '@me', message: message.message, timestamp: message.timestamp}
    }
    return {sender: message.sender, message: message.message, timestamp: message.timestamp, id: message.id}
  })
  let actualMessages = messages.map((message,id)=>{
    if(!message.sender) return;
    let timeMessage = formatTimestamp(message.timestamp)
    return <ActualMessage key={id} pfp="/cags2.png" timeMessage={timeMessage} sender={message.sender} message={message.message} />
  })

  return (
    <div id='the-actual-fr-message-parent'>
      {actualMessages}
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






function formatTimestamp(timestamp) {
  const timestampDate = new Date(timestamp);
  const now = new Date();
  const formatterTime = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  const formatterDate = new Intl.DateTimeFormat('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

  // Calculate the difference in days
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const timestampDay = new Date(timestampDate.setHours(0, 0, 0, 0));
  const dayDifference = (startOfDay - timestampDay) / (1000 * 60 * 60 * 24);

  if (dayDifference < 1) {
    // Today
    return `Today at ${formatterTime.format(timestampDate)}`;
  } else if (dayDifference < 2) {
    // Yesterday
    return `Yesterday at ${formatterTime.format(timestampDate)}`;
  } else {
    // Other date
    return `${formatterDate.format(timestampDate)} ${formatterTime.format(timestampDate)}`;
  }
}

const scrollToEnd = () => {
  const messagesContainer = document.getElementById('the-actual-fr-message-parent');
  if (messagesContainer) {
    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: 'smooth'
    });
  }
};