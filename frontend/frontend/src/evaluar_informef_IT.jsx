import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./evaluar_informef_IT.css";

const supabase = createClient(
    "https://bxjqdsnekmbldvfnjvpg.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4anFkc25la21ibGR2Zm5qdnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NjUyODUsImV4cCI6MjA3NDQ0MTI4NX0.ibjF_Icj3C81g5fRO6yuOhCxCyCzN7M_SCSjvUXSPwc"
);

const criterios = [
    "El título refleja el contenido de la descripción del problema",
    "El título es concordante con las variables de estudio, nivel y alcance de la investigación",
    "La dedicatoria está dirigida a una persona importante del investigador y está ubicada en la parte inferior derecha de la página, considerando la palabra del autor",
    "El agradecimiento está dirigido a una persona o institución que facilitó la investigación y está ubicado en  parte derecha inferior de la página considerando el nombre del investigador",
    "El título refleja el contenido de la descripción del problema",
    "La introducción menciona el objetivo que se persigue con la investigación",
    "La introducción indica la metodología utilizada y da a conocer el esquema del contenido por capítulos",
    "La numeración de páginas es de acuerdo con el estilo de redacción utilizado",
    "Tiene contenido de tablas, figuras, etc.",
    "Está redactado en un solo párrafo impersonal y en tiempo pasado excepto las conclusiones que debe estar presente",
    "Está redactado en forma secuencial como sigue: Problema, objetivos, metodología, resultados, conclusiones y recomendaciones",
    "Tiene Palabras clave de la redacción del resumen",
    "Presenta el entorno y describe características, eventos y datos que evidencian la existencia del problema o problemas que se propone abordar.",
    "El problema general está claramente planteado, la respuesta aportara conocimiento nuevo y está enmarcado dentro de la delimitación hecha",
    "Los problemas específicos son subproblemas del problema general y si se resuelven aportan a la solución del problema general.",
    "El objetivo general tiene relación con el problema y el título de la investigación",
    "Los objetivos específicos están en relación con los problemas específicos considerando las variables y/o dimensiones del estudio",
    "La justificación social determina el beneficio que tendrá la sociedad con la investigación",
    "Establece claramente el alcance hasta donde se abordará el problema, ubicándolo geográficamente y si fuera necesario temporalmente",
    "Los antecedentes son de tesis, artículos de investigación o libros especializados y están relacionados con el tema de la investigación",
    "La descripción de los antecedentes debe resumir el problema que abordaron, el objetivo, la solución, los resultados obtenidos y el aporte a la investigación.",
    "Presenta en forma clara y lógica las principales ideas y teorías, remarcando la relación con el tema en investigación.",
    "Los conceptos utilizados son de las variables y dimensiones.",
    "Considera el tipo de investigación con claridad y lo fundamenta.",
    "Explica el diseño de la investigación.",
    "Argumenta el alcance de la innovación tecnológica",
    "Describe en que consiste la innovación tecnológica",
    "Identifica el segmento de los clientes",
    "Identifica y describe la demanda potencial del mercado encontrado",
    "Describe los canales de distribución utilizados",
    "Realiza la contextualización y pertinencia del proyecto",
    "Identifica los costos directos en la ejecución del proyecto de innovación tecnológica",
    "Identifica los costos indirectos en la ejecución del proyecto de innovación tecnológica.",
    "Explica la tasa interna de retorno (TIR) del proyecto de innovación tecnológica",
    "Explica el Valor Presente Neto (VPN) del proyecto de innovación tecnológica",
    "Explica la relación Costo/Beneficio del proyecto de innovación tecnológica",
    "Establece en forma breve el nivel del alcance hallado en relación con los objetivos",
    "Deben derivarse de las conclusiones de la investigación",
    "Están establecidas de acuerdo con el estilo de redacción APA",
    "Considera los anexos exigidos en la estructura de forma ordenada"
];

const secciones = {
    "I. Datos Generales": [1, 2, 3, 4, 5, 6, 7],
    "II. Contenido": [8, 9],
    "III. Resumen": [10, 11, 12],
    "IV. Identificación de la problemática": [13, 14, 15, 16, 17, 18, 19],
    "V. Marco Teórico": [20, 21, 22, 23],
    "VI. Metodología": [24, 25, 26, 27],
    "VII. Identificación del Mercado": [28, 29, 30, 31],
    "VIII. Administración del proyecto": [32, 33, 34, 35, 36],
    "IX. Conclusiones": [37],
    "X. Recomendaciones": [38],
    "XI. Referencias Bibliográficas": [39],
    "XII. Anexos": [40]
};

