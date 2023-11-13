import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h2>Accueil</h2>
      <Link to="/register">
        <button>Nouveau étudiant</button>
      </Link>
      <Link to="/login">
        <button>Ancien étudiant</button>
      </Link>
      <Link to="/login">
        <button>Professeur</button>
      </Link>
    </div>
  );
}

export default Home;
