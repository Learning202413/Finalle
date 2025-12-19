import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./evaluarp_innovacionT.css";

const supabase = createClient(
    "https://bxjqdsnekmbldvfnjvpg.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4anFkc25la21ibGR2Zm5qdnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NjUyODUsImV4cCI6MjA3NDQ0MTI4NX0.ibjF_Icj3C81g5fRO6yuOhCxCyCzN7M_SCSjvUXSPwc"
);

export default function EvaluacionInnovacionT() {
    const [loader, setLoader] = useState(false);
    const [modal, setModal] = useState({ visible: false, titulo: "", texto: "" });
    const [proyecto, setProyecto] = useState(null);
    const [evaluacionId, setEvaluacionId] = useState(null);
    const [respuestas, setRespuestas] = useState({});
    const [pdfUrl, setPdfUrl] = useState("");

    const params = new URLSearchParams(window.location.search);
    const proyectoId = params.get("id");

    const criterios = [
        "Describe la línea de investigación",
        "Describe los beneficiarios del proyecto directos e indirectos",
        "Menciona el costo del proyecto",
        "Explica la fuente de financiamiento",
        "Menciona el lugar de ejecución",
        "Refleja el contenido del problema",
        "Concordante con variables, nivel y alcance",
        "Describe problema científico usando citas",
        "Problema considera variables y dimensiones",
        "Objetivo general relacionado",
        "Objetivos específicos relacionados",
        "Justificación social clara",
        "Alcance claro del problema",
        "Antecedentes (tesis, artículos, libros especializados)",
        "Antecedentes resumidos correctamente",
        "Ideas y teorías principales relacionadas",
        "Conceptos de variables y dimensiones",
        "Tipo de investigación fundamentado",
        "Explica diseño de investigación",
        "Describe en qué consiste la innovación tecnológica",
        "Identifica segmento de clientes",
        "Describe demanda potencial",
        "Describe canales de distribución",
        "Contextualización y pertinencia",
        "Lugar y periodo de ejecución",
        "Identifica costos directos e indirectos",
        "Explica indicadores de evaluación",
        "Cronograma de actividades",
        "Referencias APA correctas"
    ];

    const secciones = {
        "I. Datos Generales": [1,2,3,4,5],
        "II. Título": [6,7],
        "III. Identificación de la problemática": [8,9,10,11,12,13],
        "IV. Marco Referencial": [14,15,16,17],
        "V. Metodología del proyecto": [18,19,20],
        "VI. Identificación del Mercado": [21,22,23,24],
        "VII. Administración del proyecto": [25,26,27,28],
        "VIII. Referencias Bibliográficas": [29]
    };

    // Cargar o crear evaluación
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
                return;
            }

            setEvaluacionId(evalData[0].id);
        }

        obtenerEvaluacion();
    }, [proyectoId]);

    // Cargar proyecto, evaluacion y PDF
    useEffect(() => {
        if (!evaluacionId) return;

        async function cargarProyecto() {
            const { data: proyectoData } = await supabase
                .from("proyectos")
                .select("*")
                .eq("id", proyectoId)
                .single();

            const { data: evaluacionData } = await supabase
                .from("evaluaciones")
                .select("puntaje, estado, url_pdf")
                .eq("id", evaluacionId)
                .single();

            setProyecto({
                ...proyectoData,
                puntaje: evaluacionData?.puntaje,
                estado: evaluacionData?.estado
            });

            setPdfUrl(evaluacionData?.url_pdf ?? "");

            // Cargar respuestas
            const { data: respData } = await supabase
                .from("evaluacion_innovacion_tecnologica")
                .select("*")
                .eq("evaluacion_id", evaluacionId);

            if (respData && respData.length > 0) {
                const mapRespuestas = {};
                respData.forEach(r => { mapRespuestas[r.numero_criterio] = r.respuesta; });
                setRespuestas(mapRespuestas);
            }
        }

        cargarProyecto();
    }, [evaluacionId, proyectoId]);

    const handleChange = (num, value) => {
        setRespuestas(prev => ({ ...prev, [num]: value }));
    };

    const guardarEvaluacion = async () => {
        setLoader(true);

        let puntaje = 0;

        for (let i = 1; i <= 29; i++) {
            const respuesta = respuestas[i] ?? "no";
            const score = respuesta === "si" ? 1 : 0;
            if (score === 1) puntaje++;

            await supabase
                .from("evaluacion_innovacion_tecnologica")
                .upsert({
                    evaluacion_id: evaluacionId,
                    numero_criterio: i,
                    parametro: criterios[i-1],
                    respuesta: respuesta,
                    puntaje: score
                }, { onConflict: "evaluacion_id,numero_criterio" });
        }

        const estadoFinal = puntaje > 19 ? "aprobado" : "desaprobado";

        await supabase
            .from("evaluaciones")
            .update({ puntaje: `${puntaje}/29`, estado: estadoFinal })
            .eq("id", evaluacionId);

        await supabase
            .from("proyectos")
            .update({ estado: "revisado" })
            .eq("id", proyectoId);

        setLoader(false);
        setModal({
            visible: true,
            titulo: "Evaluación Guardada",
            texto: `Puntaje obtenido: ${puntaje}/29<br>Estado: <strong>${estadoFinal}</strong>`
        });
    };

    return (
        <div>
            {loader && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}

            {modal.visible && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <h3>{modal.titulo}</h3>
                        <p dangerouslySetInnerHTML={{ __html: modal.texto }}></p>
                        <button className="modal-btn" onClick={() => window.location.href='evaluador'}>
                            Continuar
                        </button>
                    </div>
                </div>
            )}

            <header>
                Evaluación - Innovación Tecnológica
                <button className="back-btn" onClick={() => window.location.href='evaluador'}>← Volver</button>
            </header>

            <div className="container">
                <h2>Información del Proyecto</h2>
                {proyecto ? (
                    <div>
                        <p><strong>Título:</strong> {proyecto.titulo}</p>
                        <p><strong>Tipo:</strong> {proyecto.tipo}</p>
                        <p><strong>Línea:</strong> {proyecto.linea}</p>
                        <p><strong>Integrantes:</strong> {proyecto.integrantes}</p>
                        <p><strong>Objetivo:</strong> {proyecto.objetivo}</p>
                        <p><strong>Beneficiarios:</strong> {proyecto.beneficiarios}</p>
                        <p><strong>Localización:</strong> {proyecto.localizacion}</p>
                        <p><strong>Fecha Inicio:</strong> {proyecto.fecha_inicio}</p>
                        <p><strong>Fecha Fin:</strong> {proyecto.fecha_fin}</p>
                        <hr style={{margin:"18px 0"}}/>
                        <p><strong>Puntaje:</strong> {proyecto.puntaje ?? "Sin evaluación aún"}</p>
                        <p>
                            <strong>Estado de Evaluación:</strong>
                            <span style={{
                                color:"white",
                                background: proyecto.puntaje >= 20 ? "green" : proyecto.puntaje >= 11 ? "goldenrod" : "red",
                                padding:"4px 10px",
                                borderRadius:"6px",
                                fontWeight:"bold"
                            }}>
                                {proyecto.estado ?? "pendiente"}
                            </span>
                        </p>
                    </div>
                ) : <p>Cargando información del proyecto...</p>}

                <h2>Documento PDF Presentado</h2>
                {pdfUrl ? <iframe src={pdfUrl}></iframe> : <p>No se ha subido ningún PDF.</p>}

                <h2>Evaluación (29 criterios)</h2>
                <form>
                    {Object.entries(secciones).map(([titulo, nums]) => (
                        <div key={titulo}>
                            <h3 style={{color:"#1a4079", marginTop:"25px"}}>{titulo}</h3>
                            {nums.map(num => (
                                <div className="criterion" key={num}>
                                    <span>{num}. {criterios[num-1]}</span>
                                    <select value={respuestas[num] ?? "no"} onChange={e => handleChange(num, e.target.value)}>
                                        <option value="no">No</option>
                                        <option value="si">Sí</option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    ))}
                </form>

                <button className="submit-btn" onClick={guardarEvaluacion}>Guardar Evaluación</button>
            </div>
        </div>
    );
}
