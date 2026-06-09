//Importaciones:
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Pantalla from "./pages/Pantalla/Pantalla";
import Totem from "./pages/Totem/Totem";

// App:
function App() {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Navigate to="/totem" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pantalla" element={<Pantalla />} />
            <Route path="/totem" element={<Totem />} />
        </Routes>
        </BrowserRouter>
    );
}

export default App;