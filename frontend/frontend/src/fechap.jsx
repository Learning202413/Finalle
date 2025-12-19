import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
//import jsPDF from "jspdf";
//import "jspdf-autotable";
import "./fechap.css";

const SUPABASE_URL = "https://bxjqdsnekmbldvfnjvpg.supabase.co";
const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4anFkc25la21ibGR2Zm5qdnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NjUyODUsImV4cCI6MjA3NDQ0MTI4NX0.ibjF_Icj3C81g5fRO6yuOhCxCyCzN7M_SCSjvUXSPwc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function Fechap() {
    const [proyectos, setProyectos] = useState([]);
    const [tipoSeleccionado, setTipoSeleccionado] = useState("todos");
    const [busqueda, setBusqueda] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);
    const [fechaFin, setFechaFin] = useState("");

    useEffect(() => {
        const userId = localStorage.getItem("docenteId");
        const role = localStorage.getItem("role");
        const auth = localStorage.getItem("auth");

        if (!userId || role !== "admin" || auth !== "ok") {
            alert("Acceso denegado.");
            window.location.href = "index.html";
        } else {
            cargarProyectos();
        }
    }, []);

    const cargarProyectos = async () => {
        const { data: evals, error: evalError } = await supabase
            .from("evaluaciones")
            .select("proyecto_id")
            .eq("estado", "aprobado");

        if (evalError) {
            console.error(evalError);
            setProyectos([]);
            return;
        }

        if (evals.length === 0) {
            setProyectos([]);
            return;
        }

        const idsAprobados = evals.map((e) => e.proyecto_id);

        const { data: proyectosData, error } = await supabase
            .from("proyectos")
            .select("*")
            .in("id", idsAprobados)
            .order("created_at", { ascending: false });

        if (error) {
            console.error(error);
            setProyectos([]);
            return;
        }

        setProyectos(proyectosData);
    };

    const filtrarProyectos = () => {
        return proyectos.filter(
            (p) =>
                p.titulo.toLowerCase().includes(busqueda.toLowerCase()) &&
                (tipoSeleccionado === "todos" || p.tipo === tipoSeleccionado)
        );
    };

    const abrirModal = (proyecto) => {
        setProyectoSeleccionado(proyecto);
        setFechaFin(proyecto.fecha_fin || "");
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
        setProyectoSeleccionado(null);
        setFechaFin("");
    };

    const guardarFecha = async () => {
        if (!fechaFin) {
            alert("Seleccione una fecha.");
            return;
        }

        const { error } = await supabase
            .from("proyectos")
            .update({ fecha_fin: fechaFin })
            .eq("id", proyectoSeleccionado.id);

        if (error) {
            alert("Error al guardar la fecha.");
            console.error(error);
            return;
        }

        alert("Fecha actualizada correctamente.");
        cerrarModal();
        cargarProyectos();
    };

    const generarPDF = async () => {
        try {
            // Usamos el estado seleccionado en el filtro (ej. "todos", "Innovación...", etc.)
            // Ojo: asegúrate que 'tipoSeleccionado' tenga un valor válido que coincida con tu BD
            // Si quieres filtrar por estado "aprobado", puedes forzarlo o enviar el parámetro que desees.

            // Aquí enviamos el filtro actual de la pantalla
            const filtro = tipoSeleccionado === "todos" ? "" : tipoSeleccionado;

            // Llamada al Microservicio
            const response = await fetch(
                            `https://microservicio-reportes.onrender.com/api/reportes/proyectos/pdf?estado=${encodeURIComponent(filtro)}`
                        );

            if (!response.ok) {
                const msg = await response.json();
                alert("Atención: " + (msg.message || "Error al generar reporte"));
                return;
            }

            // Descargar el archivo que nos devuelve el backend
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `reporte_proyectos_${tipoSeleccionado}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Error conectando con microservicio:", error);
            alert("Error: No se pudo conectar con el Microservicio de Reportes (¿Está encendido en puerto 3001?)");
        }
    };

    const cerrarSesion = () => {
        localStorage.clear();
        window.location.href = "/"; 
    };;

    return (
        <div className="fechap-root">
            <header>
                <button className="btn-back" onClick={() => (window.location.href = "/admin")}>
                    ← Volver
                </button>
                <span className="title">Panel del Evaluador</span>
                <button className="logout-btn" onClick={cerrarSesion}>
                    Cerrar sesión
                </button>
            </header>

            <div className="container">
                <h2 style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    Todos los Proyectos Registrados
                    <button className="btn-pdf" onClick={generarPDF}>
                        Información de Proyectos (PDF)
                    </button>
                </h2>

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Buscar proyecto por nombre..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>

                <div className="filters">
                    {["todos", "Investigación Aplicada", "Innovación Tecnológica", "Innovación Pedagógica-Institucional"].map((tipo) => (
                        <span
                            key={tipo}
                            className={`filter-btn ${tipoSeleccionado === tipo ? "filter-active" : ""}`}
                            onClick={() => setTipoSeleccionado(tipo)}
                        >
              {tipo === "todos" ? "Todos" : tipo}
            </span>
                    ))}
                </div>

                <div className="project-list">
                    {filtrarProyectos().length === 0 ? (
                        <p className="no-projects">No se encontraron proyectos.</p>
                    ) : (
                        filtrarProyectos().map((p) => (
                            <div key={p.id} className="project-item" onClick={() => abrirModal(p)}>
                                <strong>{p.titulo}</strong>
                                <br />
                                <small>
                                    <b>Tipo:</b> {p.tipo}
                                </small>
                                <br />
                                <small>
                                    <b>Integrantes:</b> {p.integrantes}
                                </small>
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
                                    <b>Fin:</b> {p.fecha_fin}
                                </small>
                                <br />
                                <small>
                                    <i>Registrado: {new Date(p.created_at).toLocaleDateString()}</i>
                                </small>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {modalVisible && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Asignar Fecha Final</h3>
                        <p>{proyectoSeleccionado.titulo}</p>
                        <label>Fecha Final:</label>
                        <br />
                        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                        <div style={{ marginTop: 20 }}>
                            <button onClick={guardarFecha}>Guardar</button>
                            <button onClick={cerrarModal} style={{ background: "#aaa" }}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
