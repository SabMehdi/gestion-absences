import React, { useState, useRef, useEffect } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import your CSS stylesheet
import * as faceapi from 'face-api.js';
import { getDatabase, ref as dbRef, get } from 'firebase/database';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const navigate = useNavigate();

  const videoRef = useRef(null);
  const [imageData, setImageData] = useState(null);

  async function getFaceDescriptorFromDatabase(email, password) {

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const userUid = userCredential.user.uid
      const database = getDatabase();
      const userRef = dbRef(database, 'users/' + userUid);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        return userData.faceDescriptor; // Assuming 'faceDescriptor' is stored in the database
      } else {
        throw new Error('No data available for user UID: ' + userUid);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    };

    loadModels().then(startWebcam());
  }, []);

  const takePicture = () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/jpeg');
    setImageData(dataURL);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Check if the image has been taken
    if (!imageData) {
      alert('Please take a picture before logging in.');
      return; // Stop the function if no picture has been taken
    }

    try {
      // Create an image element from the imageData
      const img = new Image();
      img.src = imageData;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Perform face detection on the image
      const detections = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      if (!detections) {
        throw new Error('No face detected, please try again.');
      }

      // Fetch the user's face descriptor from Firebase
      const userFaceDescriptor = await getFaceDescriptorFromDatabase(email, password);

      // Compare the descriptors
      const distance = faceapi.euclideanDistance(detections.descriptor, userFaceDescriptor);
      if (distance >= 0.6) { // Adjust threshold as needed
        throw new Error('Face not recognized. Please try again or use your password to log in.');
      }

      // Authenticate with Firebase using email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert('Face recognized. Login Successful!');
      navigate('/'); // Navigate to the main page

    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };




  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="webcam-container">
          <video ref={videoRef} autoPlay />
          <button type="button" onClick={takePicture}>Take Picture</button>
        </div>
        {imageData && (
          <div className="image-preview">
            <img src={imageData} alt="User" />
          </div>
        )}
        <button type="submit">Login</button>
        <div className="additional-options">
          <button
            type="button"
            onClick={() => {
              navigate('/register');
            }}
          >
            Register
          </button>
          <button
            type="button"
            onClick={() => {
              navigate('/reset');
            }}
          >
            Forgot Password
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
