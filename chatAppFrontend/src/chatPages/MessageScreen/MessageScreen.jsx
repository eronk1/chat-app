import {useState, useEffect} from 'react'
import './MessageScreen.css'
import MessageScreenHeader from './MessageScreenComponents/MessageScreenHeader'
import MessageScreenChatPartsParent from './MessageScreenChatParts/MessageScreenChatPartsParent'
import MessageScreenFooter from './MessageScreenComponents/MessageScreenFooter'
import { useOutletContext, useParams } from 'react-router-dom';
import axios from 'axios'
import { sendDirectMessage, onDirectMessageReceived, sendDirectMessageTyping } from '../../socket-io-functions/send-direct-message';

function MessageScreen({typingUsers,userCurrentJoinedRoom,username, directMessages, setDirectMessages}) {
  const { messageId } = useParams();
  const [message, setMessage] = useState('');
  let otherUsername = directMessages.users.find(user => user !== username);
  
  

  const handleSubmitMessage = (e) => {
    e.preventDefault();
    if (!message) return;
    
    sendDirectMessage({
      username: otherUsername, // Assuming this should be the recipient; adjust as necessary
      id: messageId, // The direct message or channel ID
      message, // The message text
    }, (confirmation) => {
      console.log('Message sent confirmation:', confirmation);
      // Handle the message sent confirmation as needed
    });

    setMessage(''); // Clear the message input after sending
  };

  const handleSendMessageChange = (e) => {
    setMessage(e.target.value);
    sendDirectMessageTyping({
      groupId: messageId, // The direct message or channel ID
      message: e.target.value, // The message text
    }, (confirmation) => {
      console.log('Message sent confirmation:', confirmation);
      // Handle the message sent confirmation as needed
    });
    //send request
  }
  return (
    <div id='the-message-screen-parent'>
        <MessageScreenHeader channelLogo={"/cags2.png"} name={"Direct Message"}/>
        <MessageScreenChatPartsParent typingUsers={typingUsers} username={username} directMessages={directMessages} />
        <MessageScreenFooter groupId={directMessages._id} userCurrentJoinedRoom={userCurrentJoinedRoom} message={message} handleSubmitMessage={handleSubmitMessage} handleSendMessageChange={handleSendMessageChange} name={otherUsername} />
    </div>
  )
}



export default MessageScreen