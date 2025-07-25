import React from 'react';
import styled from 'styled-components';
import Input from './Input';
import Button from './Button';

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(4)};
  border-radius: ${({ theme }) => theme.borderRadius};
  .glassmorphism; /* Apply glass effect */
  width: 100%;
  max-width: 400px;
  box-sizing: border-box;
  animation: fadeIn 0.8s ease-out;

  h2 {
    text-align: center;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin-bottom: ${({ theme }) => theme.spacing(3)};
    font-size: 2rem;
  }

  label {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 600;
    margin-bottom: ${({ theme }) => theme.spacing(1)};
  }

  select {
    width: 100%;
    padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(2)};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    border: 1px solid ${({ theme }) => theme.colors.inputBorder};
    border-radius: ${({ theme }) => theme.borderRadius};
    background-color: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 1rem;
    box-sizing: border-box;
    transition: all 0.3s ease-in-out;
    -webkit-appearance: none; /* Remove default arrow on select */
    -moz-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%23${({ theme }) => theme.colors.textPrimary.substring(1)}%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    background-size: 1em;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.accent};
      box-shadow: 0 0 0 3px rgba(255, 205, 210, 0.5);
      background-color: rgba(255, 255, 255, 0.1);
    }
  }

  .error-message {
    color: ${({ theme }) => theme.colors.error};
    font-size: 0.9rem;
    margin-top: ${({ theme }) => theme.spacing(-1)};
    margin-bottom: ${({ theme }) => theme.spacing(1)};
  }

  p {
    text-align: center;
    margin-top: ${({ theme }) => theme.spacing(2)};
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const AuthForm = ({ title, onSubmit, children }) => {
  return (
    <FormContainer onSubmit={onSubmit} className="glassmorphism">
      <h2>{title}</h2>
      {children}
    </FormContainer>
  );
};

export default AuthForm;