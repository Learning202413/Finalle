import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./puntajep.css";

const SUPABASE_URL = "https://bxjqdsnekmbldvfnjvpg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4anFkc25la21ibGR2Zm5qdnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NjUyODUsImV4cCI6MjA3NDQ0MTI4NX0.ibjF_Icj3C81g5fRO6yuOhCxCyCzN7M_SCSjvUXSPwc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function PuntajeProyecto() {
    const [proyecto, setProyecto] = useState(null);
    const [evaluacion, setEvaluacion] = useState(null);
    const [criterios, setCriterios] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [pdfFile, setPdfFile] = useState(null);

    const urlParams = new URLSearchParams(window.location.search);
    const idProyecto = urlParams.get("id");

    useEffect(() => {
        if (!idProyecto) {
            alert("Proyecto no especificado.");
            return;
        }
        cargarDatos();
    }, [idProyecto]);

    // --- CARGAR DATOS DEL PROYECTO ---
    async function cargarDatos() {
        try {
            const { data, error } = await supabase
                .from("proyectos")
                .select("*")
                .eq("id", idProyecto)
                .single();

            if (error) throw error;
            setProyecto(data);
            await cargarEvaluacion();
        } catch (err) {
            console.error("Error cargarDatos:", err);
        }
    }

    // --- CARGAR EVALUACIÓN Y PDF ---
    async function cargarEvaluacion() {
        try {
            const { data, error } = await supabase
                .from("evaluaciones")
                .select("*")
                .eq("proyecto_id", idProyecto)
                .limit(1);

            if (error) throw error;
            if (!data || data.length === 0) {
                setEvaluacion({ puntaje: "No asignado", estado: "Pendiente", url_pdf: null });
                return;
            }
            setEvaluacion(data[0]);
        } catch (err) {
            console.error("Error cargarEvaluacion:", err);
        }
    }

    // --- SUBIR PDF ---
    async function subirPDF() {
        if (!pdfFile) return alert("Seleccione un PDF primero.");

        try {
            // 1. Verificar si existe evaluacion previa
            const { data: evalExistente, error: errorEval } = await supabase
                .from("evaluaciones")
                .select("*")
                .eq("proyecto_id", idProyecto)
                .single();

            if (errorEval && errorEval.code !== "PGRST116") throw errorEval;

            // 2. Eliminar PDF antiguo si existe
            if (evalExistente?.url_pdf) {
                const oldFile = evalExistente.url_pdf.split("/").pop();
                await supabase.storage.from("proyectos-pdfs").remove([oldFile]);
            }

            // 3. Subir PDF nuevo
            const fileName = `${idProyecto}-${Date.now()}.pdf`;
            const { error: uploadError } = await supabase.storage
                .from("proyectos-pdfs")
                .upload(fileName, pdfFile);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage.from("proyectos-pdfs").getPublicUrl(fileName);
            const nuevaURL = urlData.publicUrl;

            // 4. Insertar o actualizar evaluación
            if (!evalExistente) {
                const { error } = await supabase.from("evaluaciones").insert([
                    {
                        proyecto_id: idProyecto,
                        url_pdf: nuevaURL,
                        puntaje: null,
                        estado: "pendiente",
                    },
                ]);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("evaluaciones")
                    .update({ url_pdf: nuevaURL, puntaje: null, estado: "pendiente" })
                    .eq("id", evalExistente.id);
                if (error) throw error;
            }

            alert("PDF subido correctamente ✔");
            setPdfFile(null);
            cargarEvaluacion();
        } catch (err) {
            console.error("Error subiendo PDF:", err);
            alert("Error guardando PDF: " + (err.message || err));
        }
    }

    // --- ABRIR MODAL DE REVISIÓN ---
    async function abrirModalRevision() {
        try {
            if (!proyecto) return;

            const { data: evalData } = await supabase
                .from("evaluaciones")
                .select("*")
                .eq("proyecto_id", idProyecto)
                .single();

            setEvaluacion(evalData);

            // Seleccionar tabla de criterios según tipo
            let tablaCriterios = "";
            if (proyecto.tipo === "Investigación Aplicada") tablaCriterios = "evaluacion_investigacion_aplicada";
            if (proyecto.tipo === "Innovación Tecnológica") tablaCriterios = "evaluacion_innovacion_tecnologica";
            if (proyecto.tipo === "Innovación Pedagógica-Institucional") tablaCriterios = "evaluacion_innovacion_pedagógica_institucional";

            if (!tablaCriterios) {
                setCriterios([]);
                setModalOpen(true);
                return;
            }

            const { data: criteriosData } = await supabase
                .from(tablaCriterios)
                .select("*")
                .eq("evaluacion_id", evalData.id)
                .order("numero_criterio", { ascending: true });

            setCriterios(criteriosData || []);
            setModalOpen(true);
        } catch (err) {
            console.error("Error abrirModalRevision:", err);
            alert("Error al cargar información de revisión.");
        }
    }

    // --- GENERAR PDF ---
    function generarPDF() {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        if (!proyecto || !evaluacion) return;

        // Header
        doc.setFontSize(18);
        doc.text("INFORME DE REVISIÓN DEL PROYECTO", 14, 18);

        const maxWidth = 180;
        let yPos = 30;

        const tituloLineas = doc.splitTextToSize(`Título: ${proyecto.titulo}`, maxWidth);
        doc.text(tituloLineas, 14, yPos);
        yPos += tituloLineas.length * 6;

        const integrantesLineas = doc.splitTextToSize(`Integrantes: ${proyecto.integrantes}`, maxWidth);
        doc.text(integrantesLineas, 14, yPos);
        yPos += integrantesLineas.length * 6 + 6;

        // Evaluación resumen
        const resumenLineas = doc.splitTextToSize(`Puntaje: ${evaluacion.puntaje ?? "Sin asignar"}\nEstado: ${evaluacion.estado ?? "pendiente"}`, maxWidth);
        doc.text(resumenLineas, 14, yPos);
        yPos += resumenLineas.length * 6 + 6;

        // Tabla
        const rows = criterios.map(c => [c.numero_criterio, c.parametro, c.respuesta, c.puntaje]);
        doc.autoTable({
            head: [["N°", "Parámetro", "Respuesta", "Puntaje"]],
            body: rows,
            startY: yPos,
            styles: { fontSize: 9, cellPadding: 2, overflow: "linebreak" },
            columnStyles: { 1: { cellWidth: 70 }, 2: { cellWidth: 40 } },
            headStyles: { fillColor: [26, 64, 121] },
        });

        const nombrePDF = `Informe_revision_${proyecto.titulo.replace(/\s+/g, "_")}.pdf`;
        doc.save(nombrePDF);
    }

    if (!proyecto) return <p>Cargando proyecto...</p>;

    return (
        <div className={`puntaje-container ${modalOpen ? "modal-open" : ""}`}>
            <a href="/docente" className="volver-btn">← Volver</a>

            <main>
                <div className="header-row">
                    <h2>Puntaje del Proyecto</h2>
                    <div className="top-actions">
                        <button onClick={abrirModalRevision}>Información de Revisión</button>
                    </div>
                </div>

                <div className="info-box small">
                    <p><strong>Proyecto:</strong> {proyecto.titulo ?? "—"}</p>
                    <p><strong>Integrantes:</strong> {proyecto.integrantes ?? "—"}</p>
                </div>

                <h3>Puntaje del Proyecto</h3>
                <div className="info-box small">
                    <p><strong>Puntaje:</strong> {evaluacion?.puntaje ?? "No asignado"}</p>
                    <p><strong>Estado:</strong> {evaluacion?.estado ?? "Pendiente"}</p>
                </div>

                {evaluacion?.estado?.toLowerCase() === "aprobado" && (
                    <div id="btnAvancesContainer">
                        <a href={`avances_e_informef.html?id=${idProyecto}`} className="btn-avances">Entregar Avances</a>
                    </div>
                )}

                <label>Subir PDF del Proyecto (solo uno permitido):</label>
                <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files[0])} />
                <button className={`btn ${!pdfFile || evaluacion?.estado?.toLowerCase() === "aprobado" ? "disabled" : ""}`}
                        disabled={!pdfFile || evaluacion?.estado?.toLowerCase() === "aprobado"}
                        onClick={subirPDF}>
                    Guardar PDF
                </button>

                <h3>PDF Registrado</h3>
                <div id="visorPDF">
                    {evaluacion?.url_pdf ? (
                        <iframe src={evaluacion.url_pdf} title="Documento del proyecto"></iframe>
                    ) : (
                        <p>No se ha subido ningún PDF.</p>
                    )}
                </div>
            </main>

            {modalOpen && (
                <div className="modal-overlay" onClick={(e) => e.target.className.includes("modal-overlay") && setModalOpen(false)}>
                    <div className="modal-card">
                        <div className="modal-header">
                            <h3 className="modal-title">Información de Revisión del Proyecto</h3>
                            <button className="modal-close" onClick={() => setModalOpen(false)}>&times;</button>
                        </div>

                        <div className="modal-section">
                            <div className="info-box">
                                <p><strong>Título:</strong> {proyecto.titulo}</p>
                                <p><strong>Tipo:</strong> {proyecto.tipo}</p>
                                <p><strong>Línea:</strong> {proyecto.linea}</p>
                                <p><strong>Integrantes:</strong> {proyecto.integrantes}</p>
                            </div>
                        </div>

                        <div className="modal-section">
                            <div className="info-box">
                                <p><strong>Puntaje:</strong> {evaluacion?.puntaje ?? "Sin asignar"}</p>
                                <p><strong>Estado:</strong> {evaluacion?.estado ?? "pendiente"}</p>
                            </div>
                        </div>

                        <div className="modal-section">
                            <h4>Evaluación Detallada</h4>
                            <table className="eval-table">
                                <thead>
                                <tr>
                                    <th>N°</th>
                                    <th>Parámetro</th>
                                    <th>Respuesta</th>
                                    <th>Puntaje</th>
                                </tr>
                                </thead>
                                <tbody>
                                {criterios.length === 0 ? (
                                    <tr><td colSpan={4}>No hay criterios registrados.</td></tr>
                                ) : (
                                    criterios.map(c => (
                                        <tr key={c.numero_criterio}>
                                            <td>{c.numero_criterio}</td>
                                            <td>{c.parametro}</td>
                                            <td>{c.respuesta}</td>
                                            <td>{c.puntaje}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ marginTop: 18, textAlign: "right" }}>
                            <button className="btn" onClick={generarPDF}>PDF</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
