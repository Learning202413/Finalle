import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase.js";
import "./formulariop.css";

export default function Formulario() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        titulo: "",
        tipo: "",
        linea: "",
        programa: "",
        integrantes: "",
        objetivo: "",
        beneficiarios: "",
        localizacion: "",
        fecha_inicio: "",
        fecha_fin: "",
    });

    const [programasOpciones, setProgramasOpciones] = useState([]);

    // Validar acceso docente
    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        const role = localStorage.getItem("role");
        const auth = localStorage.getItem("auth");

        if (!email || !role || auth !== "ok") {
            alert("Debe iniciar sesión.");
            navigate("/");
            return;
        }

        if (role.toLowerCase() !== "docente") {
            alert("Acceso denegado. Solo docentes.");
            navigate("/");
            return;
        }
    }, [navigate]);

    const programasMap = {
        "Asistencia Administrativa": [
            "Gestión documentaria",
            "Gestión de recursos humanos y financieros",
            "Gestión de eventos y actividades protocolares"
        ],
        "Diseño y Programación Web": [
            "Diseño web y aplicaciones multimedia",
            "Aplicaciones web",
            "Integración de aplicaciones web y móviles"
        ],
        "Electricidad Industrial": [
            "Instalación y Mantenimiento de Sistemas eléctricos",
            "Suministro y matenimiento eléctrico de edificaciones y máquinas eléctricas",
            "Automatización y control de sistemas y equipos eléctricos"
        ],
        "Electrónica Industrial": [
            "Instalación y mantenimiento de sistemas eléctricos y electrónicos",
            "Diseño y operación de sistemas eléctricos y electrónicos",
            "Sistemas de automatización y potencia",
            "Sistemas de control de procesos, redes y comunicaciones industriales"
        ],
        "Mantenimiento De Maquinaria Pesada": [
            "Mecánica de banco e instalaciones eléctricas básicas",
            "Mantenimiento de motores de combustión interna",
            "Mantenimiento de Sistemas Hidráulicos, Frenos, Dirección, Suspensión y Transmisión de Maquinaria Pesada"
        ],
        "Mecatrónica Automotriz": [
            "Mantenimiento de los sistemas de suspensión, dirección y frenos automotrices con asistencia electrónica",
            "Mantenimiento de los sistemas eléctricos y electrónicos automotrices",
            "Mantenimiento de los sistemas de transmisión con asistencia electrónica"
        ],
        "Mecánica De Producción Industrial": [
            "Diseño y tecnologia de la soldadura",
            "Proceso de mecanizado de piezas y matriceria",
            "Fabricacion y automatizacion industrial"
        ],
        "Metalurgia": [
            "Técnicas de Conminución en Minerales",
            "Procesamiento de Minerales",
            "Control de Calidad en Procesos Metalúrgicos"
        ],
        "Tecnología De Análisis Química": [
            "Técnico en Preparación de Muestras Químicas",
            "Técnico en Ensayos Físico-Químicos",
            "Técnico en Análisis Instrumental"
        ]
    };

    const handleChange = (e) => {
        const { id, value } = e.target;

        let newValue = value;
        if (["titulo", "integrantes"].includes(id)) {
            newValue = value
                .toLowerCase()
                .split(" ")
                .filter(p => p.trim() !== "")
                .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                .join(" ");
        }

        if (["objetivo", "beneficiarios", "localizacion"].includes(id)) {
            newValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }

        setFormData((prev) => ({
            ...prev,
            [id]: newValue,
        }));

        if (id === "linea") {
            setProgramasOpciones(programasMap[value] || []);
            setFormData((prev) => ({ ...prev, programa: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const email = localStorage.getItem("userEmail");
        if (!email) {
            alert("Error: no se encontró al usuario logeado.");
            return;
        }

        const { data: docente, error: docenteError } = await supabase
            .from("perfil")
            .select("id")
            .eq("email", email)
            .single();

        if (docenteError || !docente) {
            alert("No se pudo identificar al docente.");
            return;
        }

        const { error } = await supabase.from("proyectos").insert([
            {
                ...formData,
                docente_id: docente.id,
                estado: "sin revisar"
            }
        ]);

        if (error) {
            alert("Error guardando el proyecto: " + error.message);
        } else {
            alert("Proyecto registrado correctamente 🎉");
            navigate("/docente");
        }
    };

    return (
        <div className="formulario-page">
            <div className="form-container">
                <h2>Registrar Nuevo Proyecto</h2>
                <form onSubmit={handleSubmit}>
                    <label>Título del proyecto</label>
                    <input type="text" id="titulo" value={formData.titulo} onChange={handleChange} required />

                    <label>Tipo de investigación</label>
                    <select id="tipo" value={formData.tipo} onChange={handleChange} required>
                        <option value="">Seleccione</option>
                        <option>Investigación Aplicada</option>
                        <option>Innovación Tecnológica</option>
                        <option>Innovación Pedagógica-Institucional</option>
                    </select>

                    <label>Programa de estudio</label>
                    <select id="linea" value={formData.linea} onChange={handleChange} required>
                        <option value="">Seleccione</option>
                        {Object.keys(programasMap).map((l) => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </select>

                    <label>Línea de investigación</label>
                    <select id="programa" value={formData.programa} onChange={handleChange} required>
                        <option value="">Seleccione</option>
                        {programasOpciones.map((p) => (
                            <option key={p} value={p}>{p}</option>
                        ))}
                    </select>

                    <label>Integrante o integrantes</label>
                    <textarea id="integrantes" value={formData.integrantes} onChange={handleChange}></textarea>

                    <label>Objetivo del proyecto</label>
                    <textarea id="objetivo" value={formData.objetivo} onChange={handleChange}></textarea>

                    <label>Beneficiarios</label>
                    <textarea id="beneficiarios" value={formData.beneficiarios} onChange={handleChange}></textarea>

                    <label>Localización</label>
                    <input type="text" id="localizacion" value={formData.localizacion} onChange={handleChange} />

                    <label>Fecha de inicio</label>
                    <input type="date" id="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required />

                    <label>Fecha de final</label>
                    <input type="date" id="fecha_fin" value={formData.fecha_fin} onChange={handleChange} required />

                    <button type="submit" className="btn-registrar">Registrar Proyecto</button>
                </form>

                <button className="back-btn" onClick={() => navigate("/docente")}>← Volver</button>
            </div>
        </div>
    );
}
