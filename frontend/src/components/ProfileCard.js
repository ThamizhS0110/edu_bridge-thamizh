import React from 'react';
import styled from 'styled-components';
import Button from './shared/Button';
import { Link } from 'react-router-dom';
import { FaPaperPlane, FaUserCircle, FaCheckCircle, FaComments } from 'react-icons/fa';

const Card = styled.div`
  .glassmorphism;
  padding: ${({ theme }) => theme.spacing(3)};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 280px;
  min-height: 300px; /* Ensure consistent height */
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  animation: popUp 0.5s ease-out;

  &:hover {
    transform: translateY(-5px) scale(1.01);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  }
`;

const ProfilePic = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  border: 2px solid ${({ theme }) => theme.colors.accent};
  box-shadow: 0 0 10px rgba(255, 205, 210, 0.3);
`;

const Info = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  h3 {
    font-size: 1.5rem;
    margin: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin: ${({ theme }) => theme.spacing(0.5)} 0;
  }
`;

const CardActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  width: 100%;
  margin-top: auto; /* Push buttons to bottom */
`;

const ProfileCard = ({ profile, onSendRequest, onStartChat, currentUserId, currentUserRole }) => {
    // Determine if the "Send Request" button should be shown and its state
    const canSendRequest = currentUserRole === 'junior' && profile.role === 'senior' &&
                           !profile.requestSent && !profile.isConnected;

    const isRequestPending = profile.requestSent;
    const isConnected = profile.isConnected;


    return (
        <Card>
            <ProfilePic src={profile.profilePictureUrl || 'https://via.placeholder.com/100?text=No+Pic'} alt={`${profile.name}'s profile`} />
            <Info>
                <h3>{profile.name}</h3>
                <p>@{profile.username}</p>
                <p>{profile.role === 'senior' ? `College: ${profile.collegeName || 'N/A'}` : `School: ${profile.schoolName || 'N/A'}`}</p>
                {profile.role === 'senior' && <p>Dept: {profile.department || 'N/A'}</p>}
                {profile.role === 'junior' && profile.interestedDomains && profile.interestedDomains.length > 0 &&
                    <p>Interests: {profile.interestedDomains.slice(0, 2).join(', ')}{profile.interestedDomains.length > 2 ? '...' : ''}</p>
                }
            </Info>
            <CardActions>
                <Button as={Link} to={`/profile/${profile.id}`}>
                    <FaUserCircle /> View Profile
                </Button>
                {canSendRequest && (
                    <Button onClick={() => onSendRequest(profile.id)}>
                        <FaPaperPlane /> Send Request
                    </Button>
                )}
                {isRequestPending && (
                    <Button disabled>
                        <FaPaperPlane /> Request Sent
                    </Button>
                )}
                {isConnected && (
                    <Button onClick={() => onStartChat(profile.id)}>
                        <FaComments /> Message
                    </Button>
                )}
                 {profile.requestReceived && ( // If they sent you a request, prompt to accept/reject
                    <Button disabled variant="secondary">
                        <FaCheckCircle /> Request Received
                    </Button>
                )}
            </CardActions>
        </Card>
    );
};

export default ProfileCard;