import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./evaluarp_innovacionP.css";

const supabase = createClient(
    "https://bxjqdsnekmbldvfnjvpg.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4anFkc25la21ibGR2Zm5qdnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NjUyODUsImV4cCI6MjA3NDQ0MTI4NX0.ibjF_Icj3C81g5fRO6yuOhCxCyCzN7M_SCSjvUXSPwc"
);

const criterios = [
    "Describe la línea de investigación",
    "Describe los beneficiarios del proyecto directos e indirectos",
    "Menciona el costo del proyecto",
    "Explica la fuente de financiamiento",
    "Menciona el lugar de ejecución",
    "El título refleja el listado de las situaciones problemáticas",
    "Describe el listado de las situaciones problemáticas más relevantes que se presentan",
    "Realiza la agrupación de los problemas encontrados",
    "Prioriza el problema después de agruparlos",
    "Realiza un esquema utilizando un árbol de problemas contextualizado",
    "Realiza un listado y un análisis de las potencialidades del problema",
    "Define las causas y efectos del problema priorizado",
    "Explica el objetivo central del proyecto",
    "Explica los resultados del proyecto",
    "Explica la fundamentación teórica del proyecto",
    "Describe el tipo de investigación",
    "Menciona el lugar y periodo de la investigación",
    "Establece la población beneficiaria (directas e indirectas)",
    "Establece lugar y periodo de ejecución del proyecto de innovación pedagógica",
    "Identifica el presupuesto para ejecución del proyecto de innovación pedagógica",
    "Determina las actividades del proyecto de innovación pedagógica. y las metas",
    "Determina las metas del proyecto de innovación pedagógica",
    "Determina del cronograma del proyecto de innovación pedagógica",
    "Establece los responsables del proyecto de innovación pedagógica",
    "Determina las actividades del proyecto de innovación pedagógica. y las metas",
    "Realiza las referencias bibliográficas de acuerdo con el estilo de redacción APA",
    "Considera los anexos exigidos en el esquema del proyecto de innovación pedagógica"
];

const secciones = {
    "I. Datos Generales": [1, 2, 3, 4, 5],
    "II. Título": [6],
    "III. Identificación de la problemática": [7, 8, 9, 10, 11, 12],
    "IV. Definición de los objetivos y los resultados": [13, 14],
    "V. Fundamentación teórica del proyecto": [15],
    "VI. Metodología": [16, 17, 18, 19],
    "VII. Presupuesto": [20],
    "VIII. Determinación de las actividades": [21, 22, 23, 24],
    "IX. Referencias bibliográficas": [25],
    "X. Determinación de las actividades": [26],
    "XI. Anexos": [27]
};

