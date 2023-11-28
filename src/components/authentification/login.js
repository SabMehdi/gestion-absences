import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../../style/Login.css'; 
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
        return userData.faceDescriptor; 
      } else {
        throw new Error('No data available for user UID: ' + userUid);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error; 
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
    const canvas = document.createElement('canvas');//utilisé pour la rendu de graphiques 2D
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/jpeg');
    setImageData(dataURL);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!imageData) {
      alert('Please take a picture before logging in.');
      return;
    }

    try {
      const img = new Image();
      img.src = imageData;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const detections = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();//1 detecter la presence et generer description du visage
      if (!detections) {
        throw new Error('No face detected, please try again.');
      }

      const userFaceDescriptor = await getFaceDescriptorFromDatabase(email, password);//asyn 

      const distance = faceapi.euclideanDistance(detections.descriptor, userFaceDescriptor);//calcule la distance euclidienne entre deux descripteurs de visage,
      if (distance >= 0.6) { 
        throw new Error('Face not recognized. Please try again or use your password to log in.');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      alert('Face recognized. Login Successful!');
      navigate('/');

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
