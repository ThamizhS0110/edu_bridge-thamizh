import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axiosConfig';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ChatPageContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 1200px;
  height: 80vh;
  margin: ${({ theme }) => theme.spacing(4)} auto;
  .glassmorphism;
  animation: fadeIn 0.8s ease-out;
  overflow: hidden; /* For inner scrollable areas */
`;

const ChatListContainer = styled.div`
  flex: 1;
  border-right: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: ${({ theme }) => theme.spacing(2)};
  overflow-y: auto;
  min-width: 280px;
  background: rgba(255, 255, 255, 0.05); /* Slightly darker for distinction */

  h3 {
    color: ${({ theme }) => theme.colors.textPrimary};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    padding-bottom: ${({ theme }) => theme.spacing(1)};
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
`;

const ChatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1.5)};
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  background-color: ${({ theme, active }) => active ? 'rgba(255, 255, 255, 0.15)' : 'transparent'};
  transition: background-color 0.2s ease-in-out;
  margin-bottom: ${({ theme }) => theme.spacing(1)};

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ChatAvatar = styled.img`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.accent};
`;

const ChatInfo = styled.div`
  flex-grow: 1;
  h4 {
    margin: 0;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  p {
    margin: 0;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ChatWindowContainer = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const MessagesContainer = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  background: rgba(255, 255, 255, 0.02); /* Very subtle background for messages area */
  border-radius: ${({ theme }) => theme.borderRadius};
  margin-bottom: ${({ theme }) => theme.spacing(2)};

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 10px;
  }
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: ${({ theme }) => theme.spacing(1.2)} ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.borderRadius};
  color: ${({ theme }) => theme.colors.textPrimary};
  background-color: ${({ theme, isSender }) =>
        isSender ? theme.colors.primary : theme.colors.secondary};
  align-self: ${({ isSender }) => (isSender ? 'flex-end' : 'flex-start')};
  word-break: break-word;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-out;

  p {
    margin: 0;
    font-size: 0.95rem;
  }
  span {
    display: block;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    margin-top: ${({ theme }) => theme.spacing(0.5)};
    text-align: ${({ isSender }) => (isSender ? 'right' : 'left')};
  }
`;

const MessageInputContainer = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const NoChatSelected = styled.div`
  flex: 3;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.2rem;
  text-align: center;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  margin-bottom: ${({ theme }) => theme.spacing(2)};

  h3 {
    margin: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 1.5rem;
  }
