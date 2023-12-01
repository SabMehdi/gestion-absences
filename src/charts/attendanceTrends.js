import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { getDatabase, ref, onValue } from 'firebase/database';
import Chart from 'chart.js/auto';

const AttendanceChart = () => {
  const [sessions, setSessions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      const db = getDatabase();
      const sessionsRef = ref(db, 'sessions/');

      onValue(sessionsRef, (snapshot) => {
        if (snapshot.exists()) {
          setSessions(snapshot.val());
        }
        setLoading(false);
      });
    };

    fetchSessions();
  }, []); // Empty dependency array ensures the effect runs once on mount

  // Extract session labels and dates
  const sessionData = Object.keys(sessions).map((sessionKey) => ({
    label: sessionKey,
    date: new Date(sessions[sessionKey].time).toDateString(),
    absents: sessions[sessionKey].absents.length,
    attendants: sessions[sessionKey].attendants.length,
  }));

  const data = {
    labels: sessionData.map((session) => `${session.label} - ${session.date}`),
    datasets: [
      {
        label: 'Number of Absents',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        data: sessionData.map((session) => session.absents),
      },
      {
        label: 'Number of Attendants',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        data: sessionData.map((session) => session.attendants),
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: 'category',
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Bar data={data} options={options} />
      )}
    </div>
  );
};

export default AttendanceChart;