export default function EvaluarpInnovacionP() {
    const params = new URLSearchParams(window.location.search);
    const proyectoId = params.get("id");

    const [evaluacionId, setEvaluacionId] = useState(null);
    const [projectInfo, setProjectInfo] = useState(null);
    const [respuestas, setRespuestas] = useState({});
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ show: false, titulo: "", texto: "" });

    // Obtener o crear evaluación
    useEffect(() => {
        async function obtenerEvaluacion() {
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
                setEvaluacionId(nueva.id);
            } else {
                setEvaluacionId(evalData[0].id);
            }
        }

        obtenerEvaluacion();
    }, [proyectoId]);

    // Cargar proyecto, respuestas y PDF
    useEffect(() => {
        if (!evaluacionId) return;

        async function cargarDatos() {
            // Proyecto
            const { data: proyecto } = await supabase
                .from("proyectos")
                .select("*")
                .eq("id", proyectoId)
                .single();
            setProjectInfo(proyecto);

            // Respuestas
            const { data: resp } = await supabase
                .from("evaluacion_innovacion_pedagógica_institucional")
                .select("*")
                .eq("evaluacion_id", evaluacionId);
            if (resp) {
                const res = {};
                resp.forEach(r => (res[r.numero_criterio] = r.respuesta));
                setRespuestas(res);
            }

            // PDF
            const { data } = await supabase
                .from("evaluaciones")
                .select("*")
                .eq("id", evaluacionId)
                .single();
            if (data?.url_pdf) setPdfUrl(data.url_pdf);
        }

        cargarDatos();
    }, [evaluacionId, proyectoId]);

    const handleChange = (num, value) => {
        setRespuestas({ ...respuestas, [num]: value });
    };

    const handleGuardar = async () => {
        setLoading(true);
        let puntaje = 0;

        for (let i = 1; i <= 27; i++) {
            const respuesta = respuestas[i] || "no";
            const score = respuesta === "si" ? 1 : 0;
            if (score) puntaje++;

            await supabase
                .from("evaluacion_innovacion_pedagógica_institucional")
                .upsert(
                    {
                        evaluacion_id: evaluacionId,
                        numero_criterio: i,
                        parametro: criterios[i - 1],
                        respuesta,
                        puntaje: score
                    },
                    { onConflict: "evaluacion_id,numero_criterio" }
                );
        }

        const estadoFinal = puntaje > 19 ? "aprobado" : "desaprobado";

        await supabase
            .from("evaluaciones")
            .update({ puntaje: `${puntaje}/27`, estado: estadoFinal })
            .eq("id", evaluacionId);

        await supabase
            .from("proyectos")
            .update({ estado: "revisado" })
            .eq("id", proyectoId);

        setLoading(false);
        setModal({
            show: true,
            titulo: "Evaluación Guardada",
            texto: `Puntaje obtenido: ${puntaje}/27<br>Estado: <strong>${estadoFinal}</strong>`
        });
    };

    return (
        <>
            {loading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}

            {modal.show && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>{modal.titulo}</h3>
                        <p dangerouslySetInnerHTML={{ __html: modal.texto }}></p>
                        <button
                            className="modal-btn"
                            onClick={() => (window.location.href = "/evaluador")}
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            )}

            <header>
                Evaluación - Innovación Pedagógica-Institucional
                <button
                    className="back-btn"
                    onClick={() => (window.location.href = "/evaluador")}
                >
                    ← Volver
                </button>
            </header>

            <div className="container">
                <h2>Información del Proyecto</h2>
                {projectInfo ? (
                    <>
                        <p><strong>Título:</strong> {projectInfo.titulo}</p>
                        <p><strong>Tipo:</strong> {projectInfo.tipo}</p>
                        <p><strong>Línea:</strong> {projectInfo.linea}</p>
                        <p><strong>Integrantes:</strong> {projectInfo.integrantes}</p>
                        <p><strong>Objetivo:</strong> {projectInfo.objetivo}</p>
                        <p><strong>Beneficiarios:</strong> {projectInfo.beneficiarios}</p>
                        <p><strong>Localización:</strong> {projectInfo.localizacion}</p>
                        <p><strong>Fecha Inicio:</strong> {projectInfo.fecha_inicio}</p>
                        <p><strong>Fecha Fin:</strong> {projectInfo.fecha_fin}</p>
                    </>
                ) : (
                    <p>Cargando información del proyecto...</p>
                )}

                <hr style={{ margin: "18px 0" }} />

                <h2>Documento PDF Presentado</h2>
                {pdfUrl ? (
                    <iframe src={pdfUrl} title="PDF"></iframe>
                ) : (
                    <p>No se ha subido ningún PDF.</p>
                )}

                <h2>Evaluación (27 criterios)</h2>
                <form>
                    {Object.keys(secciones).map((titulo, idx) => (
                        <div key={idx}>
                            <h3 style={{ color: "#1a4079", marginTop: "25px" }}>{titulo}</h3>
                            {secciones[titulo].map((num) => (
                                <div className="criterion" key={num}>
                  <span>
                    {num}. {criterios[num - 1]}
                  </span>
                                    <select
                                        value={respuestas[num] || "no"}
                                        onChange={(e) => handleChange(num, e.target.value)}
                                    >
                                        <option value="no">No</option>
                                        <option value="si">Sí</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    ))}
                </form>

                <button className="submit-btn" onClick={handleGuardar}>
                    Guardar Evaluación
                </button>
            </div>
        </>
    );
}
