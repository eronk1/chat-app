import { getSocket } from "./authenticate-socket";

// Function to send a direct message
export const sendDirectMessage = ({ username, id, message }) => {
  const socket = getSocket(); // Move the getSocket() call inside the function
  socket.emit('send-direct-message', { username, id, message });

};
export const sendDirectMessageTyping = ({ message, groupId }, onMessageSent) => {
  const socket = getSocket(); // Move the getSocket() call inside the function
  socket.emit('direct-message-typing', { message, groupId });

};

// Function to setup a listener for receiving direct messages
// This can be called from a useEffect in your component
export const onDirectMessageReceived = (callback,directMessages) => {
    const socket = getSocket(); // Ensure getSocket() is correctly retrieving the socket instance
    
    socket.on('direct-message', (newMessage) => {
      if (callback) {
        callback(newMessage);
      }
    });
    // Ensure the event name here matches what you've added the listener for
    return () => socket.off('direct-message', callback);
  };
  export const onDirectMessageTyping = (callback, directMessages) => {
    const socket = getSocket();
  
    socket.on('direct-message-typing', (typingData) => {
      if (callback) {
        callback(typingData);
      }
    });
  
    return () => socket.off('direct-message-typing', callback);
  };

  export const onFriendRequestReceived = (callback) => {
    const socket = getSocket();
    const handler = ({ sender }) => {
      if (callback) {
        callback(sender);
      }
    };
    socket.on('friendRequest', handler);
    return () => socket.off('friendRequest', handler);
  }
  
  export const onFriendRequestAccepted = (callback) => {
    const socket = getSocket();
    const handler = ({ sender,directMessages }) => {
      if (callback) {
        callback(sender,directMessages);
      }
    };
    socket.on('acceptFriendRequest', handler);
    return () => socket.off('acceptFriendRequest', handler);
  }
  
  export const onFriendRequestDeclined = (callback) => {
    const socket = getSocket();
    const handler = ({ sender }) => {
      if (callback) {
        callback(sender);
      }
    };
    socket.on('declineFriendRequest', handler);
    return () => socket.off('declineFriendRequest', handler);
  }
  
  export const onFriendRequestCanceled = (callback) => {
    const socket = getSocket();
    const handler = ({ sender }) => {
      if (callback) {
        callback(sender);
      }
    };
    socket.on('cancelFriendRequest', handler);
    return () => socket.off('cancelFriendRequest', handler);
  }
  
  export const onRemoveFriend = (callback) => {
    const socket = getSocket();
    const handler = ({ sender }) => {
      if (callback) {
        callback(sender);
      }
    };
    socket.on('removeFriend', handler);
    return () => socket.off('removeFriend', handler);
  }
  
export const setSocketAccessToken = (accessToken) => {
  const socket = getSocket();
  socket.emit('set-access-token', { accessToken });

};