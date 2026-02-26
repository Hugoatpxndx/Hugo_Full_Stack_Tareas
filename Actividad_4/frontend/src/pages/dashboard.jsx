import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [libros, setLibros] = useState([]);
    const [prestamos, setPrestamos] = useState([]);
    const [vista, setVista] = useState('libros');
    const [usuario, setUsuario] = useState(null);
    const [nuevoLibro, setNuevoLibro] = useState({ titulo: '', autor: '', isbn: '', cantidad: 1 });
    const [nuevoPrestamo, setNuevoPrestamo] = useState({ libro_id: '', fecha_prestamo: '', fecha_devolucion: '' });

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (!token) {
            navigate('/');
        } else {
            setUsuario(JSON.parse(user));
            fetchLibros();
            fetchPrestamos();
        }
    }, [navigate]);

    const fetchLibros = async () => {
        try {
            const response = await api.get('/libros');
            setLibros(response.data.libros);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchPrestamos = async () => {
        try {
            const response = await api.get('/prestamos');
            setPrestamos(response.data.prestamos);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleCrearLibro = async (e) => {
        e.preventDefault();
        try {
            await api.post('/libros', nuevoLibro);
            setNuevoLibro({ titulo: '', autor: '', isbn: '', cantidad: 1 });
            fetchLibros();
            alert('Libro agregado exitosamente');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al agregar libro');
        }
    };

    const handleEliminarLibro = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este libro?')) {
            try {
                await api.delete(`/libros/${id}`);
                fetchLibros();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const handleCrearPrestamo = async (e) => {
        e.preventDefault();
        try {
            await api.post('/prestamos', nuevoPrestamo);
            setNuevoPrestamo({ libro_id: '', fecha_prestamo: '', fecha_devolucion: '' });
            fetchPrestamos();
            fetchLibros(); // Actualizar disponibilidad
            alert('Préstamo registrado exitosamente');
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.error || 'Error al crear préstamo');
        }
    };

    const inputStyle = {
        padding: '12px 15px',
        borderRadius: '10px',
        border: '1px solid #e1e1e1',
        background: '#f8f9fa',
        fontSize: '14px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box'
    };

    const formButtonStyle = {
        background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '10px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '600'
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        }}>
            <header style={{
                background: 'rgba(255, 255, 255, 0.98)',
                padding: '20px 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '36px' }}>📚</span>
                    <span style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #1a1a2e, #e94560)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Biblioteca</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ color: '#333', fontWeight: '500' }}>👤 {usuario?.nombre}</span>
                    <button onClick={handleLogout} style={{
                        background: 'linear-gradient(135deg, #e94560, #0f3460)',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}>🚪 Cerrar Sesión</button>
                </div>
            </header>

            <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '16px',
                        padding: '25px 30px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        flex: 1
                    }}>
                        <div style={{ fontSize: '36px', fontWeight: '700', color: 'white' }}>{libros.length}</div>
                        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '5px' }}>📖 Libros Registrados</div>
                    </div>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '16px',
                        padding: '25px 30px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        flex: 1
                    }}>
                        <div style={{ fontSize: '36px', fontWeight: '700', color: 'white' }}>
                            {prestamos.filter(p => p.estado === 'activo').length}
                        </div>
                        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '5px' }}>📋 Préstamos Activos</div>
                    </div>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '16px',
                        padding: '25px 30px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        flex: 1
                    }}>
                        <div style={{ fontSize: '36px', fontWeight: '700', color: 'white' }}>
                            {libros.reduce((acc, l) => acc + l.disponible, 0)}
                        </div>
                        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '5px' }}>✅ Disponibles</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '35px' }}>
                    <button onClick={() => setVista('libros')} style={{
                        padding: '16px 32px',
                        borderRadius: '14px',
                        fontSize: '15px',
                        fontWeight: '600',
                        background: vista === 'libros' ? 'linear-gradient(135deg, #e94560, #0f3460)' : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: vista === 'libros' ? 'none' : '2px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>📖 Gestión de Libros</button>
                    <button onClick={() => setVista('prestamos')} style={{
                        padding: '16px 32px',
                        borderRadius: '14px',
                        fontSize: '15px',
                        fontWeight: '600',
                        background: vista === 'prestamos' ? 'linear-gradient(135deg, #e94560, #0f3460)' : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: vista === 'prestamos' ? 'none' : '2px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>📋 Gestión de Préstamos</button>
                </div>

                {vista === 'libros' && (
                    <div>
                        <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '600', marginBottom: '25px' }}>📖 Gestión de Libros</h2>
                        
                        {/* Formulario Agregar Libro */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.98)',
                            borderRadius: '20px',
                            padding: '30px',
                            marginBottom: '30px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                        }}>
                            <h3 style={{ color: '#1a1a2e', marginBottom: '20px', fontSize: '18px' }}>➕ Agregar Nuevo Libro</h3>
                            <form onSubmit={handleCrearLibro} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
                                <div><input placeholder="Título" value={nuevoLibro.titulo} onChange={e => setNuevoLibro({...nuevoLibro, titulo: e.target.value})} required style={inputStyle} /></div>
                                <div><input placeholder="Autor" value={nuevoLibro.autor} onChange={e => setNuevoLibro({...nuevoLibro, autor: e.target.value})} required style={inputStyle} /></div>
                                <div><input placeholder="ISBN" value={nuevoLibro.isbn} onChange={e => setNuevoLibro({...nuevoLibro, isbn: e.target.value})} style={inputStyle} /></div>
                                <div><input type="number" placeholder="Cantidad" value={nuevoLibro.cantidad} onChange={e => setNuevoLibro({...nuevoLibro, cantidad: e.target.value})} required min="1" style={inputStyle} /></div>
                                <button type="submit" style={formButtonStyle}>Guardar Libro</button>
                            </form>
                        </div>

                        <div style={{
                            background: 'rgba(255, 255, 255, 0.98)',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                        }}>
                            {libros.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{
                                                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                                                color: 'white',
                                                padding: '18px 20px',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase'
                                            }}>ID</th>
                                            <th style={{
                                                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                                                color: 'white',
                                                padding: '18px 20px',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase'
                                            }}>Título</th>
                                            <th style={{
                                                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                                                color: 'white',
                                                padding: '18px 20px',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase'
                                            }}>Autor</th>
                                            <th style={{
                                                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                                                color: 'white',
                                                padding: '18px 20px',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase'
                                            }}>ISBN</th>
                                            <th style={{
                                                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                                                color: 'white',
                                                padding: '18px 20px',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase'
                                            }}>Cantidad</th>
                                            <th style={{
                                                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                                                color: 'white',
                                                padding: '18px 20px',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase'
                                            }}>Disponibles</th>
                                            <th style={{
                                                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                                                color: 'white',
                                                padding: '18px 20px',
                                                textAlign: 'center',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase'
                                            }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {libros.map(libro => (
                                            <tr key={libro.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '18px 20px', color: '#333' }}>#{libro.id}</td>
                                                <td style={{ padding: '18px 20px', color: '#333', fontWeight: '600' }}>{libro.titulo}</td>
                                                <td style={{ padding: '18px 20px', color: '#333' }}>{libro.autor}</td>
                                                <td style={{ padding: '18px 20px', color: '#333' }}>{libro.isbn || '-'}</td>
                                                <td style={{ padding: '18px 20px', color: '#333' }}>{libro.cantidad}</td>
                                                <td style={{ padding: '18px 20px' }}>
                                                    <span style={{
                                                        padding: '6px 14px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        background: libro.disponible > 0 ? '#4caf50' : '#f44336',
                                                        color: 'white'
                                                    }}>{libro.disponible}</span>
                                                </td>
                                                <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                                                    <button 
                                                        onClick={() => handleEliminarLibro(libro.id)}
                                                        style={{
                                                            background: '#ff4757',
                                                            color: 'white',
                                                            border: 'none',
                                                            padding: '8px 12px',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
                                    <div style={{ fontSize: '60px', marginBottom: '20px' }}>📚</div>
                                    <p>No hay libros registrados</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {vista === 'prestamos' && (
                    <div>
                        <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '600', marginBottom: '25px' }}>📋 Gestión de Préstamos</h2>
                        
                        {/* Formulario Crear Préstamo */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.98)',
                            borderRadius: '20px',
                            padding: '30px',
                            marginBottom: '30px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                        }}>
                            <h3 style={{ color: '#1a1a2e', marginBottom: '20px', fontSize: '18px' }}>➕ Registrar Nuevo Préstamo</h3>
                            <form onSubmit={handleCrearPrestamo} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'end' }}>
                                <div>
                                    <label style={{display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666'}}>Libro</label>
                                    <select value={nuevoPrestamo.libro_id} onChange={e => setNuevoPrestamo({...nuevoPrestamo, libro_id: e.target.value})} required style={inputStyle}>
                                        <option value="">Seleccionar Libro</option>
                                        {libros.filter(l => l.disponible > 0).map(l => (
                                            <option key={l.id} value={l.id}>{l.titulo} (Disp: {l.disponible})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666'}}>Fecha Préstamo</label>
                                    <input type="date" value={nuevoPrestamo.fecha_prestamo} onChange={e => setNuevoPrestamo({...nuevoPrestamo, fecha_prestamo: e.target.value})} required style={inputStyle} />
                                </div>
                                <div>
                                    <label style={{display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666'}}>Fecha Devolución</label>
                                    <input type="date" value={nuevoPrestamo.fecha_devolucion} onChange={e => setNuevoPrestamo({...nuevoPrestamo, fecha_devolucion: e.target.value})} required style={inputStyle} />
                                </div>
                                <button type="submit" style={formButtonStyle}>Registrar Préstamo</button>
                            </form>
                        </div>

                        <div style={{
                            background: 'rgba(255, 255, 255, 0.98)',
                            borderRadius: '20px',
                            overflow: 'hidden',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                        }}>
                            {prestamos.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{
                                                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                                                color: 'white',
                                                padding: '18px 20px',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase'
                                            }}>ID</th>
                                            <th style={{
                                                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                                                color: 'white',
                                                padding: '18px 20px',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase'
                                            }}>Usuario</th>
                                            <th style={{
                                                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                                                color: 'white',
                                                padding: '18px 20px',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase'
                                            }}>Libro</th>
                                            <th style={{
                                                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                                                color: 'white',
                                                padding: '18px 20px',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase'
                                            }}>Fecha Préstamo</th>
                                            <th style={{
                                                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                                                color: 'white',
                                                padding: '18px 20px',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase'
                                            }}>Fecha Devolución</th>
                                            <th style={{
                                                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                                                color: 'white',
                                                padding: '18px 20px',
                                                textAlign: 'left',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                textTransform: 'uppercase'
                                            }}>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {prestamos.map(prestamo => (
                                            <tr key={prestamo.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '18px 20px', color: '#333' }}>#{prestamo.id}</td>
                                                <td style={{ padding: '18px 20px', color: '#333' }}>{prestamo.usuario_nombre}</td>
                                                <td style={{ padding: '18px 20px', color: '#333', fontWeight: '600' }}>{prestamo.libro_titulo}</td>
                                                <td style={{ padding: '18px 20px', color: '#333' }}>{prestamo.fecha_prestamo}</td>
                                                <td style={{ padding: '18px 20px', color: '#333' }}>{prestamo.fecha_devolucion}</td>
                                                <td style={{ padding: '18px 20px' }}>
                                                    <span style={{
                                                        padding: '6px 14px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase',
                                                        background: prestamo.estado === 'activo' ? '#4caf50' : prestamo.estado === 'devuelto' ? '#2196f3' : '#f44336',
                                                        color: 'white'
                                                    }}>{prestamo.estado}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
                                    <div style={{ fontSize: '60px', marginBottom: '20px' }}>📋</div>
                                    <p>No hay préstamos registrados</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
