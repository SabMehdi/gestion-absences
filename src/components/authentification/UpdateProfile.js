import React, { useState, useRef, useEffect } from 'react';
import { getDatabase, ref, get, update } from 'firebase/database';
import { getStorage, getDownloadURL, uploadBytes, ref as sref } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import * as faceapi from 'face-api.js';
import { useNavigate } from 'react-router-dom';
import '../../style/Registration.css';

const UpdateProfile = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [imageData, setImageData] = useState('');
    const videoRef = useRef(null);
    const [userData, setUserData] = useState(null);
    const storage = getStorage();
    const navigate = useNavigate();

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = process.env.PUBLIC_URL + '/models';
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                ]);

                setModelsLoaded(true);
                console.log('Face API models loaded');
                await startWebcam(); // await here
            } catch (error) {
                console.error('Face API models failed to load', error);
            }
        };

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

        loadModels();

        return () => {
            unsubscribe();
        };
    }, []);

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoRef.current.srcObject = stream;
        } catch (error) {
            console.error('Error accessing webcam:', error);
            alert('Error accessing webcam:' + error.message);
        }
    };

    const takePicture = () => {
        const canvas = document.createElement('canvas');
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/jpeg');
        setImageData(dataURL);
    };

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
            });
    };

    const handleUpdate = async (e) => {
        e.preventDefault(); // Prevent form submission

        try {
            let image = new Image();
            image.src = imageData;
            await new Promise((resolve) => {
                image.onload = resolve;
            });
            const detections = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
            if (detections) {
                const faceDescriptor = detections.descriptor;

                const db = getDatabase();
                console.log(currentUser.uid)
                const userRef = ref(db, 'users/' + currentUser.uid);

                const imageBlob = await fetch(imageData).then((r) => r.blob());
                const imageFile = new File([imageBlob], 'profile.jpg', { type: 'image/jpeg' });

                const storageRef = sref(storage, 'profile_images/' + currentUser.uid + '.jpg');
                const snapshot = await uploadBytes(storageRef, imageFile);
                const downloadURL = await getDownloadURL(snapshot.ref);

                await update(userRef, {
                    firstName,
                    lastName,
                    birthdate,
                    profileImage: downloadURL,
                    faceDescriptor,
                });
                const updatedUserData = {
                    ...userData,
                    firstName,
                    lastName,
                    birthdate,
                    profileImage: downloadURL,
                    // Add other updated fields as needed
                };

                localStorage.setItem('userData', JSON.stringify(updatedUserData));

                navigate('/userDashboard'); // Navigate after successful update
            }
        } catch (error) {
            console.error('Error updating profile:', error.message);
        }
    };

    return (
        <div className="registration-container">
            {!modelsLoaded && <p>Loading models, please wait...</p>}
            <form className="registration-form" onSubmit={handleUpdate}>
                <h2>Update Profile</h2>
                <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                <input type="date" placeholder="Birthdate" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />

                <div className="webcam-container">
                    <video ref={videoRef} autoPlay />
                    <button type="button" onClick={takePicture}>
                        Take Picture
                    </button>
                </div>
                {imageData && (
                    <div className="image-preview">
                        <img src={imageData} alt="User" />
                    </div>
                )}
                <button type="submit">Update Profile</button>
            </form>
        </div>
    );
};

export default UpdateProfile;
