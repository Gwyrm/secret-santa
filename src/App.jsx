import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Create from "./pages/Create";
import Decor from "./components/Decor";
import Reveal from "./pages/Reveal";

export default function App() {
    const navStyle = {
        padding: 20,
        display: "flex",
        gap: 20,
        backgroundColor: "rgba(0,0,0,0.3)",
        borderBottom: "2px solid #f7d47a",
        alignItems: "center"
    };

    const linkStyle = {
        color: "#f7d47a",
        textDecoration: "none",
        fontWeight: "bold",
    };

    return (
        <BrowserRouter>
            <nav style={navStyle}>
                <div style={{fontWeight: "bold", color: "#fff", marginRight: 10}}>🎁 Secret Santa</div>
                <Link style={linkStyle} to="/">Créer le tirage</Link>
                <Link style={linkStyle} to="/reveal">Révéler un code</Link>
            </nav>
            <Decor />

            <Routes>
                <Route path="/" element={<Create />} />
                <Route path="/reveal" element={<Reveal />} />
            </Routes>
        </BrowserRouter>
    );
}