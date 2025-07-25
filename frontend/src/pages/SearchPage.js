import React, { useState, useEffect } from 'react';
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

const AccessDenied = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(6)};
  
  h2 {
    color: ${({ theme }) => theme.colors.textPrimary};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }
  
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.1rem;
  }
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

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  text-align: center;
  width: 100%;
`;

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [defaultUsers, setDefaultUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Check if user has access (only juniors can search for seniors)
    if (user && user.student !== 'junior') {
        return (
            <SearchContainer>
                <AccessDenied>
                    <h2>Access Restricted</h2>
                    <p>Only junior students can access the search feature to find senior mentors.</p>
                </AccessDenied>
            </SearchContainer>
        );
    }

    // Load default users on component mount
    useEffect(() => {
        const loadDefaultUsers = async () => {
            try {
                const res = await api.get('/search/default');
                setDefaultUsers(res.data);
            } catch (error) {
                console.error('Error loading default users:', error);
            } finally {
                setInitialLoading(false);
            }
        };

        if (user && user.student === 'junior') {
            loadDefaultUsers();
        }
    }, [user]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            // If search is empty, show default results
            setSearchResults([]);
            return;
        }

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
            
            // Update both search results and default users
            const updateFunction = (prevResults) =>
                prevResults.map(profile =>
                    profile.id === receiverId ? { ...profile, requestSent: true } : profile
                );
            
            setSearchResults(updateFunction);
            setDefaultUsers(updateFunction);
        } catch (error) {
            console.error('Error sending connection request:', error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || 'Failed to send connection request.');
        }
    };

    const handleStartChat = async (participantId) => {
        try {
            const res = await api.post('/chat/get-or-create', { participantId });
            if (res.data.chat?._id) {
                navigate(`/chat/${res.data.chat._id}`);
            } else {
                toast.error('Failed to start chat.');
            }
        } catch (error) {
            console.error('Error starting chat:', error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || 'Failed to start chat.');
        }
    };

    const displayResults = searchQuery.trim() ? searchResults : defaultUsers;
    const isShowingDefaults = !searchQuery.trim();

    if (initialLoading) {
        return (
            <SearchContainer>
                <p>Loading...</p>
            </SearchContainer>
        );
    }

    return (
        <SearchContainer>
            <h2>Find Senior Mentors</h2>
            <SearchBar as="form" onSubmit={handleSearch}>
                <Input
                    type="text"
                    placeholder="Search by name, college, degree, field of study, or interests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </Button>
            </SearchBar>

            {isShowingDefaults && (
                <SectionTitle>Featured Senior Students</SectionTitle>
            )}

            <ResultsGrid>
                {displayResults.length > 0 ? (
                    displayResults.map((profile) => (
                        <ProfileCard
                            key={profile.id}
                            profile={profile}
                            onSendRequest={handleSendRequest}
                            onStartChat={handleStartChat}
                            currentUserId={user.id}
                            currentUserRole={user.student}
                        />
                    ))
                ) : (
                    !loading && !initialLoading && (
                        <NoResults>
                            {isShowingDefaults 
                                ? "No senior students available right now. Check back later!" 
                                : "No profiles found. Try a different search query!"
                            }
                        </NoResults>
                    )
                )}
            </ResultsGrid>
        </SearchContainer>
    );
};

export default SearchPage;