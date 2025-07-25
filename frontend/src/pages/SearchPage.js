import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import ProfileCard from '../components/ProfileCard';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(4)};
  max-width: 1200px;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(4)} auto;
  .glassmorphism;
  animation: fadeIn 0.8s ease-out;
`;

const SearchBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  max-width: 600px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  input {
    flex-grow: 1;
  }
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
  justify-items: center;
`;

const NoResults = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.2rem;
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.get(`/search?query=${searchQuery}`);
            setSearchResults(res.data);
        } catch (error) {
            console.error('Error searching profiles:', error);
            toast.error('Failed to perform search.');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (receiverId) => {
        try {
            await api.post('/connections/request', { receiverId });
            toast.success('Connection request sent!');
            // Update the specific card's status
            setSearchResults(prevResults =>
                prevResults.map(profile =>
                    profile.id === receiverId ? { ...profile, requestSent: true } : profile
                )
            );
        } catch (error) {
            console.error('Error sending connection request:', error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || 'Failed to send connection request.');
        }
    };

    const handleStartChat = async (participantId) => {
        try {
            const res = await api.post('/chat/start', { participantId });
            if (res.data.chat?._id) {
                navigate(`/chat/${res.data.chat._id}`);
            } else {
                toast.error('Failed to start chat. Chat ID not returned.');
            }
        } catch (error) {
            console.error('Error starting chat:', error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || 'Failed to start chat.');
        }
    };


    return (
        <SearchContainer>
            <h2>Find Students and Seniors</h2>
            <SearchBar as="form" onSubmit={handleSearch}>
                <Input
                    type="text"
                    placeholder="Search by name, username, college, school, or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </Button>
            </SearchBar>

            <ResultsGrid>
                {searchResults.length > 0 ? (
                    searchResults.map((profile) => (
                        <ProfileCard
                            key={profile.id}
                            profile={profile}
                            onSendRequest={handleSendRequest}
                            onStartChat={handleStartChat}
                            currentUserId={user.id}
                            currentUserRole={user.role}
                        />
                    ))
                ) : (
                    !loading && <NoResults>No profiles found. Try a different search query!</NoResults>
                )}
            </ResultsGrid>
        </SearchContainer>
    );
};

export default SearchPage;