import { Routes, Route } from "react-router-dom";
import Login from "./index.jsx";
import MenuEvaluador from "./menu_evaluador.jsx";
import Evaluador from "./evaluador.jsx";
import Admin from "./admin.jsx";
import Usuarios from "./usuarios.jsx";
import Docente from "./docente.jsx";
import Formulariop from "./formulariop.jsx";
import Puntajep from "./puntajep.jsx";
import Avances_e_informef from "./avances_e_informef.jsx";
import Evaluador_informef from "./evaluador_informef.jsx";
import Evaluar_informef_IA from "./evaluar_informef_IA.jsx";
import Evaluarp_investigacionA from "./evaluarp_investigacionA.jsx";
import Evaluarp_innovacionT from "./evaluarp_innovacionT.jsx";
import Evaluarp_innovacionP from "./evaluarp_innovacionP.jsx";
import Evaluar_informef_IT from "./evaluar_informef_IT.jsx";
import Evaluar_informef_IPI from "./evaluar_informef_IPI.jsx";
import Fechap from "./fechap.jsx";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/menu_evaluador" element={<MenuEvaluador />} />
            <Route path="/evaluador" element={<Evaluador />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/docente" element={<Docente />} />
            <Route path="/formulariop" element={<Formulariop />} />
            <Route path="/puntajep" element={<Puntajep />} />
            <Route path="/avances_e_informef" element={<Avances_e_informef />} />
            <Route path="/evaluador_informef" element={<Evaluador_informef />} />
            <Route path="/evaluar_informef_IA" element={<Evaluar_informef_IA />} />
            <Route path="/evaluarp_investigacionA" element={<Evaluarp_investigacionA />} />
            <Route path="/evaluarp_innovacionT" element={<Evaluarp_innovacionT />} />
            <Route path="/evaluarp_innovacionP" element={<Evaluarp_innovacionP />} />
            <Route path="/evaluar_informef_IT" element={<Evaluar_informef_IT />} />
            <Route path="/evaluar_informef_IPI" element={<Evaluar_informef_IPI />} />
            <Route path="/fechap" element={<Fechap />} />
        </Routes>
    );
}
