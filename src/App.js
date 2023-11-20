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

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
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

        <Route path='/login' Component={Login} />
        <Route path='/register' Component={Registration} />
        <Route path='/reset' Component={ForgotPassword} />
        <Route path='/attendence' Component={Attendence} />
        <Route path='/sessionCreation' Component={SessionCreation} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
