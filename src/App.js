import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './login';
import Registration from './register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' Component={Login}/>
        <Route path='/register' Component={Registration}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
