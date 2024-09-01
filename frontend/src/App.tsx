import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/NavbarUp';
import Login from './components/Login';
import Home from './components/Home';
import Collection from './components/Collection';
import Register from './components/Register';
import TTs from './components/textToSpeechs';
import Footer from './components/Footer';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <div className="App">
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        <main className="App-content">
          <Routes>
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/home" element={<Home />} />
            {isLoggedIn && <Route path="/collection" element={<Collection />} />}
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Home />} />
            <Route path="/tts" element={<TTs />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
