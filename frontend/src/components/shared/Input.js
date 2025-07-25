import styled from 'styled-components';

const Input = styled.input`
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1rem;
  transition: all 0.3s ease-in-out;
  box-sizing: border-box; /* Include padding and border in the element's total width and height */

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(255, 205, 210, 0.5); /* Light red glow */
    background-color: rgba(255, 255, 255, 0.1);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export default Input;