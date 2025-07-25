import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Button from '../components/shared/Button';
import { useAuth } from '../context/AuthContext';

const HeroSection = styled.section`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(8)} ${({ theme }) => theme.spacing(4)};
  animation: fadeIn 1s ease-out;
  flex-grow: 1; /* Allow it to take available space */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);

  span {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Subtitle = styled.p`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  max-width: 700px;
  line-height: 1.6;
`;

const CallToAction = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  flex-wrap: wrap;
  justify-content: center;
`;

const FeatureSection = styled.section`
  padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(4)};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(4)};
  width: 100%;
  max-width: 1200px;
`;

const FeatureCard = styled.div`
  .glassmorphism;
  padding: ${({ theme }) => theme.spacing(3)};
  flex: 1 1 300px; /* Flex item grows and shrinks, min-width 300px */
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  animation: popUp 0.6s ease-out forwards;
  &:nth-child(2) { animation-delay: 0.1s; }
  &:nth-child(3) { animation-delay: 0.2s; }

  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
  }

  h3 {
    color: ${({ theme }) => theme.colors.accent};
    margin-top: ${({ theme }) => theme.spacing(2)};
    font-size: 1.6rem;
  }

  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 1.1rem;
  }
`;

const HomePage = () => {
    const { user } = useAuth();

    return (
        <>
            <HeroSection>
                <Title>Welcome to <span>EduBridge</span></Title>
                <Subtitle>
                    Your platform for seamless transition from high school to college.
                    Connect with experienced college seniors for guidance, mentorship, and support.
                </Subtitle>
                {!user && (
                    <CallToAction>
                        <Button as={Link} to="/register">Join EduBridge</Button>
                        <Button as={Link} to="/login" variant="secondary">Already a Member?</Button>
                    </CallToAction>
                )}
                {user && (
                    <CallToAction>
                        <Button as={Link} to="/search">Find Mentors</Button>
                        <Button as={Link} to="/profile/me" variant="secondary">View My Profile</Button>
                    </CallToAction>
                )}
            </HeroSection>

            <FeatureSection>
                <FeatureCard>
                    <h3>Personalized Guidance</h3>
                    <p>Get insights into college selection, academic streams, and higher education strategies from those who've been there.</p>
                </FeatureCard>
                <FeatureCard>
                    <h3>Direct Communication</h3>
                    <p>Chat directly with college seniors to ask questions, share concerns, and receive real-time advice.</p>
                </FeatureCard>
                <FeatureCard>
                    <h3>Demystify College Life</h3>
                    <p>Understand the transition from high school to college, reduce anxiety, and prepare for success.</p>
                </FeatureCard>
            </FeatureSection>
        </>
    );
};

export default HomePage;