import { useState } from "react";
import { useNavigate } from "react-router-dom";   // ⬅️ AÑADIDO
import "./index.css";
import { supabase } from "./supabase.js";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [errorMsg, setErrorMsg] = useState(false);

    const navigate = useNavigate(); // ⬅️ AÑADIDO

    function pseudoDecrypt(txt) {
        try {
            return atob(txt).split("").reverse().join("");
        } catch {
            return "";
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg(false);

        const { data, error } = await supabase
            .from("perfil")
            .select("*")
            .eq("email", email)
            .single();

        if (error || !data) {
            setErrorMsg(true);
            return;
        }

        const decrypted = pseudoDecrypt(data.password);

        if (decrypted !== password) {
            setErrorMsg(true);
            return;
        }

        localStorage.setItem("auth", "ok");
        localStorage.setItem("docenteId", data.id);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("role", data.role);

        const role = data.role.toLowerCase();

        if (role === "evaluador") navigate("/menu_evaluador"); // ⬅️ CAMBIADO
        else if (role === "docente") navigate("/docente");
        else if (role === "admin") navigate("/admin");
        else alert("⚠ Rol no reconocido: " + data.role);
    };

    return (
        <div className="body-bg">
            <div className="login-container">
                <h2>Iniciar Sesión</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Usuario</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Ingrese su usuario"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type={showPass ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingrese su contraseña"
                            required
                        />
                        <span
                            className="toggle-password"
                            onClick={() => setShowPass(!showPass)}
                        >
              {showPass ? "🙈" : "👁️"}
            </span>
                    </div>

                    <button type="submit" className="login-btn">
                        Ingresar
                    </button>

                    {errorMsg && (
                        <div className="error-msg">❌ Usuario o contraseña incorrectos</div>
                    )}
                </form>
            </div>

            <footer>© 2025 Instituto Cajas</footer>
        </div>
    );
}