`;

const ChatPage = () => {
    const { chatId: paramChatId } = useParams();
    const { user } = useAuth();
    const socket = useSocket();
    const navigate = useNavigate();

    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const fetchChats = useCallback(async () => {
        try {
            const res = await api.get('/chat');
            setChats(res.data);
            // If a chat ID is provided in URL, try to set it as selected
            if (paramChatId) {
                const foundChat = res.data.find(chat => chat._id === paramChatId);
                if (foundChat) {
                    setSelectedChat(foundChat);
                } else {
                    toast.error('Chat not found.');
                    navigate('/chat'); // Redirect to general chat page
                }
            } else if (res.data.length > 0) {
                // If no specific chat, select the most recent one
                setSelectedChat(res.data[0]);
                navigate(`/chat/${res.data[0]._id}`, { replace: true });
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
            toast.error('Failed to load chats.');
        }
    }, [paramChatId, navigate]);

    const fetchMessages = useCallback(async (chatId) => {
        try {
            const res = await api.get(`/chat/${chatId}/messages`);
            setMessages(res.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages.');
        }
    }, []);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat._id);
            // Join the specific chat room via socket
            if (socket) {
                socket.emit('joinRoom', selectedChat._id);
            }
        }
    }, [selectedChat, fetchMessages, socket]);


    useEffect(() => {
        if (socket) {
            const handleReceiveMessage = (data) => {
                if (selectedChat && data.chatId === selectedChat._id) {
                    setMessages(prevMessages => [...prevMessages, data.message]);
                } else {
                    // Update relevant chat in chat list, maybe show unread badge
                    setChats(prevChats =>
                        prevChats.map(chat =>
                            chat._id === data.chatId
                                ? { ...chat, lastMessageAt: new Date(), lastMessage: data.message.content }
                                : chat
                        ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
                    );
                    toast.info(`New message from ${data.message.sender.name || data.message.sender.username}`, {
                        position: "bottom-left",
                        autoClose: 3000,
                    });
                }
            };

            socket.on('receiveMessage', handleReceiveMessage);

            return () => {
                socket.off('receiveMessage', handleReceiveMessage);
            };
        }
    }, [socket, selectedChat]); // Include selectedChat to ensure correct filtering


    useEffect(() => {
        // Scroll to the latest message
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        try {
            const res = await api.post(`/chat/${selectedChat._id}/message`, { content: newMessage });
            // Message will be added via socket event, but also update local state for immediate feedback
            // Ensure the sender info is correctly structured if adding locally before socket confirms
            setMessages(prevMessages => [...prevMessages, {
                _id: res.data.chat._id,
                sender: { _id: user.id, username: user.username, name: user.name },
                content: newMessage,
                timestamp: new Date()
            }]);
            setNewMessage('');
            // Update the last message in the chat list as well
            setChats(prevChats =>
                prevChats.map(chat =>
                    chat._id === selectedChat._id
                        ? { ...chat, lastMessageAt: new Date(), messages: [...chat.messages, res.data.chat] }
                        : chat
                ).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
            );
        } catch (error) {
            console.error('Error sending message:', error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || 'Failed to send message.');
        }
    };

    const getChatPartner = (chat) => {
        return chat.participants.find(p => p._id !== user.id);
    };

    return (
        <ChatPageContainer>
            <ChatListContainer>
                <h3>Your Chats</h3>
                {chats.length > 0 ? (
                    chats.map((chat) => {
                        const partner = getChatPartner(chat);
                        return (
                            <ChatItem
                                key={chat._id}
                                active={selectedChat && selectedChat._id === chat._id}
                                onClick={() => {
                                    setSelectedChat(chat);
                                    navigate(`/chat/${chat._id}`); // Update URL
                                }}
                            >
                                <ChatAvatar src={partner?.profilePictureUrl || 'https://via.placeholder.com/50?text=User'} alt="Partner" />
                                <ChatInfo>
                                    <h4>{partner?.name || partner?.username || 'Unknown User'}</h4>
                                    <p>{chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].content : 'No messages yet.'}</p>
                                </ChatInfo>
                            </ChatItem>
                        );
                    })
                ) : (
                    <p>No chats yet. Connect with seniors/juniors to start chatting!</p>
                )}
            </ChatListContainer>

            {selectedChat ? (
                <ChatWindowContainer>
                    <ChatHeader>
                        <ChatAvatar src={getChatPartner(selectedChat)?.profilePictureUrl || 'https://via.placeholder.com/50?text=User'} alt="Partner" />
                        <h3>{getChatPartner(selectedChat)?.name || getChatPartner(selectedChat)?.username || 'Unknown User'}</h3>
                    </ChatHeader>
                    <MessagesContainer>
                        {messages.map((message) => (
                            <MessageBubble key={message._id || Math.random()} isSender={message.sender._id === user.id}>
                                <p>{message.content}</p>
                                <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </MessageBubble>
                        ))}
                        <div ref={messagesEndRef} /> {/* Scroll to bottom */}
                    </MessagesContainer>
                    <MessageInputContainer onSubmit={handleSendMessage}>
                        <Input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            style={{ flexGrow: 1 }}
                        />
                        <Button type="submit">
                            <FaPaperPlane /> Send
                        </Button>
                    </MessageInputContainer>
                </ChatWindowContainer>
            ) : (
                <NoChatSelected>
                    <p>Select a chat from the left or connect with someone new to start chatting!</p>
                </NoChatSelected>
            )}
        </ChatPageContainer>
    );
};

export default ChatPage;