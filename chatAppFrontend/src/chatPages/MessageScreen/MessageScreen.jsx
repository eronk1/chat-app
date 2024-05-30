import {useState, useEffect, useRef} from 'react'
import './MessageScreen.css'
import MessageScreenHeader from './MessageScreenComponents/MessageScreenHeader'
import MessageScreenChatPartsParent from './MessageScreenChatParts/MessageScreenChatPartsParent'
import MessageScreenFooter from './MessageScreenComponents/MessageScreenFooter'
import { useOutletContext, useParams } from 'react-router-dom';
import axios from 'axios'
import { sendDirectMessage, onDirectMessageReceived, sendDirectMessageTyping } from '../../socket-io-functions/send-direct-message';
import { useGroupChat } from '../../socket-io-functions/group-chat'

function MessageScreen({setTypingUsers,userSummary, groupChat,typingUsers,userCurrentJoinedRoom,username, directMessages, setDirectMessages}) {
  const { messageId } = useParams();
  const [message, setMessage] = useState('');
  const lastSentMessage = useRef('');
  const throttleTimer = useRef(null);
  let delayTimer = 500; // miliseconds for message update timer
  let otherUsername = directMessages.users.find(user => user !== username);
  let messagePreferred = directMessages.preferredName.find(user => user !== userSummary.preferredName);
  
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
    if(userCurrentJoinedRoom[1]){
      sendGroupMessage(messageId, message, (response)=>{
      });
    }else{
      sendDirectMessage({
        username: otherUsername,
        id: messageId, 
        message, 
      });
    }

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
        lastSentMessage.current = newMessage;
      });
    };
  
    if (newMessage !== lastSentMessage.current && !throttleTimer.current) {
      sendMessage();
      throttleTimer.current = setTimeout(() => {
        
        if (newMessage !== lastSentMessage.current) {
          sendMessage();
        }
        throttleTimer.current = null;
      }, delayTimer); 
    }
  };
  useEffect(() => {
    setTypingUsers({});
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
        <MessageScreenHeader otherUsername={otherUsername} channelLogo={"/cags2.png"} userCurrentJoinedRoom={userCurrentJoinedRoom}/>
        <MessageScreenChatPartsParent userSummary={userSummary} userCurrentJoinedRoom={userCurrentJoinedRoom} messageId={messageId} typingUsers={typingUsers} username={username} directMessages={directMessages} setDirectMessages={setDirectMessages} />
        <MessageScreenFooter messagePreferred={messagePreferred} groupId={directMessages._id} userCurrentJoinedRoom={userCurrentJoinedRoom} message={message} handleSubmitMessage={handleSubmitMessage} handleSendMessageChange={handleSendMessageChange} name={userCurrentJoinedRoom[1] ? directMessages.groupName : otherUsername} />
    </div>
  )
}



export default MessageScreen