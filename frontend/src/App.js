import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import UserProfileView from './pages/UserProfileView';
import SearchPage from './pages/SearchPage';
import ChatPage from './pages/ChatPage';
import Header from './components/shared/Header'; // Shared Header
import Footer from './components/shared/Footer'; // Shared Footer
import { ToastContainer } from 'react-toastify'; // For toast notifications
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  position: relative;
  z-index: 1; /* Ensure content is above background effects */
`;

const BackgroundOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.background};
  z-index: 0;
  animation: backgroundAnimation 20s infinite alternate; /* Smooth background animation */

  @keyframes backgroundAnimation {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

const ContentWrapper = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(3)};
  z-index: 1;
  position: relative; /* Needed for z-index to work */
`;


const PrivateRoute = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <div>Loading...</div>; // Or a spinner
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <AppContainer>
                <BackgroundOverlay />
                <Header />
                <ContentWrapper>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/profile/me" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                        <Route path="/profile/:userId" element={<PrivateRoute><UserProfileView /></PrivateRoute>} />
                        <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />
                        <Route path="/chat/:chatId?" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
                        {/* Other routes */}
                    </Routes>
                </ContentWrapper>
                <Footer />
                <ToastContainer /> {/* For real-time notifications */}
            </AppContainer>
        </Router>
    );
}

export default App;