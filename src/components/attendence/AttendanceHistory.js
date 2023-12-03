import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import "../../style/StudentHistory.css"

function StudentHistory({ userId }) {
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  useEffect(() => {
    const database = getDatabase();
    const sessionsRef = ref(database, 'sessions/');
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      const sessionsData = snapshot.val();
      const history = [];

      for (let session in sessionsData) {
        const { absents, attendants } = sessionsData[session];
        const attendanceRecord = { sessionId: session, status: 'Absent', time: '' ,mood:''};

        const found = attendants?.find(attendant => attendant.uid === userId);
        if (found) {
          attendanceRecord.status = 'Present';
          attendanceRecord.time = found.time;
          attendanceRecord.mood=found.mood
        }

        history.push(attendanceRecord);
      }

      setAttendanceHistory(history);
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="history-container">
      <h2>Attendance History</h2>
      <ul className="history-list">
        {attendanceHistory.map(record => (
          <li key={record.sessionId} className={`history-record ${record.status.toLowerCase()}`}>
            Session {record.sessionId}: <span className="history-record-status">{record.status}</span>
            {record.time && <span className="history-record-time"> at {new Date(record.time).toLocaleString()}</span>} {record.mood}
          </li>
        ))}
      </ul>
    </div>
  );
  
}

export default StudentHistory;
