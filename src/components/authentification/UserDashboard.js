import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get } from "firebase/database";
import { useNavigate } from 'react-router-dom';
import '../../style/UserDashboard.css'; // assuming you have a separate CSS file
import faceImage from '../../img/face.jpg';

function UserDashboard({ user }) {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchUserData(user.uid);
        }
    }, [user]);

    const fetchUserData = (uid) => {
        const db = getDatabase();
        const userRef = ref(db, 'users/' + uid);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                setUserData(snapshot.val());
                console.log(userData)
            } else {
                console.log("No additional data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    };

    if (user && userData) {
        return (
            <div className="user-dashboard-container">
                <div className="user-info">
                    <h1>Welcome, {userData.firstName}</h1>
                    <img src={userData.profileImage} alt="Profile" />
                    <p>Email: {userData.email}</p>
                    <button className="button" onClick={() => navigate('/profile-update')}>Update Profile</button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-dashboard-container">
            <img src={faceImage} alt="Description" className="centered-image" />
            <button className="button" onClick={() => navigate('/login')}>Login</button>
            <button className="button" onClick={() => navigate('/register')}>Register</button>
        </div>
    );
}

export default UserDashboard;
