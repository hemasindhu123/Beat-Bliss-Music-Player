import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginRegister from './components/Auth/LoginRegister';
import MusicPlayer from './components/MusicPlayer';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Karaoke from './components/Karaoke';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginRegister />} />
          <Route path="/player" element={<PrivateRoute><MusicPlayer /></PrivateRoute>} />
          <Route path="/karaoke" element={<Karaoke />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// PrivateRoute component to protect routes
function PrivateRoute({ children }) {
  const { user } = React.useContext(AuthContext);
  return user ? children : <Navigate to="/" />;
}

export default App;
