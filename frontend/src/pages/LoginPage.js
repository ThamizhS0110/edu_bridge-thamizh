import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthForm from '../components/shared/AuthForm';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import styled from 'styled-components';


const FormField = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(email, password);
        setLoading(false);
        if (success) {
            toast.success('Logged in successfully!', {
                position: "top-right",
                autoClose: 3000,
            });
            navigate('/profile/me'); // Redirect to profile after login
        } else {
            toast.error('Login failed. Please check your credentials.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    return (
        <AuthForm title="Login" onSubmit={handleSubmit}>
            <FormField>
                <Label htmlFor="email">Email</Label>
                <Input
                    type="email"
                    id="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </FormField>
            <FormField>
                <Label htmlFor="password">Password</Label>
                <Input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </FormField>
            <Button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </Button>
            <p>Don't have an account? <Link to="/register">Register here</Link></p>
        </AuthForm>
    );
};

export default LoginPage;