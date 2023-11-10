import React, { useState,useEffect } from 'react';
import { Link } from 'react-router-dom'; // If you're using React Router
import { auth } from './firebase'; // Import your Firebase auth object
import { Dropdown } from 'react-bootstrap'; // Import Dropdown from react-bootstrap
import './Navbar.css'; // Import your CSS stylesheet for styling
import { getDatabase, ref as dbRef, get } from 'firebase/database';

function Navbar({ user }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false); // State to track admin status

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    console.log("User object:", user);

  };
  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Function to check admin status
    async function checkAdminStatus() {
      if (user) {
        const adminStatus = await userIsAdmin(user);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false); // Reset admin status if no user is logged in
      }
    }

    checkAdminStatus();
  }, [user]); // Depend on user object

  async function userIsAdmin(user) {
    const database = getDatabase();
    const usersRef = dbRef(database, 'users/' + user.uid);
  
    try {
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        return !!userData.isAdmin; // Ensures the return value is a boolean
      } else {
        console.error('No user data available for UID:', user.uid);
        return false; // Assuming non-existence of data means not an admin
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error.message);
      // Handle error appropriately, possibly returning false or re-throwing
      return false;
    }
  }
  return (
    <nav className="navbar">
  <ul className="nav-list">
    <li className="nav-item">
      <Link to="/" className="nav-link">Home</Link>
    </li>
    <li className="nav-item">
      {user ? (
        <div>
          <ul>
            <li onClick={toggleDropdown}>
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
                <li onClick={handleSignOut}> <Link to={"/"} style={{ color: 'white' }}>Sign Off</Link></li>
              </ul>
              <ul>
                <li> <Link to={"/reset"} style={{ color: 'white' }}>Change Password</Link></li>
              </ul>

              
              {isAdmin && (
                <ul>
                  <li> <Link to={"/attendence"} style={{ color: 'white' }}>Créer séance</Link></li>
                </ul>
              )}

            </div>
          )}
        </div>
      ) : (
        <Link to="/login" className='login-btn'>
          Log In
        </Link>
      )}
    </li>
  </ul>
</nav>
  );
}

export default Navbar;
