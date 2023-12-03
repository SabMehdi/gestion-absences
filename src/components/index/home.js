import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import StudentHistory from '../attendence/AttendanceHistory';// Import the StudentHistory component
import '../../style/home.css';

function Home() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);

  useEffect(() => {
    const database = getDatabase();
    const usersRef = ref(database, 'users/');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersData = snapshot.val();
      const usersList = usersData ? Object.keys(usersData).map(key => ({
        ...usersData[key],
        id: key
      })) : [];
      setUsers(usersList);
    });

    return () => unsubscribe();
  }, []);

  const handleCardClick = (userId) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="home">
      <h1>Users</h1>
      <div className="user-cards">
        {users.map(user => (
          <div className="user-card" key={user.id} onClick={() => handleCardClick(user.id)}>
            <img src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} className="home-user-image" />
            <div className="user-info">
              <h3>{user.firstName} {user.lastName}</h3>
              <p>{user.email}</p>
              <p>{user.birthdate}</p>
            </div>
          </div>
        ))}
      </div>
      {selectedUserId && <StudentHistory userId={selectedUserId} />}
    </div>
  );
}

export default Home;
