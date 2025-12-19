import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase.js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./evaluador_informef.css"; // CSS con prefijo

export default function EvaluadorInformef() {
    const navigate = useNavigate();

    const [proyectosFinales, setProyectosFinales] = useState([]);
    const [proyectosFiltrados, setProyectosFiltrados] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [tipo, setTipo] = useState("todos");

    // ============================
    // VALIDAR SESIÓN
    // ============================
    useEffect(() => {
        const userId = localStorage.getItem("docenteId");
        const role = localStorage.getItem("role");
        const auth = localStorage.getItem("auth");

        if (!userId || role !== "evaluador" || auth !== "ok") {
            alert("Acceso denegado.");
            navigate("/");
        }
    }, []);

    // ============================
    // CARGAR PROYECTOS
    // ============================
    const cargarProyectosFinales = async () => {
        const { data, error } = await supabase
            .from("avances_proyecto")
            .select(`
        proyecto_id,
        informe_final_url,
        estado,
        proyectos (
          titulo,
          tipo,
          integrantes,
          estado,
          fecha_inicio,
          fecha_fin,
          created_at
        )
      `)
            .not("informe_final_url", "is", null);

        if (error) {
            console.error(error);
            setProyectosFinales([]);
            setProyectosFiltrados([]);
            return;
        }

        setProyectosFinales(data);
        setProyectosFiltrados(data);
    };

    useEffect(() => {
        cargarProyectosFinales();
    }, []);

    // ============================
    // FILTRAR
    // ============================
    useEffect(() => {
        let filtrados = proyectosFinales.filter((p) =>
            p.proyectos.titulo.toLowerCase().includes(busqueda.toLowerCase())
        );

        if (tipo !== "todos") {
            filtrados = filtrados.filter((p) => p.proyectos.tipo === tipo);
        }

        setProyectosFiltrados(filtrados);
    }, [busqueda, tipo, proyectosFinales]);

    // ============================
    // CERRAR SESIÓN
    // ============================
    const logout = () => {
        localStorage.clear();
        navigate("/");
    };

    // ============================
    // REDIRECCIONAR A PROYECTO
    // ============================
    const abrirProyecto = (p) => {
        let destino = "";

        switch (p.proyectos.tipo) {
            case "Investigación Aplicada":
                destino = "/evaluar_informef_IA";
                break;
            case "Innovación Tecnológica":
                destino = "/evaluar_informef_IT";
                break;
            case "Innovación Pedagógica-Institucional":
                destino = "/evaluar_informef_IPI";
                break;
            default:
                alert("Tipo de proyecto desconocido");
                return;
        }

        navigate(`${destino}?id=${p.proyecto_id}`);
    };

    // ============================
    // GENERAR PDF
    // ============================
    const generarPDF = (estado) => {
        const filtrados = proyectosFinales.filter(
            (p) => (p.estado || "").toLowerCase() === estado.toLowerCase()
        );

        if (filtrados.length === 0) {
            alert(`No hay informes finales ${estado}.`);
            return;
        }

        const pdf = new jsPDF();
        pdf.setFontSize(16);
        pdf.text(
            `Informes Finales ${estado.charAt(0).toUpperCase() + estado.slice(1)}`,
            10,
            15
        );

        const rows = filtrados.map((p, i) => [
            i + 1,
            p.proyectos.titulo,
            p.proyectos.tipo,
            p.proyectos.integrantes,
        ]);

        autoTable(pdf, {
            head: [["N°", "Título", "Tipo", "Integrantes"]],
            body: rows,
            startY: 25,
            styles: { fontSize: 10 },
            headStyles: {
                fillColor:
                    estado.toLowerCase() === "aprobado" ? [26, 64, 121] : [192, 57, 43],
                textColor: 255,
            },
        });

        pdf.save(`informes_finales_${estado}.pdf`);
    };

    return (
        <div className="evalif-body">
            {/* HEADER */}
            <header className="evalif-header">
                <button className="evalif-back-btn" onClick={() => window.location.href='/menu_evaluador'}>← Volver</button>
                <span className="evalif-title">Evaluación de Informes Finales</span>
                <button className="evalif-logout-btn" onClick={logout}>
                    Cerrar sesión
                </button>
            </header>

            <div className="evalif-container">
                <h2>Informes Finales Subidos</h2>

                {/* BOTONES PDF */}
                <div className="evalif-pdf-buttons">
                    <button
                        className="evalif-btn evalif-pdf success"
                        onClick={() => generarPDF("aprobado")}
                    >
                        Aprobados (PDF)
                    </button>
                    <button
                        className="evalif-btn evalif-pdf danger"
                        onClick={() => generarPDF("desaprobado")}
                    >
                        Desaprobados (PDF)
                    </button>
                </div>

                {/* BUSCADOR */}
                <div className="evalif-search-box">
                    <input
                        type="text"
                        placeholder="Buscar proyecto por nombre..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                {/* FILTROS */}
                <div className="evalif-filters">
                    {["todos", "Investigación Aplicada", "Innovación Tecnológica", "Innovación Pedagógica-Institucional"].map(
                        (t) => (
                            <span
                                key={t}
                                className={`evalif-filter-btn ${tipo === t ? "evalif-filter-active" : ""}`}
                                onClick={() => setTipo(t)}
                            >
                {t}
              </span>
                        )
                    )}
                </div>

                {/* LISTA DE PROYECTOS */}
                <div className="evalif-project-list">
                    {proyectosFiltrados.length === 0 ? (
                        <p className="evalif-no-projects">
                            No hay informes finales disponibles.
                        </p>
                    ) : (
                        proyectosFiltrados.map((p) => (
                            <div
                                key={p.proyecto_id}
                                className="evalif-project-item"
                                onClick={() => abrirProyecto(p)}
                            >
                                <strong>{p.proyectos.titulo}</strong>
                                <br />
                                <small>
                                    <b>Tipo:</b> {p.proyectos.tipo}
                                </small>
                                <br />
                                <small>
                                    <b>Integrantes:</b> {p.proyectos.integrantes}
                                </small>
                                <br />
                                <small>
                                    <b>Estado:</b> {p.estado}
                                </small>
                                <br />
                                <small>
                                    <i>
                                        Registrado:{" "}
                                        {new Date(p.proyectos.created_at).toLocaleDateString()}
                                    </i>
                                </small>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
