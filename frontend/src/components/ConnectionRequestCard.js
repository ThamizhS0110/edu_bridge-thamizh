import React from 'react';
import styled from 'styled-components';
import Button from './shared/Button';
import {
  FaUserPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaPaperPlane
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Card = styled.div`
  .glassmorphism;
  padding: ${({ theme }) => theme.spacing(2)};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  flex-wrap: wrap;
`;

const ProfilePic = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.accent};
`;

const RequestInfo = styled.div`
  flex-grow: 1;
  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textPrimary};
    strong {
        color: ${({ theme }) => theme.colors.accent};
    }
  }
  span {
    font-size: 0.9em;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(1.5)};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;


const ConnectionRequestCard = ({ request, isSender = false, onAccept, onReject }) => {
    const userToDisplay = isSender ? request.receiverId : request.senderId;

    return (
        <Card>
            <ProfilePic src={userToDisplay.profilePictureUrl || 'https://via.placeholder.com/50?text=No+Pic'} alt="User" />
            <RequestInfo>
                <p>
                    {isSender ? "Request sent to " : "Request from "}
                    <strong><Link to={`/profile/${userToDisplay._id}`}>{userToDisplay.name || userToDisplay.username}</Link></strong>
                </p>
                <span>Status: {request.status}</span>
                {request.defaultMessage && <p>"{request.defaultMessage}"</p>}
            </RequestInfo>
            <Actions>
                {!isSender && request.status === 'pending' && (
                    <>
                        <StyledButton onClick={() => onAccept(request._id)}>
                            <FaCheckCircle /> Accept
                        </StyledButton>
                        <StyledButton variant="secondary" onClick={() => onReject(request._id)}>
                            <FaTimesCircle /> Reject
                        </StyledButton>
                    </>
                )}
                {isSender && request.status === 'pending' && (
                    <StyledButton disabled>
                        <FaPaperPlane /> Pending
                    </StyledButton>
                )}
                {(request.status === 'accepted' || request.status === 'rejected') && (
                     <StyledButton disabled>
                        {request.status === 'accepted' ? <FaCheckCircle /> : <FaTimesCircle />} {request.status}
                     </StyledButton>
                )}
            </Actions>
        </Card>
    );
};

export default ConnectionRequestCard;