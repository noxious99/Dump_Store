import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from './pages/Home-Page';
import Navbar from './common-components/Navbar';
import BottomNav from './common-components/BottomNav';
import Footer from "@/common-components/Footer.tsx";
import Auth from './pages/Auth-Page';
import Dashboard from './pages/Dashboard-Page';
import ExpenseTracker from './pages/ExpenseTracker-Page';
import ExpenseTrackerPreview from './pages/ExpenseTracker-Preview';
import GoalsTracker from './pages/GoalsTracker-Page';
import IouTracker from './pages/IouTracker-Page';
import ResetPassword from './pages/ResetPassword-Page';
import Profile from './pages/Profile-Page';
import ProtectedRoutes from './feature-component/auth/ProtectedRoutes';
import HomeRedirect from './feature-component/auth/HomeRedirect';

import { useDispatch, useSelector } from 'react-redux';
import { rehydrateUser, selectUser } from './feature-component/auth/userSlice';
import type { AppDispatch } from './store/store';
import { Toaster } from 'sonner'

// App sections that get the mobile bottom nav (and no marketing footer).
const APP_ROUTES = ['/dashboard', '/expense-tracker', '/expense-tracker-preview', '/goals-tracker', '/iou-tracker', '/profile'];

const AppContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(rehydrateUser());
  }, [dispatch]);

  const isAppRoute = APP_ROUTES.some((route) => location.pathname.startsWith(route));
  const hideFooter = isAppRoute;
  // Mobile bottom nav: only for logged-in users inside the app sections.
  const showBottomNav = Boolean(user.token) && isAppRoute;

  return (
    <div className="App box-border max-w-[2160px] flex justify-center min-w-[360px]">
      <Toaster
        duration={1000}
        richColors
        closeButton
      />
      <Navbar />
      {/* pb on mobile keeps page content clear of the fixed bottom nav */}
      <main className={showBottomNav ? 'pb-20 md:pb-0' : undefined}>
        <Routes>
          <Route path='/' element={<HomeRedirect />} />
          <Route path='/home' element={<Home />} />
          <Route path='/auth' element={<Auth />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route element={<ProtectedRoutes/>}>
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/expense-tracker' element={<ExpenseTracker />} />
            <Route path='/expense-tracker-preview' element={<ExpenseTrackerPreview />} />
            <Route path='/goals-tracker' element={<GoalsTracker />} />
            <Route path='/iou-tracker' element={<IouTracker />} />
            <Route path='/profile' element={<Profile />} />
          </Route>
        </Routes>
      </main>
      {!hideFooter && <Footer />}
      {showBottomNav && <BottomNav />}
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