import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./usuarios.css";

const SUPABASE_URL = "https://bxjqdsnekmbldvfnjvpg.supabase.co";
const SUPABASE_ANON =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4anFkc25la21ibGR2Zm5qdnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NjUyODUsImV4cCI6MjA3NDQ0MTI4NX0.ibjF_Icj3C81g5fRO6yuOhCxCyCzN7M_SCSjvUXSPwc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export default function Usuarios() {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        displayName: "",
        rol: "",
        email: "",
        password: "",
        autoPass: false,
    });

    const [perfiles, setPerfiles] = useState([]);
    const [msg, setMsg] = useState({ text: "", type: "" });
    const [tablaVisible, setTablaVisible] = useState(false);

    useEffect(() => {
        cargarPerfiles();
    }, []);

    const pseudoEncrypt = (txt) => btoa(txt.split("").reverse().join(""));
    const pseudoDecrypt = (txt) => {
        try {
            return atob(txt).split("").reverse().join("");
        } catch {
            return "(ilegible)";
        }
    };
    const ocultar = (pwd) => pwd.slice(0, 2) + "***";

    const showMessage = (text, type) => {
        setMsg({ text, type });
        setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    };

    const generarPassword = () => {
        const chars =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@$%&*?";
        let pwd = "";
        for (let i = 0; i < 10; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pwd;
    };

    const generarCorreo = (nombre, apellido, rol) => {
        if (!nombre || !apellido || !rol) return "";
        const dominio = "@institutocajas.edu.pe";
        const apellidoPrimer = apellido.split(" ")[0];
        return nombre.charAt(0).toLowerCase() + apellidoPrimer.toLowerCase() + dominio;
    };

    const generarDisplayName = (nombre, apellido) => {
        if (!nombre || !apellido) return "";
        return `${nombre} ${apellido}`;
    };

    const logout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    const handleChange = (e) => {
        const { id, value, type, checked } = e.target;
        setFormData((prev) => {
            const newData = { ...prev, [id]: type === "checkbox" ? checked : value };
            if (id === "nombre" || id === "apellido" || id === "rol") {
                newData.displayName = generarDisplayName(newData.nombre, newData.apellido);
                newData.email = generarCorreo(newData.nombre, newData.apellido, newData.rol);
            }
            if (id === "autoPass") {
                newData.password = checked ? generarPassword() : "";
            }
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { nombre, apellido, displayName, rol, email, password } = formData;
        const passwordEnc = pseudoEncrypt(password);

        try {
            const { error } = await supabase.from("perfil").insert([
                {
                    nombre: displayName,
                    email,
                    role: rol,
                    password: passwordEnc,
                },
            ]);
            if (error) throw error;
            showMessage("Perfil registrado correctamente", "success");
            setFormData({
                nombre: "",
                apellido: "",
                displayName: "",
                rol: "",
                email: "",
                password: "",
                autoPass: false,
            });
            cargarPerfiles();
        } catch (err) {
            console.error(err);
            showMessage("Error al registrar", "error");
        }
    };

    const cargarPerfiles = async () => {
        try {
            const { data, error } = await supabase
                .from("perfil")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            setPerfiles(data || []);
        } catch (err) {
            console.error(err);
            showMessage("Error al cargar perfiles", "error");
        }
    };

    const eliminarPerfil = async (id) => {
        if (!window.confirm("¿Eliminar este perfil?")) return;
        try {
            const { error } = await supabase.from("perfil").delete().eq("id", id);
            if (error) throw error;
            showMessage("Perfil eliminado", "success");
            cargarPerfiles();
        } catch (err) {
            console.error(err);
            showMessage("Error al eliminar", "error");
        }
    };

    return (
        <div className="usuarios-root">
            <header className="topbar">
                <button className="btn-back" onClick={() => (window.location.href = "/admin")}>
                    ← Volver
                </button>
                <div>Gestión de Perfiles</div>
                <button className="btn-logout" onClick={logout}>
                    Cerrar sesión
                </button>
            </header>

            <main>
                <h2>Crear Usuario</h2>

                <form id="formPerfil" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        id="nombre"
                        placeholder="Nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        id="apellido"
                        placeholder="Apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        id="displayName"
                        placeholder="Nombre para mostrar"
                        value={formData.displayName}
                        onChange={handleChange}
                        required
                    />

                    <select id="rol" value={formData.rol} onChange={handleChange} required>
                        <option value="">Seleccionar rol</option>
                        <option value="docente">Docente</option>
                        <option value="evaluador">Evaluador</option>
                        <option value="admin">Administrador</option>
                    </select>

                    <input
                        type="email"
                        id="email"
                        placeholder="Correo electrónico"
                        value={formData.email}
                        readOnly
                        required
                    />

                    <div className="password-auto">
                        <input
                            type="text"
                            id="password"
                            placeholder="Contraseña"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={formData.autoPass}
                        />
                        <label>
                            <input type="checkbox" id="autoPass" checked={formData.autoPass} onChange={handleChange} />
                            Auto
                        </label>
                    </div>

                    <button type="submit">Registrar Perfil</button>
                </form>

                {msg.text && <div className={`msg ${msg.type}`}>{msg.text}</div>}

                <button
                    className="btn-show"
                    onClick={() => setTablaVisible((prev) => !prev)}
                >
                    {tablaVisible ? "Ocultar registros" : "Mostrar registros"}
                </button>

                {tablaVisible && (
                    <table>
                        <thead>
                        <tr>
                            <th>Nombre completo</th>
                            <th>Correo</th>
                            <th>Rol</th>
                            <th>Contraseña</th>
                            <th>Acciones</th>
                        </tr>
                        </thead>
                        <tbody>
                        {perfiles.map((p) => (
                            <tr key={p.id}>
                                <td>{p.nombre}</td>
                                <td>{p.email}</td>
                                <td>{p.role}</td>
                                <td>{ocultar(pseudoDecrypt(p.password))}</td>
                                <td>
                                    <button
                                        className="btn-delete"
                                        onClick={() => eliminarPerfil(p.id)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </main>
        </div>
    );
}
