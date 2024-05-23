// groupChat.js
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { getSocket } from './authenticate-socket';

const createGroupChat = (socket, groupName, members, ack) => {
  socket.emit('createGroupChat', { groupName, members }, (response) => {
    if (response.status === 201) {
      console.log('Group chat created successfully', response.groupId);
    } else {
      console.error('Error creating group chat', response.error);
    }
    if (ack) ack(response);
  });
};

const addUserToGroupChat = (socket, groupId, newUser, ack) => {
  socket.emit('addUserToGroupChat', { groupId, newUser }, (response) => {
    if (response.status === 200) {
      console.log('User added to group successfully');
    } else {
      console.error('Error adding user to group', response.error);
    }
    if (ack) ack(response);
  });
};

const sendGroupMessage = (socket, groupId, message, ack) => {
  socket.emit('sendGroupMessage', { groupId, message }, (response) => {
    if (response.status === 200) {
      console.log('Message sent successfully');
    } else {
      console.error('Error sending message', response.error);
    }
    if (ack) ack(response);
  });
};

const leaveGroupChat = (socket, groupId, ack) => {
  socket.emit('leaveGroupChat', { groupId }, (response) => {
    if (response.status === 200) {
      console.log('Left group chat successfully');
    } else {
      console.error('Error leaving group chat', response.error);
    }
    if (ack) ack(response);
  });
};

const joinRoom = (socket, groupId, ack) => {
  socket.emit('joinRoom', { groupId }, (response) => {
    if (response.status === 200) {
      console.log('Joined room successfully');
    } else {
      console.error('Error joining room', response.error);
    }
    if (ack) ack(response);
  });
};

const leaveRoom = (socket, groupId, ack) => {
  socket.emit('leaveRoom', { groupId }, (response) => {
    if (response.status === 200) {
      console.log('Left room successfully');
    } else {
      console.error('Error leaving room', response.error);
    }
    if (ack) ack(response);
  });
};

const groupMessageTyping = (socket, groupId, typing, ack) => {
  socket.emit('groupMessageTyping', { groupId, typing }, (response) => {
    if (response.status === 200) {
      console.log('Typing status sent successfully');
    } else {
      console.error('Error sending typing status', response.error);
    }
    if (ack) ack(response);
  });
};

export const useGroupChat = (isAuthenticated, gotDirect, setDirectMessages) => {
  const socket = getSocket();
  const setGroupMessages = setDirectMessages;

  const handleGroupMessageReceived = useCallback((message) => {
    setGroupMessages((prevMessages) => {
      const updatedMessages = { ...prevMessages };
      if (!updatedMessages[message.groupId]) {
        updatedMessages[message.groupId] = [];
      }
      updatedMessages[message.groupId].push(message);
      return updatedMessages;
    });
  }, [setGroupMessages]);

  const handleUserAdded = useCallback((data) => {
    console.log('User added to group:', data);
  }, []);

  const handleUserLeft = useCallback((data) => {
    console.log('User left the group:', data);
  }, []);

  const handleGroupCreated = useCallback((data) => {
    console.log('Group created:', data);
  }, []);

  const handleGroupMessageTypingReceived = useCallback((data) => {
    console.log('User is typing:', data);
  }, []);

  const handleUserJoinedRoom = useCallback((data) => {
    console.log('User joined room:', data);
  }, []);

  const handleUserLeftRoom = useCallback((data) => {
    console.log('User left room:', data);
  }, []);

  useEffect(() => {
    let cleanup = () => {};

    if (isAuthenticated && gotDirect) {
      try {
        socket.on('group-message', handleGroupMessageReceived);
        socket.on('user-added', handleUserAdded);
        socket.on('user-left', handleUserLeft);
        socket.on('group-created', handleGroupCreated);
        socket.on('group-message-typing', handleGroupMessageTypingReceived);
        socket.on('user-joined', handleUserJoinedRoom);

        cleanup = () => {
          socket.off('group-message', handleGroupMessageReceived);
          socket.off('user-added', handleUserAdded);
          socket.off('user-left', handleUserLeft);
          socket.off('group-created', handleGroupCreated);
          socket.off('group-message-typing', handleGroupMessageTypingReceived);
          socket.off('user-joined', handleUserJoinedRoom);
        };
      } catch (error) {
        console.error(error);
      }
    }

    return cleanup;
  }, [isAuthenticated, gotDirect, handleGroupMessageReceived, handleUserAdded, handleUserLeft, handleGroupCreated, handleGroupMessageTypingReceived, handleUserJoinedRoom, handleUserLeftRoom, socket]);

  return {
    createGroupChat: (groupName, members, ack) => createGroupChat(socket, groupName, members, ack),
    addUserToGroupChat: (groupId, newUser, ack) => addUserToGroupChat(socket, groupId, newUser, ack),
    sendGroupMessage: (groupId, message, ack) => sendGroupMessage(socket, groupId, message, ack),
    leaveGroupChat: (groupId, ack) => leaveGroupChat(socket, groupId, ack),
    joinRoom: (groupId, ack) => joinRoom(socket, groupId, ack),
    leaveRoom: (groupId, ack) => leaveRoom(socket, groupId, ack),
    groupMessageTyping: (groupId, typing, ack) => groupMessageTyping(socket, groupId, typing, ack)
  };
};
