import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./menu_evaluador.css";

import { supabase } from "./supabase.js";


export default function PanelEvaluador() {
    const navigate = useNavigate();

    const [tecno, setTecno] = useState(0);
    const [pedago, setPedago] = useState(0);
    const [invest, setInvest] = useState(0);

    const logout = () => {
        localStorage.clear();
        navigate("/");
    };

    const cargarTiposProyecto = async () => {
        const tipos = [
            { estado: setTecno, valor: "Innovación Tecnológica" },
            { estado: setPedago, valor: "Innovación Pedagógica-Institucional" },
            { estado: setInvest, valor: "Investigación Aplicada" },
        ];

        for (const t of tipos) {
            const { count } = await supabase
                .from("proyectos")
                .select("*", { count: "exact" })
                .eq("tipo", t.valor);

            t.estado(count ?? 0);
        }
    };

    useEffect(() => {
        cargarTiposProyecto();
    }, []);

    return (
        <div>
            <header className="header">
                Panel del Evaluador
                <button className="logout-btn" onClick={logout}>
                    Cerrar sesión
                </button>
            </header>

            <div className="container">
                {/* ==== TIPOS DE PROYECTO ==== */}
                <div className="summary-section">
                    <h2 className="summary-title">Tipos de Proyecto Registrados</h2>
                    <p className="summary-subtitle">
                        Cantidad de proyectos según su categoría
                    </p>

                    <div className="stats-enhanced-grid">
                        <div className="stat-enhanced-card">
                            <div className="stat-number">{tecno}</div>
                            <div className="stat-label">Innovación Tecnológica</div>
                        </div>

                        <div className="stat-enhanced-card">
                            <div className="stat-number">{pedago}</div>
                            <div className="stat-label">
                                Innovación Pedagógica-Institucional
                            </div>
                        </div>

                        <div className="stat-enhanced-card">
                            <div className="stat-number">{invest}</div>
                            <div className="stat-label">Investigación Aplicada</div>
                        </div>
                    </div>
                </div>

                {/* ==== OPCIONES ==== */}
                <div className="options-grid">
                    <div className="option-card" onClick={() => navigate("/evaluador")}>
                        <div className="icon">📄</div>
                        <h3>Evaluar Proyecto</h3>
                    </div>

                    <div
                        className="option-card"
                        onClick={() => navigate("/evaluador_informef")}
                    >
                        <div className="icon">📘</div>
                        <h3>Informe Final</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}
