import React, { useState, useRef, useEffect } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Registration.css'; // Import your CSS stylesheet
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, set } from 'firebase/database';
import { getStorage } from 'firebase/storage';

function Registration() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    }
  };

  useEffect(() => {
    startWebcam();
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
    e.preventDefault(); // Prevent the default form submission behavior
    // Your registration logic here, including using `imageData` for the user's profile image.
    try {
      // Upload the image to Firebase Storage
      if (imageData) {
        const imageBlob = await fetch(imageData).then((r) => r.blob());
        const imageFile = new File([imageBlob], 'profile.jpg', { type: 'image/jpeg' });

        const storageRef = ref(storage, 'profile_images/' + auth.currentUser.uid + '.jpg');
        const snapshot = await uploadBytes(storageRef, imageFile);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Store the user's data, including the download URL, in the Realtime Database
        const database = getDatabase();
        const userRef = dbRef(database, 'users/' + auth.currentUser.uid);
        await set(userRef, {
          email: email,
          profileImage: downloadURL,
        });

        // Continue with user registration
        await createUserWithEmailAndPassword(auth, email, password);

        // Redirect to the home page or other actions
        alert('Registration Successful!');
        navigate('/');
      }
    } catch (error) {
      alert('Error during registration: ' + error.message);
    }
  };

  return (
    <div className="registration-container">
      <form className="registration-form">
        <h2>Registration</h2>
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
        <button type="button" onClick={handleRegistration}>
          Register
        </button>
      </form>
    </div>
  );
}

export default Registration;
