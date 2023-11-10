import React, { useState, useRef, useEffect } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Registration.css'; // Import your CSS stylesheet
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, set } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import * as faceapi from 'face-api.js';


function Registration() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const [imageData, setImageData] = useState(null);

  // Initialize Firebase Storage
  const storage = getStorage();

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Error accessing webcam:'+ error.message)
    }
  };

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';
      Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        // ... add other models here as needed
      ])
        .then(() => {
          setModelsLoaded(true);
          console.log('Face API models loaded');
          startWebcam()
        })
        .catch((e) => {
          console.error('Face API models failed to load', e);
        });
    };

    loadModels();
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

  const handleRegistration = async (e) => {
    e.preventDefault();
  
    try {
      // Convert imageData to HTMLImageElement
      let image = new Image();
      image.src = imageData;
      await new Promise((resolve) => {
        image.onload = resolve;
      });
  
      // Detect the face in the captured image
      const detections = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptor();
      console.log("Detections:", detections);
  
      if (detections) {
        // Register the user using Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userUid = userCredential.user.uid;
  
        // Upload the image to Firebase Storage
        const imageBlob = await fetch(imageData).then((r) => r.blob());
        const imageFile = new File([imageBlob], 'profile.jpg', { type: 'image/jpeg' });
  
        const storageRef = ref(storage, 'profile_images/' + userUid + '.jpg');
        const snapshot = await uploadBytes(storageRef, imageFile);
        const downloadURL = await getDownloadURL(snapshot.ref);
  
        // Store the user's data, including the download URL, in the Realtime Database
        const database = getDatabase();
        const userRef = dbRef(database, 'users/' + userUid);
        await set(userRef, {
          email: email,
          firstName: firstName,
          lastName: lastName,
          birthdate: birthdate,
          email: email,
          profileImage: downloadURL,
          faceDescriptor: detections.descriptor, 
          isAdmin:false// This is an array of numbers representing the face
        });
        console.log("Face descriptor saved for user:", userUid);
  
        // Redirect to the home page or other actions
        alert('Registration Successful!');
        navigate('/');
      } else {
        console.log("No face detected!");
        alert("No face detected!")
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert('Error during registration: ' + error.message);
    }
  };
  

  return (
    <div className="registration-container">
      {!modelsLoaded && <p>Loading models, please wait...</p>}
      <form className="registration-form" onSubmit={handleRegistration}>
        <h2>Registration</h2>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          type="date"
          placeholder="Birthdate"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
        />
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
}


export default Registration;
