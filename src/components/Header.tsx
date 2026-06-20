import React from 'react';
import { useAppDispatch } from '../redux/hooks';
import { logout } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  toggleColorMode: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  // Header toolbar was removed per user request.
  // Logout is accessible via sidebar or other nav elements.
  return null;
};
