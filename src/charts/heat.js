import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { getDatabase, ref, onValue } from 'firebase/database';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

function AttendanceAreaChart() {
  const [chartData, setChartData] = useState({
    labels: [], // Dates
    datasets: [
      {
        label: 'Number of Absences',
        data: [], // Absences count
        fill: true,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
      }
    ]
  });

  useEffect(() => {
    const db = getDatabase();
    const sessionsRef = ref(db, 'sessions/');

    onValue(sessionsRef, (snapshot) => {
      const sessionsData = snapshot.val();
      const attendanceCounts = {};

      // Count absences per day
      Object.values(sessionsData).forEach(session => {
        const sessionDate = new Date(session.time).toISOString().split('T')[0];
        const absentCount = session.absents ? Object.keys(session.absents).length : 0;

        if (!attendanceCounts[sessionDate]) {
          attendanceCounts[sessionDate] = 0;
        }
        attendanceCounts[sessionDate] += absentCount;
      });

      // Convert data to chart format
      const dates = Object.keys(attendanceCounts).sort();
      const counts = dates.map(date => attendanceCounts[date]);

      setChartData({
        labels: dates,
        datasets: [{
          ...chartData.datasets[0],
          data: counts
        }]
      });
    });
  }, []);

  return (
    <div>
      <h2>Attendance Trends</h2>
      <Line data={chartData} />
    </div>
  );
}

export default AttendanceAreaChart;
