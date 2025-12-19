import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase.js"; // Asegúrate de tener tu cliente Supabase

import "./admin.css";

export default function AdminPanel() {
    const navigate = useNavigate();

    const [aprobados, setAprobados] = useState(0);
    const [desaprobados, setDesaprobados] = useState(0);

    // ============================
    // VALIDAR SESIÓN
    // ============================
    useEffect(() => {
        const userId = localStorage.getItem("docenteId");
        const role = localStorage.getItem("role");
        const auth = localStorage.getItem("auth");

        if (!userId || role !== "admin" || auth !== "ok") {
            alert("Acceso denegado.");
            navigate("/");
        }
    }, []);

    // ============================
    // CERRAR SESIÓN
    // ============================
    const logout = () => {
        localStorage.clear();
        navigate("/");
    };

    // ============================
    // CARGAR CONTADORES
    // ============================
    const cargarContadores = async () => {
        const { count: countAprobados } = await supabase
            .from("evaluaciones")
            .select("*", { count: "exact" })
            .eq("estado", "aprobado");

        const { count: countDesaprobados } = await supabase
            .from("evaluaciones")
            .select("*", { count: "exact" })
            .eq("estado", "desaprobado");

        setAprobados(countAprobados ?? 0);
        setDesaprobados(countDesaprobados ?? 0);
    };

    useEffect(() => {
        cargarContadores();
    }, []);

    return (
        <div>
            {/* HEADER */}
            <header className="header">
                Panel de Gestión
                <button className="logout-btn" onClick={logout}>Cerrar sesión</button>
            </header>

            <div className="container">

                {/* RESUMEN */}
                <div className="summary-section">
                    <h2 className="summary-title">📊 Estado de Evaluaciones</h2>
                    <p className="summary-subtitle">Revisión general del avance de los proyectos</p>

                    <div className="stats-enhanced-grid">
                        <div className="stat-enhanced-card">
                            <div className="stat-number">{aprobados}</div>
                            <div className="stat-label">Aprobados</div>
                        </div>

                        <div className="stat-enhanced-card">
                            <div className="stat-number">{desaprobados}</div>
                            <div className="stat-label">Desaprobados</div>
                        </div>
                    </div>
                </div>

                {/* OPCIONES */}
                <div className="options-grid">
                    <div className="option-card" onClick={() => navigate("/usuarios")}>
                        <div className="icon">👥</div>
                        <h3>Usuarios</h3>
                    </div>

                    <div className="option-card" onClick={() => navigate("/fechap")}>
                        <div className="icon">📅</div>
                        <h3>Fecha de Proyectos</h3>
                    </div>
                </div>

            </div>
        </div>
    );
}
