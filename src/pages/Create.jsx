import { useState } from "react";
import { sha256 } from "../utils/hash.js";

const SECRET = "NOEL-2025-SECRET";

export default function Create() {
    const [names, setNames] = useState("");
    const [codes, setCodes] = useState([]);

    async function generate() {
        const list = names
            .split("\n")
            .map(s => s.trim())
            .filter(Boolean);

        const results = [];

        for (let name of list) {
            const hash = await sha256(name + SECRET);
            const code = btoa(JSON.stringify({ name, hash }));
            results.push({ name, code });
        }

        setCodes(results);
    }

    function copy(code) {
        navigator.clipboard.writeText(code);
        alert("Code copié !");
    }

    return (
        <div style={{ padding: 20 }}>
            <h1 style={{ color: "#f7d47a" }}>🎅 Créer un tirage Secret Santa</h1>

            <p>Saisis les noms (un par ligne) :</p>

            <textarea
                style={{ width: "100%", height: 150 }}
                value={names}
                onChange={e => setNames(e.target.value)}
            />

            <button onClick={generate} style={{ marginTop: 10 }}>
                Générer les codes 🎄
            </button>

            {codes.length > 0 && (
                <div className="card">
                    <h2 style={{ color: "#f7d47a" }}>Résultats</h2>
                    {codes.map(c => (
                        <div key={c.code} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
                            <b style={{ color: "#f7d47a", minWidth: 160 }}>{c.name}</b>
                            <code style={{ color: "#fff", wordBreak: "break-all", background: "rgba(0,0,0,0.2)", padding: "6px 8px", borderRadius: 6 }}>{c.code}</code>
                            <button onClick={() => copy(c.code)} style={{ marginLeft: "auto" }}>Copier</button>
                        </div>
                    ))}
                    <p style={{marginTop:10, fontSize: 14, opacity: 0.9}}>Donne le code à la personne — elle pourra coller le code dans la page "Révéler un code".</p>
                </div>
            )}
        </div>
    );
}