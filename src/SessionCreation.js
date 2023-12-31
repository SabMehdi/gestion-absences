import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SessionCreation() {
  const [sessionName, setSessionName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save sessionName to state or context
    // For example, using React Context or a global state management library
    // Then navigate to the attendance page
    navigate('/attendence', { state: { sessionName } });
  };

  return (
    <div>
      <h1>Create a New Session</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          placeholder="Enter Session Name"
          required
        />
        <button type="submit">Start Session</button>
      </form>
    </div>
  );
}

export default SessionCreation;
