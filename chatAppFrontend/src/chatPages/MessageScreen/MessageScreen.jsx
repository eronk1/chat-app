import {useState} from 'react'
import './MessageScreen.css'
import MessageScreenHeader from './MessageScreenComponents/MessageScreenHeader'
import MessageScreenChatPartsParent from './MessageScreenChatParts/MessageScreenChatPartsParent'
import MessageScreenFooter from './MessageScreenComponents/MessageScreenFooter'
import { useOutletContext, useParams } from 'react-router-dom';
import axios from 'axios'

function MessageScreen({username}) {
  const { directMessages, setDirectMessages } = useOutletContext();
  const { messageId } = useParams();
  const [message, setMessage] = useState('');
  const handleSubmitMessage = async (e) => {

    const payload = {
      message: message
    };
    const token = JSON.parse(localStorage.getItem('userTokens'));

    try {
      const response = await axios.post(`http://localhost:3000/channel/@me/${messageId}`, payload, {
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
        },
      });
      setDirectMessages(response.data.updatedChannel);
      setMessage('');
      scrollToEnd();
    } catch (error) {
      console.error('Error submitting message:', error);
    }
  };
  const handleSendMessageChange = (e) => {
    setMessage(e.target.value);
  };

  return (
    <div id='the-message-screen-parent'>
        <MessageScreenHeader channelLogo={"/cags2.png"} name={"Direct Message"}/>
        <MessageScreenChatPartsParent username={username} directMessages={directMessages} />
        <MessageScreenFooter message={message} handleSubmitMessage={handleSubmitMessage} handleSendMessageChange={handleSendMessageChange} name={username} />
    </div>
  )
}


const scrollToEnd = () => {
  const messagesContainer = document.querySelector('.the-actual-fr-message-parent');
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: 'smooth'
    });
  }
};

export default MessageScreen