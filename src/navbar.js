import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // If you're using React Router
import { auth } from './firebase'; // Import your Firebase auth object
import { Dropdown } from 'react-bootstrap'; // Import Dropdown from react-bootstrap
import './Navbar.css'; // Import your CSS stylesheet for styling

function Navbar({ user }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };


  return (
    <nav className="navbar">
      <ul className="nav-list">
        <li className="nav-item">
          <Link to="/" className="nav-link">Home</Link>
        </li>
        <li className="nav-item">
          {user ? (
          <div >
          <ul>
            <li onClick={toggleDropdown} >
              Welcome, {user.email}
              {showDropdown ? (
                <span className="dropdown-icon">&#9650;</span>
              ) : (
                <span className="dropdown-icon">&#9660;</span>
              )}
            </li>
          </ul>
    
          {showDropdown && (
            <div className="dropdown">
              <ul>
                <li onClick={handleSignOut} > <Link to={"/"}  style={{color:'white'}}>sign off</Link></li>
              </ul>
              <ul>
                <li> <Link to={"/modifyPass"}  style={{color:'white'}}>change password</Link></li>
              </ul>
            </div>
          )}
        </div>
          ) : (
            <Link to="/login" className="login-button btn btn-secondary">
              Log In
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
