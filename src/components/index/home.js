import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import '../../style/home.css'; // Assuming you will create this CSS file for styling

function Home() {
  const [users, setUsers] = useState([]);

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

  return (
    <div className="home">
      <h1></h1>
      <div className="user-cards">
        {users.map(user => (
          <div className="user-card" key={user.id}>
            <img src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} className="home-user-image" />
            <div className="user-info">
              <h3>{user.firstName} {user.lastName}</h3>
              <p>{user.email}</p>
              <p>{user.birthdate}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
