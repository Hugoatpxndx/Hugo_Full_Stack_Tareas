// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Aquí después protegeremos esta ruta para que solo entre si hay token */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Si escriben una ruta que no existe, los regresa al login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;