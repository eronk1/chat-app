import io from 'socket.io-client';
import { useEffect } from 'react';

// Define the base URL for the Socket.IO server
const SOCKET_URL = 'http://localhost:3000';

// Initialize a variable to hold the socket client instance
let socketClient = null;

// Hook to manage the socket connection based on authentication status
const useAuthenticatedSocket = (isAuthenticated) => {
  useEffect(() => {
    if (isAuthenticated) {
      const userTokens = localStorage.getItem('userTokens');
      
      if (userTokens) {
        const { accessToken } = JSON.parse(userTokens);
        
        // Connect to the socket server when the user is authenticated
        if (accessToken && !socketClient) {
          socketClient = io.connect(SOCKET_URL, {
            auth: { token: accessToken },
          });

          // Confirm connection
          socketClient.on('connect', () => {
            console.log('Connected to socket server');
          });
        }
      }
    } else {
      // Disconnect the socket when the user is not authenticated
      if (socketClient) {
        socketClient.disconnect();
        socketClient = null;
      }
    }

    // Cleanup function to disconnect the socket when the component unmounts or isAuthenticated changes
    return () => {
      if (socketClient) {
        socketClient.disconnect();
        socketClient = null;
      }
    };
  }, [isAuthenticated]); 
};

// Function to access the socket instance
export const getSocket = () => {
  if (!socketClient) {
    throw new Error("Socket is not initialized. Authenticate to initialize the socket.");
  }
  return socketClient;
};

export default useAuthenticatedSocket;
