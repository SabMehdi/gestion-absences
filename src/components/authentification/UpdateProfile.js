// UpdateProfile.js

import React, { useState, useRef } from 'react';
import { useEffect } from 'react';

import { getDatabase, ref, get, update } from 'firebase/database';
import { getStorage } from 'firebase/storage';

import { getAuth, onAuthStateChanged } from 'firebase/auth';

const UpdateProfile = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const navigate = useNavigate();

    const videoRef = useRef(null);
    const [imageData, setImageData] = useState(null);
    useEffect(() => {
        const auth = getAuth();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const storedUserData = JSON.parse(localStorage.getItem('userData'));

                if (storedUserData) {
                    setUserData(storedUserData);
                } else {
                    fetchUserData(user.uid);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchUserData = (uid) => {
        const db = getDatabase();
        const userRef = ref(db, 'users/' + uid);

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
    };

    const handleUpdate = async () => {
        try {
            // Capture face descriptor using face-api.js
            const faceDescriptor = await captureFaceDescriptor();

            // Update user information in Firebase Realtime Database
            const db = getDatabase();
            const userRef = ref(db, 'users/' + currentUser.uid); // Use currentUser.uid here

            await update(userRef, { // Use update here
                firstName,
                lastName,
                birthdate: birthday,
                profileImage,
                faceDescriptor,
            });

            // Update user's profile image in Firebase Storage
            if (profileImage !== currentUser.photoURL) {
                const storageRef = getStorage().ref(`profile_images/${currentUser.uid}`);
                await storageRef.putString(profileImage, 'data_url');
            }

            // Notify parent component about the update
        } catch (error) {
            console.error('Error updating profile:', error.message);
        }
    };

    const captureFaceDescriptor = async () => {
        // Implement logic to capture face descriptor using face-api.js
        // You may use the webcam video stream and face-api.js to capture the face descriptor
        // Example: https://github.com/justadudewhohacks/face-api.js/blob/master/examples/webcam_face_detection.html
        // Make sure to adapt this function based on your face-api.js setup
    };

    const startCapture = () => {
        // Start capturing video from the webcam
        /*    captureUserMedia(videoRef.current, () => {
             // Callback function when media capture is successful
           }); */
    };

    return (
        <div>
            <h2>Update Profile</h2>
            <label>
                First Name:
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </label>
            <label>
                Last Name:
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </label>
            <label>
                Birthday:
                <input type="text" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
            </label>
            <label>
                Profile Image URL:
                <input type="text" value={profileImage} onChange={(e) => setProfileImage(e.target.value)} />
            </label>
            <button onClick={handleUpdate}>Update</button>

            {/* Add a video element for webcam capture */}
            <video ref={videoRef} style={{ display: 'none' }} />
            <button onClick={startCapture}>Start Webcam Capture</button>
        </div>
    );
};

export default UpdateProfile;
