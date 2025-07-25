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

const ProfileStudent = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const ProfileInfo = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const FieldValue = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: ${({ theme }) => theme.spacing(1)} 0;
  
  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: ${({ theme }) => theme.spacing(0.5)} ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 0.9rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  max-width: 400px;
`;

const LoadingMessage = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  font-size: 1.1rem;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  text-align: center;
  padding: ${({ theme }) => theme.spacing(4)};
  
  h3 {
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }
`;

const UserProfileView = () => {
    const { userId } = useParams();
    const { user } = useAuth();
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
            const res = await api.get(`/users/${userId}`);
            setProfile(res.data);

            // Check connection status with current user
            if (user) {
                const myProfileRes = await api.get(`/users/me`);
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
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setError(error.response?.data?.message || 'Failed to load user profile. It might not exist or be inaccessible.');
        } finally {
            setLoading(false);
        }
    }, [userId, user]);

    useEffect(() => {
        if (userId) {
            fetchUserProfile();
        }
    }, [fetchUserProfile]);

    const handleSendRequest = async () => {
        try {
            await api.post('/connections/request', { 
                receiverId: userId,
                message: `Hi, I'm ${user.name}, I need to chat with you`
            });
            toast.success('Connection request sent!');
            setConnectionStatus(prev => ({ ...prev, requestSent: true }));
        } catch (error) {
            console.error('Error sending connection request:', error);
            toast.error(error.response?.data?.message || 'Failed to send connection request.');
        }
    };

    const handleStartChat = async () => {
        try {
            const res = await api.post('/chat/get-or-create', { participantId: userId });
            if (res.data.chat?._id) {
                navigate(`/chat/${res.data.chat._id}`);
            } else {
                toast.error('Failed to start chat.');
            }
        } catch (error) {
            console.error('Error starting chat:', error);
            toast.error(error.response?.data?.message || 'Failed to start chat.');
        }
    };

    if (loading) {
        return (
            <ProfileContainer>
                <LoadingMessage>Loading profile...</LoadingMessage>
            </ProfileContainer>
        );
    }

    if (error) {
        return (
            <ProfileContainer>
                <ErrorMessage>
                    <h3>Profile Not Found</h3>
                    <p>{error}</p>
                    <Button onClick={() => navigate(-1)}>Go Back</Button>
                </ErrorMessage>
            </ProfileContainer>
        );
    }

    if (!profile) {
        return (
            <ProfileContainer>
                <ErrorMessage>
                    <h3>Profile Not Found</h3>
                    <p>This profile does not exist or has been removed.</p>
                    <Button onClick={() => navigate(-1)}>Go Back</Button>
                </ErrorMessage>
            </ProfileContainer>
        );
    }

    // Check if current user can send request (junior students to senior students)
    const canSendRequest = user?.student === 'junior' && 
                          profile.student === 'senior' && 
                          !connectionStatus.isAlreadyConnected && 
                          !connectionStatus.requestSent && 
                          !connectionStatus.requestReceived;

    return (
        <ProfileContainer>
            <ProfileHeader>
                <ProfilePicture 
                    src={profile.profileImage || 'https://via.placeholder.com/150?text=No+Image'} 
                    alt={`${profile.name}'s profile`}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                />
                <ProfileName>{profile.name}</ProfileName>
                <ProfileStudent>
                    {profile.student === 'senior' ? 'Senior Student' : 'Junior Student'}
                </ProfileStudent>
            </ProfileHeader>

            <ProfileInfo>
                {/* Bio Section */}
                <InfoSection>
                    <SectionTitle>About</SectionTitle>
                    <FieldValue>
                        {profile.bio || 'No bio available.'}
                    </FieldValue>
                </InfoSection>

                {/* Education Section */}
                <InfoSection>
                    <SectionTitle>Education</SectionTitle>
                                    {profile.student === 'senior' ? (
                    <>
                        <FieldValue><strong>College:</strong> {profile.college || 'Not specified'}</FieldValue>
                        <FieldValue><strong>Degree:</strong> {profile.degree || 'Not specified'}</FieldValue>
                        <FieldValue><strong>Field of Study:</strong> {profile.fieldOfStudy || 'Not specified'}</FieldValue>
                    </>
                ) : (
                    <>
                        <FieldValue><strong>School:</strong> {profile.school || 'Not specified'}</FieldValue>
                        <FieldValue><strong>Grade:</strong> {profile.grade || 'Not specified'}</FieldValue>
                    </>
                )}
                </InfoSection>

                {/* Interests Section */}
                {profile.interests && profile.interests.length > 0 && (
                    <InfoSection>
                        <SectionTitle>Interests</SectionTitle>
                        <TagContainer>
                            {profile.interests.map((interest, index) => (
                                <Tag key={index}>{interest}</Tag>
                            ))}
                        </TagContainer>
                    </InfoSection>
                )}

                {/* Goals Section */}
                {profile.goals && profile.goals.length > 0 && (
                    <InfoSection>
                        <SectionTitle>Goals</SectionTitle>
                        <TagContainer>
                            {profile.goals.map((goal, index) => (
                                <Tag key={index}>{goal}</Tag>
                            ))}
                        </TagContainer>
                    </InfoSection>
                )}
            </ProfileInfo>

            {/* Action Buttons */}
            <ActionButtons>
                {canSendRequest && (
                    <Button onClick={handleSendRequest}>
                        <FaPaperPlane /> Send Connection Request
                    </Button>
                )}
                
                {connectionStatus.requestSent && (
                    <Button disabled>
                        <FaPaperPlane /> Request Sent
                    </Button>
                )}
                
                {connectionStatus.requestReceived && (
                    <Button disabled variant="secondary">
                        Request Received
                    </Button>
                )}
                
                {connectionStatus.isAlreadyConnected && (
                    <>
                        <Button disabled variant="success">
                            <FaUserFriends /> Connected
                        </Button>
                        <Button onClick={handleStartChat}>
                            <FaComments /> Message
                        </Button>
                    </>
                )}
            </ActionButtons>
        </ProfileContainer>
    );
};

export default UserProfileView;