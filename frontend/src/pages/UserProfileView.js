import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import Button from '../components/shared/Button';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaUserFriends, FaComments } from 'react-icons/fa';


const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(4)};
  max-width: 900px;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(4)} auto;
  .glassmorphism;
  animation: fadeIn 0.8s ease-out;
`;

const ProfileHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const ProfilePicture = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  border: 3px solid ${({ theme }) => theme.colors.accent};
  box-shadow: 0 0 15px rgba(255, 205, 210, 0.5);
`;

const ProfileName = styled.h2`
  font-size: 2.5rem;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ProfileRole = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  text-transform: capitalize;
`;

const Section = styled.div`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  background: rgba(255, 255, 255, 0.05);
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease-in-out;
  animation: slideInLeft 0.5s ease-out;

  h3 {
    color: ${({ theme }) => theme.colors.secondary};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-size: 1.8rem;
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.6;
    font-size: 1.1rem;
    margin-bottom: ${({ theme }) => theme.spacing(1)};
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const Tag = styled.span`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: ${({ theme }) => theme.spacing(0.5)} ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 0.9rem;
`;

const ActionButtons = styled.div`
    display: flex;
    gap: ${({ theme }) => theme.spacing(2)};
    margin-top: ${({ theme }) => theme.spacing(3)};
    justify-content: center;
    width: 100%;
`;


const UserProfileView = () => {
    const { userId } = useParams();
    const { user } = useAuth(); // The logged-in user
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState({
        isAlreadyConnected: false,
        requestSent: false,
        requestReceived: false,
    });


    const fetchUserProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/profiles/${userId}`);
            setProfile(res.data);

            // Check connection status
            const myProfileRes = await api.get(`/profiles/my-profile`);
            const myConnections = myProfileRes.data.connections || [];
            const isConnected = myConnections.includes(userId);

            const pendingRequestSent = await api.get(`/connections/requests/sent`);
            const sentToThisUser = pendingRequestSent.data.some(
                (req) => req.receiverId._id === userId && req.status === 'pending'
            );

            const pendingRequestReceived = await api.get(`/connections/requests/received`);
            const receivedFromThisUser = pendingRequestReceived.data.some(
                (req) => req.senderId._id === userId && req.status === 'pending'
            );

            setConnectionStatus({
                isAlreadyConnected: isConnected,
                requestSent: sentToThisUser,
                requestReceived: receivedFromThisUser
            });

        } catch (err) {
            console.error('Error fetching user profile:', err);
            setError('Failed to load user profile. It might not exist or be inaccessible.');
        } finally {
            setLoading(false);
        }
    }, [userId, user]);


    useEffect(() => {
        if (userId === user.id) { // If trying to view own profile, redirect
            navigate('/profile/me');
            return;
        }
        fetchUserProfile();
    }, [userId, user, navigate, fetchUserProfile]);


    const handleSendConnectionRequest = async () => {
        try {
            await api.post('/connections/request', { receiverId: profile.userId._id });
            toast.success('Connection request sent!');
            setConnectionStatus(prev => ({ ...prev, requestSent: true }));
        } catch (error) {
            console.error('Error sending connection request:', error.response?.data?.message || error.message);
            toast.error(error.response?.data?.message || 'Failed to send connection request.');
        }
    };

    const handleStartChat = async () => {
        try {
            const res = await api.post('/chat/start', { participantId: profile.userId._id });
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


    if (loading) {
        return <p>Loading profile...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    if (!profile) {
        return <p>No profile data found.</p>;
    }

    return (
        <ProfileContainer>
            <ProfileHeader>
                <ProfilePicture src={profile.profilePictureUrl || 'https://via.placeholder.com/150?text=No+Pic'} alt="Profile" />
                <ProfileName>{profile.userId.name} (@{profile.userId.username})</ProfileName>
                <ProfileRole>{profile.userId.role}</ProfileRole>
                <ActionButtons>
                    {user.role === 'junior' && profile.userId.role === 'senior' && !connectionStatus.isAlreadyConnected && !connectionStatus.requestSent ? (
                        <Button onClick={handleSendConnectionRequest}>
                            <FaPaperPlane /> Send Connection Request
                        </Button>
                    ) : user.role === 'junior' && profile.userId.role === 'senior' && connectionStatus.requestSent ? (
                        <Button disabled><FaPaperPlane /> Request Sent</Button>
                    ) : connectionStatus.isAlreadyConnected ? (
                        <Button onClick={handleStartChat}><FaComments /> Message</Button>
                    ) : (
                        <Button disabled><FaUserFriends /> Cannot connect with this user role</Button>
                    )}
                </ActionButtons>
            </ProfileHeader>

            <Section>
                <h3>About Me</h3>
                <p>{profile.bio || 'No bio available.'}</p>
            </Section>

            <Section>
                <h3>Education</h3>
                <p><strong>School:</strong> {profile.schoolName || 'N/A'}</p>
                {profile.userId.role === 'senior' && (
                    <>
                        <p><strong>College:</strong> {profile.collegeName || 'N/A'}</p>
                        <p><strong>Department:</strong> {profile.department || 'N/A'}</p>
                    </>
                )}
            </Section>

            {profile.userId.role === 'junior' && (
                <Section>
                    <h3>Interested Domains</h3>
                    <TagsContainer>
                        {profile.interestedDomains && profile.interestedDomains.length > 0 ? (
                            profile.interestedDomains.map((domain, index) => <Tag key={index}>{domain}</Tag>)
                        ) : (
                            <p>No interested domains listed.</p>
                        )}
                    </TagsContainer>
                </Section>
            )}
        </ProfileContainer>
    );
};

export default UserProfileView;