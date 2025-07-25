import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  width: 100%;
  background: ${({ theme }) => theme.colors.cardBackground};
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  text-align: center;
  margin-top: auto; /* Push to bottom */
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  z-index: 10;
  animation: slideInRight 0.5s ease-out;
`;

const Footer = () => {
    return (
        <FooterContainer>
            &copy; {new Date().getFullYear()} EduBridge. All rights reserved.
        </FooterContainer>
    );
};

export default Footer;