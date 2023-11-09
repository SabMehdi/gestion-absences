import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

function MoodAnalysis() {
  const [imageData, setImageData] = useState(null);
  const [expressions, setExpressions] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
      startWebcam();
    };

    loadModels();
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const takePicture = async () => {
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/jpeg');
    setImageData(dataURL);

    // Now detect the mood
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
    if (detections) {
      setExpressions(detections.expressions);
    }
  };

  return (
    <div className="mood-analysis-container">
      <h2>Mood Analysis</h2>
      <div className="webcam-container">
        <video ref={videoRef} autoPlay />
        <button onClick={takePicture}>Take Picture</button>
      </div>
      {imageData && (
        <div className="image-preview">
          <img src={imageData} alt="Captured" />
          {expressions && (
            <div className="expressions">
              <h3>Expressions:</h3>
              <ul>
                {Object.entries(expressions).map(([expression, probability]) => (
                  <li key={expression}>{`${expression}: ${(probability * 100).toFixed(2)}%`}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MoodAnalysis;
