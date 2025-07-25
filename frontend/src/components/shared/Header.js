import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle, FaSearch, FaComments, FaSignOutAlt, FaHome } from 'react-icons/fa'; // Icons

const HeaderContainer = styled.header`
  width: 100%;
  background: ${({ theme }) => theme.colors.cardBackground}; /* Glass effect */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: ${({ theme }) => theme.spacing(2)} 0; /* Remove horizontal padding to allow full width */
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  position: sticky;
  top: 0;
  animation: slideInLeft 0.5s ease-out;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing(4)};
`;

const Logo = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 1.8rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-transform: uppercase;
  letter-spacing: 2px;
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const NavLinks = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  align-items: center;
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.borderRadius};
  transition: all 0.3s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.borderRadius};
  transition: all 0.3s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.colors.error};
    background-color: rgba(255, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  svg {
    font-size: 1.2rem;
  }
`;

const LogoutConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${({ theme }) => theme.colors.cardBackground};
  padding: ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.borderRadius};
  text-align: center;
  max-width: 400px;
  width: 90%;
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const ModalTitle = styled.h3`
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const ModalText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
`;

const ModalButton = styled.button`
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(3)};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${({ variant, theme }) => variant === 'confirm' ? `
    background: ${theme.colors.error};
    color: white;
    &:hover {
      background: ${theme.colors.errorHover || '#d32f2f'};
    }
  ` : `
    background: ${theme.colors.cardBorder};
    color: ${theme.colors.textPrimary};
    &:hover {
      background: ${theme.colors.accent};
    }
  `}
`;

const Header = () => {
    const { user, logout } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const handleLogoutConfirm = () => {
        logout();
        setShowLogoutConfirm(false);
    };

    const handleLogoutCancel = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <>
            <HeaderContainer>
                <HeaderContent>
                    <Logo to="/">EduBridge</Logo>
                    <NavLinks>
                        <NavLink to="/"><FaHome /> Home</NavLink>
                        {user ? (
                            <>
                                <NavLink to="/search"><FaSearch /> Search</NavLink>
                                <NavLink to="/chat"><FaComments /> Chat</NavLink>
                                <NavLink to="/profile/me"><FaUserCircle /> Profile</NavLink>
                                <LogoutButton onClick={handleLogoutClick}><FaSignOutAlt /> Logout</LogoutButton>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login">Login</NavLink>
                                <NavLink to="/register">Register</NavLink>
                            </>
                        )}
                    </NavLinks>
                </HeaderContent>
            </HeaderContainer>
            
            {showLogoutConfirm && (
                <LogoutConfirmModal onClick={handleLogoutCancel}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalTitle>Confirm Logout</ModalTitle>
                        <ModalText>Are you sure you want to logout from EduBridge?</ModalText>
                        <ModalActions>
                            <ModalButton variant="cancel" onClick={handleLogoutCancel}>
                                Cancel
                            </ModalButton>
                            <ModalButton variant="confirm" onClick={handleLogoutConfirm}>
                                Logout
                            </ModalButton>
                        </ModalActions>
                    </ModalContent>
                </LogoutConfirmModal>
            )}
        </>
    );
};

export default Header;