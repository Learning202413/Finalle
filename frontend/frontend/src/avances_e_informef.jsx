import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./avances_e_informef.css"; // CSS separado

const supabase = createClient(
    "https://bxjqdsnekmbldvfnjvpg.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4anFkc25la21ibGR2Zm5qdnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4NjUyODUsImV4cCI6MjA3NDQ0MTI4NX0.ibjF_Icj3C81g5fRO6yuOhCxCyCzN7M_SCSjvUXSPwc"
);

export default function AvanceInformeFinal() {
    const [idProyecto, setIdProyecto] = useState(null);
    const [proyecto, setProyecto] = useState({});
    const [registro, setRegistro] = useState({});
    const [avanceSeleccionado, setAvanceSeleccionado] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        setIdProyecto(id);

        if (id) {
            cargarProyecto(id);
            cargarInfoFinal(id);
            cargarAvances(id);
            verificarEstadoParaArticulo(id);
        }
    }, []);

    /* =============================
       Funciones: Cargar Proyecto e Información
    ============================= */
    async function cargarProyecto(id) {
        const { data } = await supabase
            .from("proyectos")
            .select("titulo, integrantes")
            .eq("id", id)
            .single();
        setProyecto(data || {});
    }

    async function cargarInfoFinal(id) {
        const { data } = await supabase
            .from("avances_proyecto")
            .select("*")
            .eq("proyecto_id", id)
            .single();
        setRegistro(data || {});
    }

    async function cargarAvances(id) {
        const { data } = await supabase
            .from("avances_proyecto")
            .select("*")
            .eq("proyecto_id", id)
            .single();
        setRegistro(data || {});
    }

    async function verificarEstadoParaArticulo(id) {
        const { data } = await supabase
            .from("avances_proyecto")
            .select("*")
            .eq("proyecto_id", id)
            .single();
        setRegistro(data || {});
    }

    /* =============================
       Función: Subir Avance
    ============================= */
    async function subirAvance(e) {
        const file = document.getElementById("avanceInput").files[0];
        if (!file) return alert("Selecciona un PDF");

        let { data: registro } = await supabase
            .from("avances_proyecto")
            .select("*")
            .eq("proyecto_id", idProyecto)
            .single();

        if (!registro) {
            const { data: nuevo } = await supabase
                .from("avances_proyecto")
                .insert([{ proyecto_id: idProyecto }])
                .select()
                .single();
            registro = nuevo;
        }

        let next = 0;
        for (let i = 1; i <= 5; i++) {
            if (!registro[`avance_${i}_url`]) {
                next = i;
                break;
            }
        }
        if (next === 0) return alert("Ya subiste los 5 avances permitidos.");

        const fileName = `avance-${idProyecto}-${next}-${Date.now()}.pdf`;

        const { error } = await supabase.storage
            .from("proyectos-avances")
            .upload(fileName, file);

        if (error) return alert("Error al subir archivo.");

        const { data: urlData } = supabase.storage
            .from("proyectos-avances")
            .getPublicUrl(fileName);

        await supabase
            .from("avances_proyecto")
            .update({ [`avance_${next}_url`]: urlData.publicUrl })
            .eq("proyecto_id", idProyecto);

        alert("Avance subido ✔");
        cargarAvances(idProyecto);
    }

    /* =============================
       Render
    ============================= */
    return (
        <div className="container">
            <a href={`puntajep.html?id=${idProyecto}`} className="volver-btn">
                ← Volver
            </a>

            <main>
                <div className="header-flex">
                    <h2>Avances e Informe Final</h2>
                    <button className="btn-info" id="infoRevisionFinalBtn">
                        Revisión Informe Final
                    </button>
                </div>

                <div className="info-box">
                    <p>
                        <strong>Proyecto:</strong> {proyecto.titulo || "—"}
                    </p>
                    <p>
                        <strong>Integrantes:</strong> {proyecto.integrantes || "—"}
                    </p>
                </div>

                <div className="info-box">
                    <p>
                        <strong>Puntaje Informe Final:</strong>{" "}
                        {registro.puntaje || "—"}
                    </p>
                    <p>
                        <strong>Estado Informe Final:</strong>{" "}
                        <span
                            style={{
                                background:
                                    registro.estado === "aprobado"
                                        ? "green"
                                        : registro.estado === "desaprobado"
                                            ? "red"
                                            : "gray",
                                color: "white",
                                padding: "4px 10px",
                                borderRadius: "6px",
                            }}
                        >
              {registro.estado || "—"}
            </span>
                    </p>
                </div>

                <hr />

                <h3>Subir Avances (máx. 5 PDFs)</h3>
                <label htmlFor="avanceInput">Seleccionar PDF:</label>
                <input type="file" id="avanceInput" accept="application/pdf" />
                <button className="btn" onClick={subirAvance}>
                    Subir Avance
                </button>
                <div id="listaAvances">
                    {/* Aquí se pueden mapear los avances con registro.avance_1_url etc */}
                </div>
            </main>
        </div>
    );
}
