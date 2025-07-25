import React, { createContext, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify'; // For toast notifications

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const socket = useRef(null);

    useEffect(() => {
        if (user) {
            socket.current = io('http://localhost:5000'); // Connect to backend Socket.IO server

            socket.current.on('connect', () => {
                console.log('Socket Connected:', socket.current.id);
                socket.current.emit('joinRoom', user.id); // Join a personal room for notifications
            });

            // Listen for new connection requests
            socket.current.on('newConnectionRequest', (data) => {
                toast.info(`🔔 New connection request from ${data.senderName}!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                // You might also want to refetch connection requests in a component
            });

            // Listen for connection accepted
            socket.current.on('connectionAccepted', (data) => {
                toast.success(`🤝 ${data.receiverName} accepted your connection request!`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            });

            // Listen for new chat messages (for the user)
            socket.current.on('receiveMessage', (data) => {
                // This will be handled more specifically in ChatPage
                console.log('New message received:', data);
                // You might show a subtle notification or update chat badge
            });

            socket.current.on('disconnect', () => {
                console.log('Socket Disconnected');
            });

            return () => {
                socket.current.disconnect();
            };
        }
    }, [user]);

    return (
        <SocketContext.Provider value={socket.current}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);