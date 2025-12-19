import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

import "./evaluarp_investigacionA.css";

const supabase = createClient(
    "https://bxjqdsnekmbldvfnjvpg.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4anFkc25la21ibGR2Zm5qdnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NjUyODUsImV4cCI6MjA3NDQ0MTI4NX0.ibjF_Icj3C81g5fRO6yuOhCxCyCzN7M_SCSjvUXSPwc"
);

export default function EvaluarInvestigacionA() {
    const navigate = useNavigate();
    const [evaluacionId, setEvaluacionId] = useState(null);
    const [proyecto, setProyecto] = useState(null);
    const [respuestas, setRespuestas] = useState({});
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ show: false, titulo: "", texto: "" });
    const [pdfUrl, setPdfUrl] = useState(null);

    const criterios = [
        "Describe la línea de investigación",
        "Describe los beneficiarios del proyecto",
        "Menciona el costo del proyecto",
        "Explica la fuente de financiamiento",
        "Menciona el lugar de ejecución",
        "Refleja el contenido del problema",
        "Concordante con variables y alcance",
        "Describe el problema de forma científica",
        "Formulación del problema considera variables",
        "Objetivo general relacionado con el problema",
        "Objetivos específicos relacionados",
        "Justificación social clara",
        "Alcance claramente definido",
        "Antecedentes especializados",
        "Antecedentes bien descritos",
        "Ideas y teorías relacionadas",
        "Conceptos claros de variables",
        "Hipótesis general coherente",
        "Hipótesis específicas correctas",
        "Variables conceptualizadas con cita",
        "Relación variable-dimensión",
        "Relación dimensión-indicador",
        "Método general identificado",
        "Tipo de investigación fundamentado",
        "Nivel de investigación correcto",
        "Diseño relacionado al nivel",
        "Identifica universo y población",
        "Muestra bien determinada",
        "Técnicas e instrumentos correctos",
        "Métodos específicos apropiados",
        "Métodos de análisis adecuados",
        "Cronograma correcto",
        "Presupuesto establecido",
        "Referencias APA correctas",
        "Anexos completos y ordenados"
    ];

    const secciones = {
        "I. Datos Generales": [1, 2, 3, 4, 5],
        "II. Planteamiento del Problema": [6, 7, 8, 9, 10],
        "III. Objetivos del Proyecto": [11],
        "IV. Justificación del Proyecto": [12],
        "V. Antecedentes": [13, 14, 15],
        "VI. Marco Teórico": [16, 17, 18, 19, 20, 21, 22],
        "VII. Metodología": [23, 24, 25, 26, 27, 28, 29, 30, 31],
        "VIII. Cronograma": [32],
        "IX. Presupuesto": [33],
        "X. Referencias y Anexos": [34, 35]
    };

    // ============================
    // Obtener ID de evaluación
    // ============================
    const obtenerEvaluacion = async (proyectoId) => {
        const { data: evalData } = await supabase
            .from("evaluaciones")
            .select("*")
            .eq("proyecto_id", proyectoId);

        if (!evalData || evalData.length === 0) {
            const { data: nueva } = await supabase
                .from("evaluaciones")
                .insert([{ proyecto_id: proyectoId }])
                .select()
                .single();
            return nueva.id;
        }
        return evalData[0].id;
    };

    // ============================
    // Cargar info del proyecto
    // ============================
    const cargarProyecto = async () => {
        const params = new URLSearchParams(window.location.search);
        const proyectoId = params.get("id");
        if (!proyectoId) return;

        const idEval = await obtenerEvaluacion(proyectoId);
        setEvaluacionId(idEval);

        const { data: proj } = await supabase
            .from("proyectos")
            .select("*")
            .eq("id", proyectoId)
            .single();

        setProyecto(proj);

        // Cargar respuestas previas
        const { data: resp } = await supabase
            .from("evaluacion_investigacion_aplicada")
            .select("*")
            .eq("evaluacion_id", idEval);

        if (resp) {
            const resObj = {};
            resp.forEach(r => { resObj[r.numero_criterio] = r.respuesta; });
            setRespuestas(resObj);
        }

        // Cargar PDF
        const { data: evalData } = await supabase
            .from("evaluaciones")
            .select("*")
            .eq("id", idEval)
            .single();
        setPdfUrl(evalData?.url_pdf || null);
    };

    useEffect(() => {
        cargarProyecto();
    }, []);

    // ============================
    // Manejo de selección de criterios
    // ============================
    const handleSelectChange = (num, value) => {
        setRespuestas({ ...respuestas, [num]: value });
    };

    // ============================
    // Guardar Evaluación
    // ============================
    const guardarEvaluacion = async () => {
        if (!evaluacionId || !proyecto) return;
        setLoading(true);

        let puntaje = 0;
        for (let i = 1; i <= 35; i++) {
            const valor = respuestas[i] || "no";
            if (valor === "si") puntaje++;

            await supabase
                .from("evaluacion_investigacion_aplicada")
                .upsert({
                    evaluacion_id: evaluacionId,
                    numero_criterio: i,
                    parametro: criterios[i - 1],
                    respuesta: valor,
                    puntaje: valor === "si" ? 1 : 0
                }, { onConflict: "evaluacion_id,numero_criterio" });
        }

        const estadoFinal = puntaje > 24 ? "aprobado" : "desaprobado";

        await supabase
            .from("evaluaciones")
            .update({ puntaje: `${puntaje}/35`, estado: estadoFinal })
            .eq("id", evaluacionId);

        await supabase
            .from("proyectos")
            .update({ estado: "revisado" })
            .eq("id", proyecto.id);

        setLoading(false);
        setModal({ show: true, titulo: "Evaluación Guardada", texto: `Puntaje obtenido: ${puntaje}/35<br>Estado: <strong>${estadoFinal}</strong>` });
    };

    const cerrarModal = () => {
        setModal({ ...modal, show: false });
        navigate("/evaluador");
    };

    return (
        <div className="evaA-body">
            {/* Loader */}
            {loading && (
                <div className="evaA-loader-overlay">
                    <div className="evaA-loader"></div>
                </div>
            )}

            {/* Modal */}
            {modal.show && (
                <div className="evaA-modal-overlay">
                    <div className="evaA-modal-box">
                        <h3>{modal.titulo}</h3>
                        <p dangerouslySetInnerHTML={{ __html: modal.texto }}></p>
                        <button className="evaA-modal-btn" onClick={cerrarModal}>Continuar</button>
                    </div>
                </div>
            )}

            <header className="evaA-header">
                Evaluación - Investigación Aplicada
                <button className="evaA-back-btn" onClick={() => navigate("/evaluador")}>← Volver</button>
            </header>

            <div className="evaA-container">
                <h2>Información del Proyecto</h2>
                {proyecto ? (
                    <div className="evaA-project-info">
                        <p><strong>Título:</strong> {proyecto.titulo}</p>
                        <p><strong>Tipo:</strong> {proyecto.tipo}</p>
                        <p><strong>Línea:</strong> {proyecto.linea}</p>
                        <p><strong>Integrantes:</strong> {proyecto.integrantes}</p>
                        <p><strong>Objetivo:</strong> {proyecto.objetivo}</p>
                        <p><strong>Beneficiarios:</strong> {proyecto.beneficiarios}</p>
                        <p><strong>Localización:</strong> {proyecto.localizacion}</p>
                        <p><strong>Fecha Inicio:</strong> {proyecto.fecha_inicio}</p>
                        <p><strong>Fecha Fin:</strong> {proyecto.fecha_fin}</p>
                    </div>
                ) : <p>No se encontró información del proyecto.</p>}

                <h2>Documento PDF Presentado</h2>
                <div className="evaA-pdf-viewer">
                    {pdfUrl ? <iframe src={pdfUrl}></iframe> : <p>No se ha subido ningún PDF.</p>}
                </div>

                <h2>Evaluación (35 criterios)</h2>
                <form className="evaA-eval-form">
                    {Object.keys(secciones).map((titulo, idx) => (
                        <div key={idx}>
                            <h3>{titulo}</h3>
                            {secciones[titulo].map(num => (
                                <div className="evaA-criterion" key={num}>
                                    <span>{num}. {criterios[num-1]}</span>
                                    <select
                                        value={respuestas[num] || "no"}
                                        onChange={e => handleSelectChange(num, e.target.value)}
                                    >
                                        <option value="no">No</option>
                                        <option value="si">Sí</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    ))}
                </form>

                <button className="evaA-submit-btn" onClick={guardarEvaluacion}>Guardar Evaluación</button>
            </div>
        </div>
    );
}
