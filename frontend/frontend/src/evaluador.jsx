import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase.js";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import "./evaluador.css"; // Puedes separar los estilos si quieres

export default function EvaluarInformesFinales() {

    const navigate = useNavigate();

    const [proyectos, setProyectos] = useState([]);
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
    const cargarProyectos = async () => {
        const { data, error } = await supabase
            .from("proyectos")
            .select(`
                *,
                evaluaciones (
                    estado,
                    puntaje
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            return;
        }

        setProyectos(data);
        setProyectosFiltrados(data);
    };

    useEffect(() => {
        cargarProyectos();
    }, []);

    // ============================
    // FILTRAR
    // ============================
    useEffect(() => {
        let datos = proyectos.filter((p) =>
            p.titulo.toLowerCase().includes(busqueda.toLowerCase())
        );

        if (tipo !== "todos") {
            datos = datos.filter((p) => p.tipo === tipo);
        }

        setProyectosFiltrados(datos);
    }, [busqueda, tipo, proyectos]);

    // ============================
    // CERRAR SESIÓN
    // ============================
    const logout = () => {
        localStorage.clear();
        navigate("/");
    };

    // ============================
    // GENERAR PDF
    // ============================
    const generarPDF = (estado) => {
        const filtrados = proyectos.filter(
            (p) =>
                p.evaluaciones?.[0]?.estado?.toLowerCase() === estado.toLowerCase()
        );

        if (filtrados.length === 0) {
            alert(`No hay proyectos ${estado}.`);
            return;
        }

        const pdf = new jsPDF();
        pdf.setFontSize(16);
        pdf.text(
            `Proyectos ${estado.charAt(0).toUpperCase() + estado.slice(1)}`,
            10,
            15
        );

        const rows = filtrados.map((p, i) => [
            i + 1,
            p.titulo,
            p.tipo,
            p.integrantes,
        ]);

        autoTable(pdf, {
            head: [["N°", "Título", "Tipo", "Integrantes"]],
            body: rows,
            startY: 25,
        });

        pdf.save(`proyectos_${estado}.pdf`);
    };

    // ============================
    // REDIRECCIONAR A LA EVALUACIÓN
    // ============================
    const abrirProyecto = (p) => {
        let destino = "";

        switch (p.tipo) {
            case "Investigación Aplicada":
                destino = "/evaluarp_investigacionA";
                break;
            case "Innovación Tecnológica":
                destino = "/evaluarp_innovacionT";
                break;
            case "Innovación Pedagógica-Institucional":
                destino = "/evaluarp_innovacionP";
                break;
            default:
                alert("Tipo de proyecto desconocido");
                return;
        }

        navigate(`${destino}?id=${p.id}`);
    };

    return (
        <div>
            {/* HEADER */}
            <header className="header">
                <button className="back-btn" onClick={() => window.location.href='/menu_evaluador'}>← Volver</button>
                <span className="title">Evaluación de Informes Finales</span>
                <button className="logout-btn" onClick={logout}>Cerrar sesión</button>
            </header>

            {/* CONTENIDO */}
            <div className="container">

                <div className="pdf-buttons">
                    <button className="btn pdf success" onClick={() => generarPDF("aprobado")}>
                        Aprobados (PDF)
                    </button>
                    <button className="btn pdf danger" onClick={() => generarPDF("desaprobado")}>
                        Desaprobados (PDF)
                    </button>
                </div>

                {/* BUSCADOR */}
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Buscar proyecto por nombre..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                {/* FILTROS */}
                <div className="filters">
                    <span
                        className={`filter-btn ${tipo === "todos" ? "filter-active" : ""}`}
                        onClick={() => setTipo("todos")}
                    >
                        Todos
                    </span>

                    <span
                        className={`filter-btn ${tipo === "Investigación Aplicada" ? "filter-active" : ""}`}
                        onClick={() => setTipo("Investigación Aplicada")}
                    >
                        Investigación Aplicada
                    </span>

                    <span
                        className={`filter-btn ${tipo === "Innovación Tecnológica" ? "filter-active" : ""}`}
                        onClick={() => setTipo("Innovación Tecnológica")}
                    >
                        Innovación Tecnológica
                    </span>

                    <span
                        className={`filter-btn ${tipo === "Innovación Pedagógica-Institucional" ? "filter-active" : ""}`}
                        onClick={() => setTipo("Innovación Pedagógica-Institucional")}
                    >
                        Innovación Pedagógica-Institucional
                    </span>
                </div>

                {/* LISTA */}
                <div className="project-list">
                    {proyectosFiltrados.length === 0 ? (
                        <p className="no-projects">No se encontraron proyectos.</p>
                    ) : (
                        proyectosFiltrados.map((p) => (
                            <div
                                key={p.id}
                                className="project-item"
                                onClick={() => abrirProyecto(p)}
                            >
                                <strong>{p.titulo}</strong><br />
                                <small><b>Tipo:</b> {p.tipo}</small><br />
                                <small><b>Integrantes:</b> {p.integrantes}</small><br />
                                <small><b>Estado:</b> {p.evaluaciones?.[0]?.estado || "Pendiente"}</small><br />
                                <small><b>Inicio:</b> {p.fecha_inicio}</small><br />
                                <small><b>Fin:</b> {p.fecha_fin}</small><br />
                                <small><i>Registrado: {new Date(p.created_at).toLocaleDateString()}</i></small>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
