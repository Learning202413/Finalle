import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./docente.css";

const SUPABASE_URL = "https://bxjqdsnekmbldvfnjvpg.supabase.co";
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4anFkc25la21ibGR2Zm5qdnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NjUyODUsImV4cCI6MjA3NDQ0MTI4NX0.ibjF_Icj3C81g5fRO6yuOhCxCyCzN7M_SCSjvUXSPwc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function Docente() {
    const [proyectos, setProyectos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Validación de sesión
        const docenteId = localStorage.getItem("docenteId");
        const email = localStorage.getItem("userEmail");
        const role = localStorage.getItem("role");
        const auth = localStorage.getItem("auth");

        if (!docenteId || !email || !role || auth !== "ok") {
            alert("Debe iniciar sesión.");
            window.location.href = "/index";
            return;
        }

        if (role.toLowerCase() !== "docente") {
            alert("Acceso denegado. Solo docentes.");
            window.location.href = "/index";
            return;
        }

        // Cargar proyectos
        async function cargarProyectos() {
            try {
                const { data, error } = await supabase
                    .from("proyectos")
                    .select("*")
                    .eq("docente_id", docenteId)
                    .order("created_at", { ascending: false });

                if (error) throw error;

                setProyectos(data || []);
            } catch (err) {
                console.error(err);
                setProyectos([]);
            } finally {
                setLoading(false);
            }
        }

        cargarProyectos();
    }, []);

    const logout = () => {
        localStorage.clear();
        window.location.href = "/index";
    };

    return (
        <div className="docente-page">
            <header>Panel del Docente</header>

            <button className="logout-btn" onClick={() => window.location.href='/'}>← Cerrar Sesión</button>

            <div className="container">
                <h2>Mis Proyectos Subidos</h2>
                <div className="project-list">
                    {loading && <p className="no-projects">Cargando proyectos...</p>}
                    {!loading && proyectos.length === 0 && (
                        <p className="no-projects">No has subido ningún proyecto aún.</p>
                    )}
                    {!loading &&
                        proyectos.map((p) => (
                            <div
                                key={p.id}
                                className="project-item"
                                onClick={() => (window.location.href = `/puntajep?id=${p.id}`)}
                            >
                                <strong>{p.titulo}</strong>
                                <br />
                                <small>
                                    <b>Estado:</b> {p.estado}
                                </small>
                                <br />
                                <small>
                                    <b>Inicio:</b> {p.fecha_inicio}
                                </small>
                                <br />
                                <small>
                                    <b>Fin:</b> {p.fecha_fin ? p.fecha_fin : "aún no asignada"}
                                </small>
                                <br />
                                <small>
                                    <i>Registrado: {new Date(p.created_at).toLocaleDateString()}</i>
                                </small>
                            </div>
                        ))}
                </div>
            </div>

            <button
                className="btn-add"
                onClick={() => (window.location.href = "/formulariop")}
            >
                ➕ Subir nuevo proyecto
            </button>
        </div>
    );
}