export default function EvaluarInformefIT() {
    const [projectInfo, setProjectInfo] = useState(null);
    const [avanceFinal, setAvanceFinal] = useState(null);
    const [respuestas, setRespuestas] = useState({});
    const [showLoader, setShowLoader] = useState(false);
    const [modal, setModal] = useState({ show: false, titulo: "", texto: "" });

    const params = new URLSearchParams(window.location.search);
    const proyectoId = params.get("id");

    useEffect(() => {
        async function fetchData() {
            // Obtener avance final
            const { data: avance } = await supabase
                .from("avances_proyecto")
                .select("*")
                .eq("proyecto_id", proyectoId)
                .single();
            setAvanceFinal(avance || null);

            // Cargar datos del proyecto
            const { data: proyecto } = await supabase
                .from("proyectos")
                .select("*")
                .eq("id", proyectoId)
                .single();

            setProjectInfo(proyecto || null);

            // Cargar respuestas previas
            if (avance?.id) {
                const { data: resp } = await supabase
                    .from("evaluacion_if_innovacion_tecnologica")
                    .select("*")
                    .eq("avances_proyecto_id", avance.id);

                const respObj = {};
                resp?.forEach(r => {
                    respObj[r.numero_criterio] = r.respuesta;
                });
                setRespuestas(respObj);
            }
        }

        fetchData();
    }, [proyectoId]);

    const handleChange = (num, value) => {
        setRespuestas(prev => ({ ...prev, [num]: value }));
    };

    const handleGuardar = async () => {
        if (!avanceFinal) return;
        setShowLoader(true);

        let puntaje = 0;

        for (let i = 1; i <= 40; i++) {
            const respuesta = respuestas[i] || "no";
            const score = respuesta === "si" ? 1 : 0;
            puntaje += score;

            await supabase
                .from("evaluacion_if_innovacion_tecnologica")
                .upsert(
                    {
                        avances_proyecto_id: avanceFinal.id,
                        numero_criterio: i,
                        parametro: criterios[i - 1],
                        respuesta: respuesta,
                        puntaje: score
                    },
                    { onConflict: "avances_proyecto_id,numero_criterio" }
                );
        }

        const estadoFinal = puntaje >= 28 ? "aprobado" : "desaprobado";

        await supabase
            .from("avances_proyecto")
            .update({ puntaje: `${puntaje}/40`, estado: estadoFinal })
            .eq("id", avanceFinal.id);

        setShowLoader(false);
        setModal({
            show: true,
            titulo: "Evaluación Guardada",
            texto: `Puntaje: <strong>${puntaje}/40</strong><br>Estado: <strong>${estadoFinal}</strong>`
        });
    };

    const getColorEstado = () => {
        if (!avanceFinal?.puntaje) return "gray";
        const puntajeNum = parseInt(avanceFinal.puntaje.split("/")[0]);
        if (puntajeNum >= 28) return "green";
        if (puntajeNum >= 16) return "goldenrod";
        return "red";
    };

    return (
        <div>
            {showLoader && (
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
                            onClick={() => (window.location.href = "evaluador_informef.html")}
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            )}

            <header>
                Evaluación - Innovación Tecnológica
                <button
                    className="back-btn"
                    onClick={() => (window.location.href = "/evaluador_informef")}
                >
                    ← Volver
                </button>
            </header>

            <div className="container">
                <h2>Información del Proyecto</h2>
                {projectInfo ? (
                    <div>
                        <p>
                            <strong>Título:</strong> {projectInfo.titulo}
                        </p>
                        <p>
                            <strong>Tipo:</strong> {projectInfo.tipo}
                        </p>
                        <p>
                            <strong>Línea:</strong> {projectInfo.linea}
                        </p>
                        <p>
                            <strong>Integrantes:</strong> {projectInfo.integrantes}
                        </p>
                        <hr style={{ margin: "15px 0" }} />
                        <p>
                            <strong>Puntaje Informe Final:</strong>{" "}
                            {avanceFinal?.puntaje ?? "Sin evaluar aún"}
                        </p>
                        <p>
                            <strong>Estado Informe Final:</strong>{" "}
                            <span
                                style={{
                                    color: "white",
                                    background: getColorEstado(),
                                    padding: "5px 12px",
                                    borderRadius: "6px"
                                }}
                            >
                {avanceFinal?.estado ?? "pendiente"}
              </span>
                        </p>
                    </div>
                ) : (
                    <p>No se encontró información del proyecto.</p>
                )}

                <h2>Documento PDF Presentado</h2>
                {avanceFinal?.informe_final_url ? (
                    <iframe src={avanceFinal.informe_final_url}></iframe>
                ) : (
                    <p>No se ha subido un Informe Final.</p>
                )}

                <h2>Evaluación (40 criterios)</h2>
                <form id="evalForm">
                    {Object.keys(secciones).map(seccion => (
                        <div key={seccion}>
                            <h3 style={{ color: "#1a4079", marginTop: "25px" }}>{seccion}</h3>
                            {secciones[seccion].map(num => (
                                <div className="criterion" key={num}>
                  <span>
                    {num}. {criterios[num - 1]}
                  </span>
                                    <select
                                        value={respuestas[num] || "no"}
                                        onChange={e => handleChange(num, e.target.value)}
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
        </div>
    );
}
