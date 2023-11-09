import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './login';
import Registration from './register';
import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import { auth } from './firebase';
import Home from './home';
import ForgotPassword from './resetPassword';
import Attendence from './Attendence';
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
      <Navbar user={user} />
      <Routes>
        <Route path='/' Component={Home} />
        <Route path='/login' Component={Login} />
        <Route path='/register' Component={Registration} />
        <Route path='/reset' Component={ForgotPassword}/>
        <Route path='/attendence' Component={Attendence}/>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
