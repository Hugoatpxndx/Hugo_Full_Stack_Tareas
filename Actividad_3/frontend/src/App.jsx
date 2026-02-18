import { useState, useEffect } from "react";
import "./App.css";

const API = "http://localhost:3000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  
  const logout = () => {
    localStorage.clear();
    setToken(null);
  };

  return (
    <div className="app-container">
      <header>
        <div>
          <h1>🚑 MediTrack <span className="brand-highlight">Pro</span></h1>
          <small className="subtitle">Sistema de Gestión Hospitalaria</small>
        </div>
        {token && <button onClick={logout} className="btn-logout">Cerrar Sesión</button>}
      </header>
      {!token ? <Login setToken={setToken} /> : <Dashboard token={token} />}
    </div>
  );
}

function Login({ setToken }) {
  const [form, setForm] = useState({ username: "", password: "" });
  
  const handleSubmit = async (e, endpoint) => {
    e.preventDefault();
    
    // Validación: Evitar campos vacíos
    if (!form.username.trim() || !form.password.trim()) {
      alert("Por favor, ingresa usuario y contraseña.");
      return;
    }

    const res = await fetch(`${API}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
    } else if (res.ok) {
      alert("Registro exitoso. Ahora inicia sesión.");
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="card login-card">
      <h2>Portal de Acceso</h2>
      <p className="login-subtitle">Solo personal autorizado</p>
      <input placeholder="Usuario" onChange={(e) => setForm({...form, username: e.target.value})} />
      <input type="password" placeholder="Contraseña" onChange={(e) => setForm({...form, password: e.target.value})} />
      <div className="btn-group">
        <button onClick={(e) => handleSubmit(e, "/login")}>Iniciar Sesión</button>
        <button onClick={(e) => handleSubmit(e, "/register")} className="btn-secondary">Registrarse</button>
      </div>
    </div>
  );
}

function Dashboard({ token }) {
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState({ nombre: "", sintomas: "", prioridad: "Media" });

  useEffect(() => {
    loadPacientes();
  }, []);

  const loadPacientes = async () => {
    const res = await fetch(`${API}/api/pacientes`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setPacientes(await res.json());
  };

  const addPaciente = async (e) => {
    e.preventDefault();
    await fetch(`${API}/api/pacientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    loadPacientes();
    setForm({ nombre: "", sintomas: "", prioridad: "Media" });
  };

  const deletePaciente = async (id) => {
    if(!confirm("¿Dar de alta al paciente?")) return;
    await fetch(`${API}/api/pacientes/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    loadPacientes();
  };

  return (
    <div className="dashboard">
      <div className="controls card">
        <h3>📋 Registro de Admisión</h3>
        <form onSubmit={addPaciente}>
          <div className="form-grid">
            <input value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Nombre del Paciente" required />
            <input value={form.sintomas} onChange={e => setForm({...form, sintomas: e.target.value})} placeholder="Cuadro Clínico / Síntomas" required />
            <select value={form.prioridad} onChange={e => setForm({...form, prioridad: e.target.value})}>
              <option value="Alta">🔴 Urgencia (Alta)</option>
              <option value="Media">🟠 Urgencia Menor (Media)</option>
              <option value="Baja">🟢 No Urgente (Baja)</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Registrar Ingreso</button>
        </form>
      </div>

      <div className="list">
        {pacientes.map(p => (
          <div key={p.id} className={`card priority-${p.prioridad}`}>
            <div className="card-header">
                <h3>{p.nombre}</h3>
                <span className={`badge badge-${p.prioridad}`}>Triaje: {p.prioridad}</span>
            </div>
            <p className="patient-detail"><b>Diagnóstico:</b> {p.sintomas}</p>
            <p className="patient-detail"><b>Hora Ingreso:</b> {new Date(p.ingreso).toLocaleString()}</p>
            <button onClick={() => deletePaciente(p.id)} className="btn-delete">Dar de Alta Médica</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;