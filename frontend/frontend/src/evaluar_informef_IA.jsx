import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./evaluar_informef_IA.css"; // CSS separado

const supabase = createClient(
    "https://bxjqdsnekmbldvfnjvpg.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4anFkc25la21ibGR2Zm5qdnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NjUyODUsImV4cCI6MjA3NDQ0MTI4NX0.ibjF_Icj3C81g5fRO6yuOhCxCyCzN7M_SCSjvUXSPwc"
);

export default function EvaluarInformefIA() {
    const [avanceFinal, setAvanceFinal] = useState(null);
    const [proyecto, setProyecto] = useState(null);
    const [respuestas, setRespuestas] = useState({});

    const criterios = [
        "El título refleja el contenido de la descripción del problema",
        "El titulo es concordante con las variables de estudio, nivel y alcance de la investigación",
        "La dedicatoria está dirigida a una persona importante del investigador y está ubicada en la parte inferior derecha de la página, considerando la palabra del autor",
        "El agradecimiento está dirigido a una persona o institución que facilitó la investigación y está ubicado en la parte derecha inferior de la página considerando el nombre del investigador",
        "La introducción explica claramente sobre el tema a investigar",
        "La introducción menciona el objetivo que se persigue con la investigación",
        "La introducción indica la metodología utilizada y da a conocer el esquema del contenido por capítulos",
        "La numeración de páginas es de acuerdo con el estilo de redacción utilizado",
        "Tiene contenido de tablas, figuras, etc",
        "Está redactado en un solo párrafo impersonal y en tiempo pasado excepto las conclusiones que debe estar presente",
        "Está redactado en forma secuencial como sigue: Problema, objetivos, metodología, resultados, conclusiones y recomendaciones",
        "Tiene Palabras clave de la redacción del resumen",
        "Presenta el entorno y describe características, eventos y datos que evidencian la existencia del problema o problemas que se propone abordar",
        "El problema general está claramente planteado, la respuesta aportara conocimiento nuevo y está enmarcado dentro de la delimitación hecha",
        "Los problemas específicos son subproblemas del problema general y si se resuelven aportan a la solución del problema general",
        "El objetivo general tiene relación con el problema y el título de la investigación",
        "Los objetivos específicos están en relación con los problemas específicos considerando las variables y/o dimensiones del estudio",
        "La justificación social determina el beneficio que tendrá la sociedad con la investigación",
        "Establece claramente el alcance hasta donde se abordará el problema, ubicándolo geográficamente y si fuera necesario temporalmente",
        "Los antecedentes son de tesis, artículos de investigación o libros especializados y están relacionados con el tema de la investigación",
        "La descripción de los antecedentes debe resumir el problema que abordaron, el objetivo, la solución, los resultados obtenidos y el aporte a la investigación",
        "Presenta en forma clara y lógica las principales ideas y teorías, remarcando la relación con el tema en investigación",
        "Los conceptos utilizados son de las variables y dimensiones",
        "La hipótesis general da respuestas o priori al problema general y existe una relación recíproca",
        "Las hipótesis específicas dan respuesta a priori a los problemas específicos",
        "Está conceptualizado las variables con la correspondiente cita",
        "En la operacionalización de las variables existe relación entre las variables y la dimensiones",
        "En la operacionalización de las variables existe relación entre la dimensión y el indicador",
        "Identifica correctamente el método general y específico a utilizar en la investigación",
        "Considera el tipo de investigación con claridad y lo fundamenta",
        "Propone el nivel de investigación de manera correcta en relación con la formulación del problema",
        "El diseño de investigación está en relación con el nivel de investigación",
        "Identifica el universo, considerando el total de la población y describe el ámbito de investigación.",
        "Determina el tamaño de la muestra correctamente si la población es finita o infinita",
        "Las técnicas de recolección de datos utilizado es el más conveniente",
        "Considera y describe los métodos específicos de evaluación de variables",
        "Tiene medida de confiabilidad el instrumento y señala el tipo",
        "Realiza la validez del instrumento",
        "Procesa en forma pertinente los datos y hace el análisis",
        "Identifica el universo, considerando el total de la población y describe el ámbito de investigación.",
        "Los resultados son presentados mediante tablas y/o gráficos estadísticos de acuerdo con las variables y dimensiones establecidas, explicadas en tiempo pasado y bajo la interpretación del autor.",
        "Se presenta la contrastación de hipótesis y describe la interpretación de los resultados según la técnica estadística empleada",
        "Se presenta la contrastación de resultados con otros estudios",
        "Establece en forma breve el nivel del alcance hallado en relación con los objetivos y contrastación de hipótesis",
        "Deben derivarse de las conclusiones de la investigación, realizando propuestas y/o sugerencias de mejoras sustanciales en relación con el problema estudiado",
        "Están establecidas de acuerdo con el estilo de redacción",
        "Considera los anexos exigidos en la estructura de forma ordenada"
    ];

    const secciones = {
        "I. Datos Generales": [1, 2, 3, 4, 5, 6, 7],
        "II. Contenido": [8, 9],
        "III. Resumen": [10, 11, 12],
        "IV. Identificación de la problemática": [13, 14, 15, 16, 17, 18, 19],
        "V. Marco Teórico": [20, 21, 22, 23],
        "VI. Hipótesis": [24, 25, 26, 27, 28],
        "VII. Metodología": [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
        "VIII. Resultados": [41, 42, 43],
        "IX. Conclusiones": [44],
        "X. Recomendaciones": [45],
        "XI. Referencias Bibliográficas": [46],
        "XII. Anexos": [47]
    };

    const params = new URLSearchParams(window.location.search);
    const proyectoId = params.get("id");

    useEffect(() => {
        async function cargarDatos() {
            const { data: avance } = await supabase
                .from("avances_proyecto")
                .select("*")
                .eq("proyecto_id", proyectoId)
                .single();
            setAvanceFinal(avance);

            const { data: proj } = await supabase
                .from("proyectos")
                .select("*")
                .eq("id", proyectoId)
                .single();
            setProyecto(proj);

            const { data: resp } = await supabase
                .from("evaluacion_if_investigacion_aplicada")
                .select("*")
                .eq("avances_proyecto_id", avance?.id);

            const respObj = {};
            resp?.forEach(r => {
                respObj[r.numero_criterio] = r.respuesta;
            });
            setRespuestas(respObj);
        }

        cargarDatos();
    }, [proyectoId]);

    const handleChange = (num, value) => {
        setRespuestas(prev => ({ ...prev, [num]: value }));
    };

    const guardarEvaluacion = async () => {
        if (!avanceFinal) return;
        let puntaje = 0;
        for (let i = 1; i <= 47; i++) {
            const respuesta = respuestas[i] || "no";
            const score = respuesta === "si" ? 1 : 0;
            puntaje += score;

            await supabase
                .from("evaluacion_if_investigacion_aplicada")
                .upsert(
                    {
                        avances_proyecto_id: avanceFinal.id,
                        numero_criterio: i,
                        parametro: criterios[i - 1],
                        respuesta,
                        puntaje: score
                    },
                    { onConflict: "avances_proyecto_id,numero_criterio" }
                );
        }
        const estadoFinal = puntaje >= 33 ? "aprobado" : "desaprobado";
        await supabase
            .from("avances_proyecto")
            .update({ puntaje: `${puntaje}/47`, estado: estadoFinal })
            .eq("id", avanceFinal.id);
        alert(`Evaluación Guardada\nPuntaje: ${puntaje}/47\nEstado: ${estadoFinal}`);
    };

    return (
        <div className="eia-body">
            <header className="eia-header">
                Evaluación - Investigación Aplicada
                <button className="eia-back-btn" onClick={() => window.location.href='evaluador_informef'}>← Volver</button>
            </header>

            <div className="eia-container">
                <h2>Información del Proyecto</h2>
                {proyecto && (
                    <div className="eia-projectInfo">
                        <p><strong>Título:</strong> {proyecto.titulo}</p>
                        <p><strong>Tipo:</strong> {proyecto.tipo}</p>
                        <p><strong>Línea:</strong> {proyecto.linea}</p>
                        <p><strong>Integrantes:</strong> {proyecto.integrantes}</p>
                        <hr style={{ margin: "15px 0" }} />
                        <p><strong>Puntaje Informe Final:</strong> {avanceFinal?.puntaje ?? "Sin evaluar aún"}</p>
                        <p>
                            <strong>Estado Informe Final:</strong>{" "}
                            <span className={`eia-estado ${avanceFinal?.puntaje ? "" : "eia-gray"}`}>
                {avanceFinal?.estado ?? "pendiente"}
              </span>
                        </p>
                    </div>
                )}

                <h2>Documento PDF Presentado</h2>
                {avanceFinal?.informe_final_url ? (
                    <iframe className="eia-pdfViewer" src={avanceFinal.informe_final_url} title="Informe Final"></iframe>
                ) : (
                    <p>No se ha subido un Informe Final.</p>
                )}

                <h2>Evaluación (47 criterios)</h2>
                <form className="eia-form">
                    {Object.entries(secciones).map(([titulo, nums]) => (
                        <div key={titulo}>
                            <h3 className="eia-section-title">{titulo}</h3>
                            {nums.map(num => (
                                <div className="eia-criterion" key={num}>
                                    <span>{num}. {criterios[num - 1]}</span>
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

                <button className="eia-submit-btn" onClick={guardarEvaluacion}>Guardar Evaluación</button>
            </div>
        </div>
    );
}
