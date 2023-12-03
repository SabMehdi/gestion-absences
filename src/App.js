import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/authentification/login';
import Registration from './components/authentification/register';
import React, { useState, useEffect } from 'react';
import CustomNavbar from './components/nav/navbar';
import { auth } from './components/firebase/firebase';
import Home from './components/index/home';
import ForgotPassword from './components/authentification/resetPassword';
import Attendence from './components/attendence/Attendence';
import SessionCreation from './components/attendence/SessionCreation';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sessions from './components/attendence/Sessions';

import MoodHeatmap from './charts/Mood';
import UserDashboard from './components/authentification/UserDashboard';
import AttendanceChart from './charts/attendanceTrends';
import MoodLineChart from './charts/MoodLine';
import UpdateProfile from './components/authentification/UpdateProfile';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      console.log(user)
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <BrowserRouter>
      <CustomNavbar user={user} />
      <Routes>
        <Route path='/' Component={Home} />
        <Route path='/Sessions' Component={Sessions} />
        <Route path='/attendanceTrends' Component={AttendanceChart} />
        <Route path='/mood' Component={MoodHeatmap} />
        <Route path='/moodline' Component={MoodLineChart} />
        <Route path='/login' Component={Login} />
        <Route path='/register' Component={Registration} />
        <Route path='/reset' Component={ForgotPassword} />
        <Route path='/attendence' Component={Attendence} />
        <Route path='/sessionCreation' Component={SessionCreation} />
        <Route path='/userDashboard' element={<UserDashboard user={user} />} />
        <Route path='/updateProfile' Component={UpdateProfile} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
