import React, { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import "./evaluar_informef_IPI.css";

const supabase = createClient(
    "https://bxjqdsnekmbldvfnjvpg.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4anFkc25la21ibGR2Zm5qdnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NjUyODUsImV4cCI6MjA3NDQ0MTI4NX0.ibjF_Icj3C81g5fRO6yuOhCxCyCzN7M_SCSjvUXSPwc"
);

export default function EvaluadorInformeF_IPI() {
    const params = new URLSearchParams(window.location.search);
    const proyectoId = params.get("id");

    const criterios = [
        "El título refleja el contenido de la descripción del problema",
        "La dedicatoria está dirigida a una persona importante del investigador y está ubicada en la parte inferior derecha de la página, considerando la palabra del autor",
        "El agradecimiento está dirigido a una persona o institución que facilitó la investigación y está ubicado en la parte derecha inferior de la página considerando el nombre del investigador",
        "Realiza la tabla de contenidos del informe final",
        "La introducción explica claramente sobre el tema a investigar",
        "La introducción menciona el objetivo que se persigue con la investigación",
        "La introducción da a conocer el esquema del contenido por capítulos",
        "El título refleja el problema principal",
        "Está redactado en un solo párrafo impersonal y en tiempo pasado excepto las conclusiones que debe estar presente",
        "Explica el problema principal de la innovación pedagógica",
        "Explica las causas del problema principal",
        "Explica las consecuencias del problema y la necesidad de ser resuelta",
        "Explica la utilidad del proyecto de innovación pedagógica",
        "Explica la pertinencia del proyecto de innovación pedagógica",
        "Establece las limitaciones del proyecto de innovación pedagógica",
        "Identifica los beneficiarios directos: Metas y características",
        "Identifica los beneficiarios indirectos: Metas y características",
        "Explica en forma clara y lógica las principales ideas y teorías, remarcando la relación con el tema del proyecto de innovación pedagógica",
        "El objetivo tiene relación con el problema y el título de la innovación pedagógica",
        "Considera el tipo de investigación con claridad y lo fundamenta",
        "Menciona el lugar y periodo de la investigación",
        "Establece lugar y periodo de ejecución del proyecto de innovación pedagógica",
        "Identifica las actividades del proyecto de innovación pedagógica",
        "Identifica las metas del proyecto de innovación pedagógica",
        "Determina del cronograma del proyecto de innovación pedagógica",
        "Establece los responsables del proyecto de innovación pedagógica",
        "Determina la inversión de la innovación pedagógica",
        "Explica los gastos de las actividades realizadas en su innovación",
        "Argumenta los resultados de su innovación pedagógica",
        "Establece correctamente los indicadores de su innovación pedagógica",
        "Determina los medios de verificación de su innovación pedagógica",
        "Explica las actividades que se realizó para que perdure su innovación pedagógica",
        "Propone la replicabilidad de su innovación pedagógica",
        "Establece en forma breve el nivel del alcance hallado en relación con los objetivos",
        "Deben derivarse de las conclusiones de la innovación, realizando propuestas y/o sugerencias de mejoras sustanciales en relación con el problema estudiado",
        "Determina las actividades del proyecto de innovación pedagógica. y las metas",
        "Realiza las referencias bibliográficas de acuerdo con el estilo de redacción APA",
        "Considera los anexos exigidos en el esquema del informe final de innovación pedagógica"
    ];

    const secciones = {
        "I. Datos Generales": [1, 2, 3, 4, 5, 6, 7],
        "II. Título": [8],
        "III. Descripción general del proyecto": [9],
        "IV. Identificación de la problemática": [10, 11, 12],
        "V. Justificación del proyecto": [13, 14, 15],
        "VI. Beneficiarios del proyecto": [16, 17],
        "VII. Fundamentación teórica del proyecto": [18],
        "VIII. Objetivos y resultados del proyecto": [19],
        "IX. Metodología": [20, 21, 22],
        "X. Actividades, metas y responsables del proyecto": [23, 24, 25, 26],
        "XI. Costos del proyecto": [27, 28],
        "XII. Evaluación del proyecto": [29, 30, 31],
        "XIII. Sostenibilidad del proyecto": [32, 33],
        "XIV. Conclusiones": [34],
        "XV. Recomendaciones": [35],
        "XVI. Referencias bibliográficas": [36],
        "XVII. Determinación de las actividades": [37],
        "XVIII. Anexos": [38]
    };

    useEffect(() => {
        let avanceFinal;

        async function obtenerAvanceFinal() {
            const { data: avance } = await supabase
                .from("avances_proyecto")
                .select("*")
                .eq("proyecto_id", proyectoId)
                .single();
            avanceFinal = avance;
            cargarProyecto(avance);
            cargarRespuestas(avance);
            cargarPDF(avance);
        }

        async function cargarProyecto(avance) {
            const { data: proyecto } = await supabase
                .from("proyectos")
                .select("*")
                .eq("id", proyectoId)
                .single();
            if (!proyecto) return;

            const puntajeNum = avance?.puntaje ? parseInt(avance.puntaje.split("/")[0]) : null;
            let colorEstado = "gray";
            if (puntajeNum !== null) colorEstado = puntajeNum >= 27 ? "green" : puntajeNum >= 14 ? "goldenrod" : "red";

            document.getElementById("projectInfo").innerHTML = `
        <p><strong>Título:</strong> ${proyecto.titulo}</p>
        <p><strong>Tipo:</strong> ${proyecto.tipo}</p>
        <p><strong>Línea:</strong> ${proyecto.linea}</p>
        <p><strong>Integrantes:</strong> ${proyecto.integrantes}</p>
        <hr style="margin:15px 0;">
        <p><strong>Puntaje Informe Final:</strong> ${avance?.puntaje ?? "Sin evaluar aún"}</p>
        <p><strong>Estado Informe Final:</strong> 
            <span style="color:white; background:${colorEstado}; padding:5px 12px; border-radius:6px;">
                ${avance?.estado ?? "pendiente"}
            </span>
        </p>
      `;
        }

        async function cargarRespuestas(avance) {
            const { data: respuestas } = await supabase
                .from("evaluacion_if_innovacionpi")
                .select("*")
                .eq("avances_proyecto_id", avance.id);

            respuestas?.forEach(r => {
                const select = document.getElementById(`crit${r.numero_criterio}`);
                if (select) select.value = r.respuesta;
            });
        }

        async function cargarPDF(avance) {
            const pdfDiv = document.getElementById("pdfViewer");
            if (!avance?.informe_final_url) {
                pdfDiv.innerHTML = "<p>No se ha subido un Informe Final.</p>";
                return;
            }
            pdfDiv.innerHTML = `<iframe src="${avance.informe_final_url}"></iframe>`;
        }

        obtenerAvanceFinal();
    }, [proyectoId]);

    const guardarEvaluacion = async () => {
        document.getElementById("loader").style.display = "flex";
        const avanceFinal = await supabase
            .from("avances_proyecto")
            .select("*")
            .eq("proyecto_id", proyectoId)
            .single()
            .then(r => r.data);

        let puntaje = 0;

        for (let i = 1; i <= 38; i++) {
            const respuesta = document.getElementById(`crit${i}`).value;
            const score = respuesta === "si" ? 1 : 0;
            puntaje += score;

            await supabase.from("evaluacion_if_innovacionpi").upsert(
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

        const estadoFinal = puntaje >= 27 ? "aprobado" : "desaprobado";

        await supabase
            .from("avances_proyecto")
            .update({ puntaje: `${puntaje}/38`, estado: estadoFinal })
            .eq("id", avanceFinal.id);

        document.getElementById("loader").style.display = "none";

        const modal = document.getElementById("resultadoModal");
        document.getElementById("modalTitulo").textContent = "Evaluación Guardada";
        document.getElementById("modalTexto").innerHTML = `Puntaje: <strong>${puntaje}/38</strong><br>Estado: <strong>${estadoFinal}</strong>`;
        modal.style.display = "flex";
    };

    return (
        <div>
            <div className="loader-overlay" id="loader">
                <div className="loader"></div>
            </div>

            <div className="modal-overlay" id="resultadoModal">
                <div className="modal-box">
                    <h3 id="modalTitulo">Resultado</h3>
                    <p id="modalTexto"></p>
                    <button className="modal-btn" onClick={() => window.location.href = "/evaluador_informef"}>Continuar</button>
                </div>
            </div>

            <header>
                Evaluación - Innovación Pedagógica-Institucional
                <button className="back-btn" onClick={() => window.location.href = "/evaluador_informef"}>← Volver</button>
            </header>

            <div className="container">
                <h2>Información del Proyecto</h2>
                <div id="projectInfo"></div>

                <h2>Documento PDF Presentado</h2>
                <div id="pdfViewer"></div>

                <h2>Evaluación (38 criterios)</h2>
                <form id="evalForm">
                    {Object.entries(secciones).map(([titulo, indices]) => (
                        <div key={titulo}>
                            <h3 style={{ color: "#1a4079", marginTop: "25px" }}>{titulo}</h3>
                            {indices.map(num => (
                                <div className="criterion" key={num}>
                                    <span>{num}. {criterios[num - 1]}</span>
                                    <select id={`crit${num}`}>
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
