import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../../style/UserDashboard.css';
import faceImage from '../../img/face.jpg';

function UserDashboard() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const storedUserData = JSON.parse(localStorage.getItem('userData'));

                if (storedUserData) {
                    setUserData(storedUserData);
                    setLoading(false);
                } else {
                    fetchUserData(user.uid);
                }
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchUserData = (uid) => {
        const db = getDatabase();
        const userRef = ref(db, 'users/' + uid);
        console.log(userData)
        get(userRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setUserData(userData);

                    localStorage.setItem('userData', JSON.stringify(userData));
                } else {
                    console.log('No additional data available');
                }
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <p className="loading-text">Loading...</p>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (userData) {
        return (
            <div className="user-dashboard-container">
                <div className="user-info">
                    <h1>Welcome, {userData.firstName}</h1>
                    <img src={userData.profileImage} alt="Profile" />
                    <p>Email: {userData.email}</p>
                    <button className="button" onClick={() => navigate('/updateProfile')}>
                        Update Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="user-dashboard-container"
            style={{
                backgroundImage: `url(${faceImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="buttons-container">
                <button className="button" onClick={() => navigate('/login')}>
                    Login
                </button>
                <button className="button" onClick={() => navigate('/register')}>
                    Register
                </button>
            </div>
        </div>
    );
}

export default UserDashboard;
