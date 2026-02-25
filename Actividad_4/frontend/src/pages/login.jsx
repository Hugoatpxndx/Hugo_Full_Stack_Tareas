// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Hacemos la petición al backend (asumiendo que harás la ruta /api/auth/login después)
            const response = await api.post('/auth/login', { username, password });
            
            // Guardamos el token en el almacenamiento del navegador
            localStorage.setItem('token', response.data.token);
            
            // Redirigimos al panel principal
            navigate('/dashboard');
        } catch (error) {
            alert('Error al iniciar sesión. Verifica tus credenciales.');
        }
    };

    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>NetSupport - Acceso</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Usuario Técnico:</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>
                <br />
                <div>
                    <label>Contraseña:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <br />
                <button type="submit">Entrar al Sistema</button>
            </form>
        </div>
    );
};

export default Login;