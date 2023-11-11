import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { getDatabase, ref as dbRef, get, push, set } from 'firebase/database';
import "./Attendence.css"
import { useLocation } from 'react-router-dom';

function Attendence() {
  const location = useLocation();
  const sessionName = location.state?.sessionName;
  const [imageData, setImageData] = useState(null);
  const [expressions, setExpressions] = useState(null);
  const videoRef = useRef(null);
  const [loadedModels, setLoadedModels] = useState(false);
  const [bestMatch, setBestMatch] = useState(null); // State to store the best match

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
        return Object.entries(usersData).map(([uid, user]) => ({
          uid,
          descriptor: user.faceDescriptor,
        }));
      } else {
        throw new Error('No user data available');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error.message);
      throw error;
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

      await new Promise((resolve) => {
        image.onload = resolve;
      });
      const detections = await faceapi.detectSingleFace(image, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()
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

        if (bestMatch.distance < 0.6) {
          console.log(`Match found! User ID: ${bestMatch.uid}`);
          setBestMatch({
            uid: bestMatch.uid,
            time: new Date().toISOString(),
            mood: extractDominantMood(detections.expressions),
          });
        } else {
          console.log('No match found.');
          setBestMatch(null)
        }
      }
    } catch (error) {
      console.error('Error taking picture or detecting mood:', error.message);
      alert('Error taking picture or detecting mood: ' + error.message)
    }
  };
  function extractDominantMood(expressions) {
    return Object.entries(expressions)
      .reduce((max, current) => current[1] > max[1] ? current : max, ['', 0])[0];
  }
  async function saveAttendanceRecord() {
    if (!bestMatch) {
      alert("no match found to save!")
      return
    }

    const database = getDatabase();
    const sessionRef = dbRef(database, `sessions/${sessionName}/attendants`);
    const newRecordRef = push(sessionRef);
    await set(newRecordRef, bestMatch);
    alert('Attendance recorded successfully.');
    setBestMatch(null); // Clear the match after saving
  }

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
        <button className="custom-btn" onClick={saveAttendanceRecord}>
          Save Attendance
        </button>
        <button className="custom-btn" onClick={() => { /* Functionality for Button 2 */ }}>
          Button 2
        </button>
      </div>
    </div>
  );


}

export default Attendence;
