import React, { useState, useEffect } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { auth } from './firebase';
import { getDatabase, ref as dbRef, get } from 'firebase/database';
import  "./Navbar.css"
function CustomNavbar({ user }) {
  const [isAdmin, setIsAdmin] = useState(false);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
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
      <Navbar.Brand href="/">Attendance App</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <LinkContainer to="/">
            <Nav.Link>Home</Nav.Link>
          </LinkContainer>
         
        </Nav>
      </Navbar.Collapse>
      {user ? (
            <>
              <NavDropdown title={`Welcome, ${user.email}`} id="basic-nav-dropdown">
                <LinkContainer to="/reset">
                  <NavDropdown.Item>Change Password</NavDropdown.Item>
                </LinkContainer>
                {isAdmin && (
                  <LinkContainer to="/sessionCreation">
                    <Nav.Link>Créer séance</Nav.Link>
                  </LinkContainer>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleSignOut}>Sign Off</NavDropdown.Item>
              </NavDropdown>
            </>
          ) : (
            <LinkContainer to="/login">
              <Nav.Link>Log In</Nav.Link>
            </LinkContainer>
          )}
    </Navbar>
  );
}

export default CustomNavbar;
