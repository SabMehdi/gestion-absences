import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { getDatabase, ref as dbRef, get } from 'firebase/database';
import "./Attendence.css"
function Attendence() {
  const [imageData, setImageData] = useState(null);
  const [expressions, setExpressions] = useState(null);
  const videoRef = useRef(null);
  const [loadedModels, setLoadedModels] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        ]);
        setLoadedModels(true);
        startWebcam();
      } catch (e) {
        alert("Error when loading models: " + e.message);
      }
    };

    loadModels();

    // Cleanup function to stop the webcam stream when the component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Error accessing webcam: ' + error.message)
    }
  };

  async function getAllFaceDescriptorsFromDatabase() {
    const database = getDatabase();
    const usersRef = dbRef(database, 'users/');
    try {
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        // Transform the usersData object into an array of descriptors
        return Object.entries(usersData).map(([uid, user]) => ({
          uid,
          descriptor: user.faceDescriptor,
        }));
      } else {
        throw new Error('No user data available');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error.message);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  const takePicture = async () => {
    try {
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL('image/jpeg');

      setImageData(dataURL);
      let image = new Image();
      image.src = dataURL;

      // Wait for the image to load before attempting face detection
      await new Promise((resolve) => {
        image.onload = resolve;
      });
      // Now detect the mood
      const detections = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()// This line is added to get the descriptor
        .withFaceExpressions()
      if (detections) {
        console.log(detections)
        const capturedDescriptor = detections.descriptor;
        const storedDescriptors = await getAllFaceDescriptorsFromDatabase();

        setExpressions(detections.expressions);

        let bestMatch = { uid: null, distance: Infinity };

        storedDescriptors.forEach(({ uid, descriptor: userDescriptor }) => {
          const distance = faceapi.euclideanDistance(capturedDescriptor, userDescriptor);
          if (distance < bestMatch.distance) {
            bestMatch = { uid, distance };
          }
        });

        if (bestMatch.distance < 0.6) { // Threshold value, might need tuning
          console.log(`Match found! User ID: ${bestMatch.uid}`);
          // Perform action for successful match
        } else {
          console.log('No match found.');
          // Perform action for no match
        }
      }
    } catch (error) {
      console.error('Error taking picture or detecting mood:', error.message);
      alert('Error taking picture or detecting mood: ' + error.message)
    }
  };

  return (
    <div className="mood-analysis-container">
      <h2>Attendance Check</h2>
      <div className="content-container">
        {!loadedModels && (
          <div className="loading-models">Loading models...</div>
        )}
        {loadedModels && (
          <div className="webcam-container">
            <video ref={videoRef} autoPlay className="webcam-video" />
          </div>
        )}
        <button className="take-picture-btn" onClick={takePicture}>Take Picture</button>

        {imageData && (
          <div className="image-preview-container">
            <div className="image-preview">
              <img src={imageData} alt="Captured" className="captured-image" />
            </div>
            {expressions && (
              <div className="expressions-container">
                <h3>Expressions:</h3>
                <ul className="expressions-list">
                  {Object.entries(expressions).map(([expression, probability]) => (
                    <li key={expression} className="expression-item">
                      {`${expression}: ${(probability * 100).toFixed(2)}%`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="buttons-container">
        <button className="custom-btn" onClick={() => {/* Functionality to be added */ }}>
          Button 1
        </button>
        <button className="custom-btn" onClick={() => {/* Functionality to be added */ }}>
          Button 2
        </button>
      </div>
    </div>
  );


}

export default Attendence;
