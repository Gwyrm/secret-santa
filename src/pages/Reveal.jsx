import { useState } from "react";
import { sha256 } from "../utils/hash.js";

const SECRET = "NOEL-2025-SECRET";

export default function Reveal() {
    const [code, setCode] = useState("");
    const [result, setResult] = useState("");

    async function decode() {
        try {
            const data = JSON.parse(atob(code.trim()));
            const expectedHash = await sha256(data.name + SECRET);

            if (expectedHash === data.hash) {
                setResult(data.name);
            } else {
                setResult("Code invalide ❌");
            }
        } catch {
            setResult("Format de code incorrect ❌");
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h1 style={{ color: "#f7d47a" }}>🎄 Révéler mon Secret Santa</h1>

            <input
                style={{ width: "100%", marginBottom: 10 }}
                placeholder="Entrez votre code"
                value={code}
                onChange={e => setCode(e.target.value)}
            />

            <button onClick={decode}>Voir mon cadeau 🎁</button>

            {result && (
                <div className="card" style={{ marginTop: 20, textAlign: "center" }}>
                    <h2 style={{ color: "#f7d47a" }}>
                        🎁 Tu dois offrir un cadeau à :
                    </h2>
                    <h1 style={{ fontSize: 32 }}>{result}</h1>
                </div>
            )}
        </div>
    );
}