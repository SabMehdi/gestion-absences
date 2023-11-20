import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './login';
import Registration from './register';
import React, { useState, useEffect } from 'react';
import CustomNavbar from './navbar'
import { auth } from './firebase';
import ForgotPassword from './resetPassword';
import Attendence from './Attendence';
import SessionCreation from './SessionCreation';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sessions from './Sessions';
import Home from './home';
import DashBoard from './DashBoard';
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
