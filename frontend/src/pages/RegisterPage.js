import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthForm from '../components/shared/AuthForm';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import { toast } from 'react-toastify';


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


const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('junior');
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await register({ username, name, email, password, role });
        setLoading(false);
        if (success) {
            toast.success('Registration successful! Please login.', {
                position: "top-right",
                autoClose: 3000,
            });
            navigate('/login');
        } else {
            toast.error('Registration failed. Please try again.', {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    return (
        <AuthForm title="Register" onSubmit={handleSubmit}>
            <FormField>
                <Label htmlFor="username">Username</Label>
                <Input
                    type="text"
                    id="username"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </FormField>
            <FormField>
                <Label htmlFor="name">Full Name</Label>
                <Input
                    type="text"
                    id="name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </FormField>
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
            <FormField>
                <Label htmlFor="role">I am a:</Label>
                <select id="role" value={role} onChange={(e) => setRole(e.target.value)} required>
                    <option value="junior">12th Grade Student</option>
                    <option value="senior">College Senior</option>
                </select>
            </FormField>
            <Button type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
            </Button>
            <p>Already have an account? <Link to="/login">Login here</Link></p>
        </AuthForm>
    );
};

export default RegisterPage;