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
  min-height: 300px;
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
  margin-top: auto;
`;

const InterestsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(0.5)};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

const InterestTag = styled.span`
  background: ${({ theme }) => theme.colors.accent};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: ${({ theme }) => theme.spacing(0.5)} ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 0.8rem;
  font-weight: 500;
`;

const ProfileCard = ({ profile, onSendRequest, onStartChat, currentUserId, currentUserRole }) => {
    // Determine if the "Send Request" button should be shown and its state
    const canSendRequest = currentUserRole === 'school' && profile.student === 'college' &&
                           !profile.requestSent && !profile.isConnected;

    const isRequestPending = profile.requestSent;
    const isConnected = profile.isConnected;

    // Get appropriate image source
    const getImageSrc = () => {
        if (profile.profileImage) {
            return profile.profileImage;
        }
        return 'https://via.placeholder.com/100?text=No+Pic';
    };

    // Display appropriate educational info
    const getEducationInfo = () => {
        if (profile.student === 'college') {
            return {
                institution: profile.college || 'N/A',
                detail: profile.degree || profile.fieldOfStudy || 'N/A'
            };
        } else {
            return {
                institution: profile.school || 'N/A',
                detail: profile.grade || 'N/A'
            };
        }
    };

    const educationInfo = getEducationInfo();

    return (
        <Card>
            <ProfilePic 
                src={getImageSrc()} 
                alt={`${profile.name}'s profile`} 
                onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/100?text=No+Pic';
                }}
            />
            <Info>
                <h3>{profile.name}</h3>
                <p>{profile.student === 'college' ? 'College Student' : 'School Student'}</p>
                <p>
                    {profile.student === 'college' ? 'College: ' : 'School: '}
                    {educationInfo.institution}
                </p>
                {educationInfo.detail !== 'N/A' && (
                    <p>
                        {profile.student === 'college' 
                            ? (profile.degree ? 'Degree: ' : 'Field: ') 
                            : 'Grade: '
                        }
                        {educationInfo.detail}
                    </p>
                )}
                {profile.bio && (
                    <p>{profile.bio.length > 60 ? `${profile.bio.substring(0, 60)}...` : profile.bio}</p>
                )}
                {profile.interests && profile.interests.length > 0 && (
                    <InterestsContainer>
                        {profile.interests.slice(0, 3).map((interest, index) => (
                            <InterestTag key={index}>{interest}</InterestTag>
                        ))}
                        {profile.interests.length > 3 && (
                            <InterestTag>+{profile.interests.length - 3} more</InterestTag>
                        )}
                    </InterestsContainer>
                )}
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
                {profile.requestReceived && (
                    <Button disabled variant="secondary">
                        <FaCheckCircle /> Request Received
                    </Button>
                )}
            </CardActions>
        </Card>
    );
};

export default ProfileCard;