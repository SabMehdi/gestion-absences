import React, { useState, useEffect } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { auth } from '../firebase/firebase';
import { getDatabase, ref as dbRef, get } from 'firebase/database';
import '../../style/Navbar.css';
import { useNavigate } from 'react-router-dom';
import logo from '../../img/logo.png';

function CustomNavbar({ user }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate()
  const handleSignOut = async () => {
    try {
      localStorage.removeItem('userData');

      await auth.signOut();

      navigate('/userDashboard')
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    async function checkAdminStatus() {
      if (user) {
        const adminStatus = await userIsAdmin(user);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    }

    checkAdminStatus();
  }, [user]);

  async function userIsAdmin(user) {
    const database = getDatabase();
    const usersRef = dbRef(database, 'users/' + user.uid);

    try {
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        return !!userData.isAdmin;
      } else {
        console.error('No user data available for UID:', user.uid);
        alert('No user data available for UID:', user.uid)
        return false;
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error.message);
      alert('Failed to fetch user data:' + error.message)
      return false;
    }
  }

  return (
    <Navbar bg="light" expand="lg">
      <LinkContainer to="/userDashboard">
        <Navbar.Brand>
          <img src={logo} alt="Logo" className="navbar-logo" />
          Easy Presence
        </Navbar.Brand>
      </LinkContainer>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <LinkContainer to="/">
            <Nav.Link>Home</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/sessions">
            <Nav.Link>Sessions</Nav.Link>
          </LinkContainer>
          {user && isAdmin && (
            <NavDropdown title="Charts" id="basic-nav-dropdown">
              <LinkContainer to="/mood">
                <NavDropdown.Item>Mood Heatmap</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/moodline">
                <NavDropdown.Item>Mood Trends</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/attendanceTrends">
                <NavDropdown.Item>Attendance Number</NavDropdown.Item>
              </LinkContainer>
            </NavDropdown>
          )}
        </Nav>
        <Navbar.Collapse className="justify-content-end">
          <Nav>
            {user ? (
              <NavDropdown title={`Welcome, ${user.email}`} id="basic-nav-dropdown">
                <LinkContainer to="/reset">
                  <NavDropdown.Item>Change Password</NavDropdown.Item>
                </LinkContainer>
                {isAdmin && (
                  <LinkContainer to="/sessionCreation">
                    <NavDropdown.Item>Create Session</NavDropdown.Item>
                  </LinkContainer>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleSignOut}>Sign Off</NavDropdown.Item>
              </NavDropdown>
            ) : null}
          </Nav>
        </Navbar.Collapse>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default CustomNavbar;