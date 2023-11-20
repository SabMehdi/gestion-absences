import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import "../../style/Sessions.css"
function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState({});

  useEffect(() => {
    const db = getDatabase();
    const sessionsRef = ref(db, 'sessions/');
    const usersRef = ref(db, 'users/');
  
    onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      setUsers(usersData || {});
    });
  
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      const sessionsData = snapshot.val();
      const sessionsArray = sessionsData ? Object.entries(sessionsData).map(([key, value]) => ({
        sessionId: key,
        ...value
      })) : [];
      setSessions(sessionsArray);
    });

    return () => unsubscribe();
  }, []);

  // SessionCard component to display each session's details
  function SessionCard({ session }) {
    return (
      <div className="session-card">
        <h3>Session ID: {session.sessionId} - {new Date(session.time).toLocaleString()}</h3>
        <div>
          <strong>Attendants:</strong>
          <ul>
            {session.attendants && Object.entries(session.attendants).map(([key, attendant]) => {
              const user = users[attendant.uid];
              const fullName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';
              return (
                <li key={key}>
                  {user && <img src={user.profileImage} alt={fullName} className="session-user-image" />}
                  {fullName} - {attendant.mood} - {new Date(session.time).toLocaleString()}
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <strong>Absents:</strong>
          <ul>
            {session.absents && Object.entries(session.absents).map(([key, absent]) => {
              const user = users[absent.uid];
              const fullName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';
              return (
                <li key={key}>
                  {user && <img src={user.profileImage} alt={fullName} className="session-user-image" />}
                  {fullName}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
  
  
  // SessionList component to list all sessions
  function SessionList({ sessions }) {
    return (
      <div className="session-list">
        {sessions.map((session) => (
          <SessionCard key={session.sessionId} session={session} />
        ))}
      </div>
    );
  }

  return (
    <div className="sessions">
      <h1>Sessions</h1>
      <SessionList sessions={sessions} />
    </div>
  );
}

export default Sessions;
