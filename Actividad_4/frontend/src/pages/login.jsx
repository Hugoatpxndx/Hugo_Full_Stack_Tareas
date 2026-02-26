import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [nombre, setNombre] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.usuario));
            navigate('/dashboard');
        } catch (error) {
            const msg = error?.response?.data?.error || error?.response?.data?.mensaje || error.message || 'Error al iniciar sesión.';
            alert(msg);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { nombre, email, password });
            alert('Registro exitoso. Ahora puedes iniciar sesión.');
            setIsRegister(false);
        } catch (error) {
            const msg = error?.response?.data?.error || error?.response?.data?.mensaje || error.message || 'Error al registrarse.';
            alert(msg);
        }
    };

    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>📚 Biblioteca - {isRegister ? 'Registro' : 'Login'}</h2>
            <form onSubmit={isRegister ? handleRegister : handleLogin}>
                {isRegister && (
                    <div>
                        <label>Nombre:</label>
                        <input 
                            type="text" 
                            value={nombre} 
                            onChange={(e) => setNombre(e.target.value)} 
                            required 
                        />
                        <br /><br />
                    </div>
                )}
                <div>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
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
                <button type="submit">{isRegister ? 'Registrarse' : 'Iniciar Sesión'}</button>
            </form>
            <p style={{ marginTop: '15px' }}>
                {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
                <button 
                    onClick={() => setIsRegister(!isRegister)} 
                    style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    {isRegister ? 'Inicia sesión' : 'Regístrate'}
                </button>
            </p>
        </div>
    );
};

export default Login;
