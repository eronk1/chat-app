import {useState, useEffect, useRef} from 'react'
import './MessageScreen.css'
import MessageScreenHeader from './MessageScreenComponents/MessageScreenHeader'
import MessageScreenChatPartsParent from './MessageScreenChatParts/MessageScreenChatPartsParent'
import MessageScreenFooter from './MessageScreenComponents/MessageScreenFooter'
import { useOutletContext, useParams } from 'react-router-dom';
import axios from 'axios'
import { sendDirectMessage, onDirectMessageReceived, sendDirectMessageTyping } from '../../socket-io-functions/send-direct-message';
import { useGroupChat } from '../../socket-io-functions/group-chat'

function MessageScreen({userSummary, groupChat,typingUsers,userCurrentJoinedRoom,username, directMessages, setDirectMessages}) {
  const { messageId } = useParams();
  const [message, setMessage] = useState('');
  const lastSentMessage = useRef('');
  const throttleTimer = useRef(null);
  let delayTimer = 500; // miliseconds for message update timer
  let otherUsername = directMessages.users.find(user => user !== username);
  const {
    createGroupChat,
    addUserToGroupChat,
    sendGroupMessage,
    leaveGroupChat,
    groupMessageTyping
  } = groupChat;

  const handleSubmitMessage = (e) => {
    e.preventDefault();
    if (!message) return;
    
    sendDirectMessage({
      username: otherUsername,
      id: messageId, 
      message, 
    });

    setMessage(''); 
  };
  // every delayTimer the message is sent if it updated
  const handleSendMessageChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
  
    const sendMessage = () => {
      sendDirectMessageTyping({
        groupId: messageId, 
        message: newMessage, 
      }, (confirmation) => {
        console.log('Message sent confirmation:', confirmation);
        lastSentMessage.current = newMessage;
      });
    };
  
    if (newMessage !== lastSentMessage.current && !throttleTimer.current) {
      sendMessage();
      console.log(throttleTimer.current)
      throttleTimer.current = setTimeout(() => {
        
        if (newMessage !== lastSentMessage.current) {
          sendMessage();
        }
        throttleTimer.current = null;
      }, delayTimer); 
    }
  };
  useEffect(() => {
    return () => {
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }
    };
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      if (message !== lastSentMessage.current) {
        sendDirectMessageTyping({
          groupId: messageId,
          message: message,
        });        
        lastSentMessage.current = message;
      }
    }, delayTimer); // Check every delayTimer
  
    return () => {
      clearInterval(interval); // Clear interval on component unmount
    };
  }, [message]);
  return (
    <div id='the-message-screen-parent'>
        <MessageScreenHeader channelLogo={"/cags2.png"} name={"Direct Message"}/>
        <MessageScreenChatPartsParent userSummary={userSummary} userCurrentJoinedRoom={userCurrentJoinedRoom} messageId={messageId} typingUsers={typingUsers} username={username} directMessages={directMessages} setDirectMessages={setDirectMessages} />
        <MessageScreenFooter groupId={directMessages._id} userCurrentJoinedRoom={userCurrentJoinedRoom} message={message} handleSubmitMessage={handleSubmitMessage} handleSendMessageChange={handleSendMessageChange} name={otherUsername} />
    </div>
  )
}



export default MessageScreen