import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from './pages/Home-Page';
import Navbar from './common-components/Navbar';
import Footer from "@/common-components/Footer.tsx";
import Auth from './pages/Auth-Page';
import Dashboard from './pages/Dashboard-Page';
import ExpenseTracker from './pages/ExpenseTracker-Page';
import ResetPassword from './pages/ResetPassword-Page';
import Profile from './pages/Profile-Page';
import ProtectedRoutes from './feature-component/auth/ProtectedRoutes';
import HomeRedirect from './feature-component/auth/HomeRedirect';

import { useDispatch } from 'react-redux';
import { rehydrateUser } from './feature-component/auth/userSlice';
import type { AppDispatch } from './store/store';
import { Toaster } from 'sonner'

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  useEffect(() => {
    dispatch(rehydrateUser());
  }, [dispatch]);

  const hideFooterRoutes = ['/dashboard', '/expense-tracker'];
  const hideFooter = hideFooterRoutes.some((route) => 
    location.pathname.startsWith(route)
  );

  return (
    <div className="App box-border max-w-[2160px] flex justify-center min-w-[360px]">
      <Toaster
        duration={1000}
        richColors
        closeButton
      />
      <Navbar />
      <main>
        <Routes>
          <Route path='/' element={<HomeRedirect />} />
          <Route path='/home' element={<Home />} />
          <Route path='/auth' element={<Auth />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route element={<ProtectedRoutes/>}>
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/expense-tracker' element={<ExpenseTracker />} />
            <Route path='/profile' element={<Profile />} />
          </Route>
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;