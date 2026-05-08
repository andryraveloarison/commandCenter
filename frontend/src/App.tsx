import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Router from './Router';
import Layout from '@components/Layout';
import { useAppSelector, useAppDispatch } from '@hooks/useAppRedux';
import apiService from '@services/api';
import { setUser, setLoading, logout } from '@store/slices/authSlice';

const App = () => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, user } = useAppSelector((state) => state.auth);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (token && !user) {
        dispatch(setLoading(true));
        try {
          const response = await apiService.getProfile();
          dispatch(setUser(response.data));
        } catch (error) {
          console.error('Session expired or invalid token', error);
          dispatch(logout());
        } finally {
          dispatch(setLoading(false));
        }
      }
    };

    fetchProfile();
  }, [token, user, dispatch]);

  // Pages that don't use the main layout
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <Router />;
  }

  return (
    <Layout>
      <Router />
    </Layout>
  );
};

export default App;
