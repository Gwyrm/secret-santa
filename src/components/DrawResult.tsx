// src/components/DrawResult.tsx

import React, { useState, useEffect } from 'react';
import type { DrawResult as DrawResultType, HashedDrawResult } from '../types';
import { createHashedResult } from '../utils/crypto';
import { encodeHashPayload } from '../utils/dataEncoding';
import './DrawResult.css';

interface Props {
  results: DrawResultType[];
  onReset: () => void;
  onHashedResultsReady: (hashedResults: HashedDrawResult[]) => void;
}

export const DrawResult: React.FC<Props> = ({ 
  results, 
  onReset,
  onHashedResultsReady 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [shareableLink, setShareableLink] = useState<string>('');

  useEffect(() => {
    // Créer les hash au chargement
    const processResults = async () => {
      const hashedResults: HashedDrawResult[] = [];
      
      for (const result of results) {
        const hashed = await createHashedResult(result);
        hashedResults.push(hashed);
      }
      
      onHashedResultsReady(hashedResults);
      
      // Créer un lien partageable avec les données hashées
      const encodedData = encodeHashPayload(hashedResults);
      const baseUrl = window.location.origin + window.location.pathname;
      const link = `${baseUrl}?data=${encodedData}`;
      setShareableLink(link);
      
      setIsProcessing(false);
    };
    
    processResults();
  }, [results, onHashedResultsReady]);

  const copyToClipboard = (code: string, giverName: string) => {
    const text = `🎅 Père Noël Secret

Bonjour ${giverName},

Votre code secret est : ${code}

Rendez-vous sur le site pour découvrir à qui vous offrez un cadeau :
${window.location.origin}${window.location.pathname}

🎁 Joyeuses fêtes !`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const copyShareableLink = () => {
    navigator.clipboard.writeText(shareableLink).then(() => {
      alert('Lien copié ! Partagez-le avec les participants pour qu\'ils puissent révéler leur destinataire.');
    });
  };

  const downloadCodes = () => {
    const content = results
      .map(
        (r) =>
          `Pour: ${r.giverName}
Code secret: ${r.secretCode}

Rendez-vous sur: ${window.location.origin}${window.location.pathname}

-----------------------------------
`
      )
      .join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codes-pere-noel-secret.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const printCodes = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Codes Père Noël Secret</title>
          <meta charset="UTF-8">
          <style>
            @page { margin: 2cm; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              line-height: 1.6;
            }
            .code-card {
              border: 3px dashed #e74c3c;
              padding: 30px;
              margin-bottom: 40px;
              page-break-inside: avoid;
              border-radius: 15px;
              background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
            }
            h1 {
              color: #c0392b;
              text-align: center;
              font-size: 32px;
              margin-bottom: 40px;
            }
            h2 { 
              color: #c0392b; 
              margin: 0 0 15px 0;
              font-size: 24px;
            }
            .code { 
              font-size: 36px; 
              font-weight: bold; 
              color: #27ae60;
              letter-spacing: 4px;
              font-family: 'Courier New', monospace;
              background: #fff;
              padding: 15px;
              border-radius: 10px;
              text-align: center;
              margin: 20px 0;
              border: 2px solid #27ae60;
            }
            .instructions {
              margin-top: 20px;
              font-size: 14px;
              color: #555;
              background: #fff;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #3498db;
            }
            .url {
              font-family: monospace;
              color: #3498db;
              font-weight: bold;
              word-break: break-all;
            }
            @media print {
              .code-card { 
                page-break-after: always;
                box-shadow: none;
              }
              .code-card:last-child {
                page-break-after: auto;
              }
            }
          </style>
        </head>
        <body>
          <h1>🎅 Père Noël Secret - Codes Secrets 🎁</h1>
          ${results
            .map(
              (r) => `
            <div class="code-card">
              <h2>Pour : ${r.giverName}</h2>
              <div class="code">${r.secretCode}</div>
              <div class="instructions">
                <strong>📱 Instructions :</strong><br>
                1. Rendez-vous sur :<br>
                <span class="url">${window.location.origin}${window.location.pathname}</span><br>
                2. Cliquez sur l'onglet "🎁 Révélation"<br>
                3. Entrez votre code secret<br>
                4. Découvrez à qui vous offrez un cadeau !<br>
                <br>
                ⚠️ <strong>Gardez ce code secret !</strong>
              </div>
            </div>
          `
            )
            .join('')}
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (isProcessing) {
    return (
      <div className="draw-result">
        <div className="processing">
          <div className="spinner-large"></div>
          <p>Création des codes sécurisés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="draw-result">
      <div className="result-header">
        <h2>🎉 Tirage réussi !</h2>
        <p className="result-subtitle">
          {results.length} codes générés avec succès
        </p>
      </div>

      <div className="security-info">
        <div className="info-box">
          <h3>🔐 Comment ça marche ?</h3>
          <ul>
            <li>✅ Chaque code est <strong>unique et crypté</strong></li>
            <li>✅ Seul le participant peut découvrir son destinataire</li>
            <li>✅ Vous ne verrez <strong>jamais</strong> qui donne à qui</li>
            <li>✅ Les codes sont chiffrés avec AES-256-GCM</li>
          </ul>
        </div>
      </div>

      <div className="result-actions">
        <button onClick={copyShareableLink} className="btn-primary">
          🔗 Copier le lien de révélation
        </button>
        <button onClick={downloadCodes} className="btn-secondary">
          📥 Télécharger les codes
        </button>
        <button onClick={printCodes} className="btn-secondary">
          🖨️ Imprimer les codes
        </button>
        <button onClick={onReset} className="btn-danger">
          🔄 Nouveau tirage
        </button>
      </div>

      <div className="codes-grid">
        {results.map((result) => (
          <div key={result.secretCode} className="code-card">
            <div className="code-header">
              <span className="giver-icon">👤</span>
              <span className="giver-name">{result.giverName}</span>
            </div>
            <div className="code-display">
              <span className="code-label">Code secret :</span>
              <span className="code-value">{result.secretCode}</span>
            </div>
            <button
              onClick={() => copyToClipboard(result.secretCode, result.giverName)}
              className="btn-copy"
            >
              {copiedCode === result.secretCode ? '✓ Copié !' : '📋 Copier le message'}
            </button>
          </div>
        ))}
      </div>

      <div className="result-warning">
        <h3>⚠️ Instructions importantes</h3>
        <ol>
          <li>
            <strong>Distribuez les codes</strong> à chaque participant (SMS, message privé, imprimé)
          </li>
          <li>
            <strong>Partagez le lien de révélation</strong> avec tous les participants
          </li>
          <li>
            <strong>Ne regardez PAS</strong> les résultats sur la page de révélation
          </li>
          <li>
            Chaque participant entrera son code pour découvrir son destinataire
          </li>
        </ol>
      </div>

      <div className="technical-note">
        <details>
          <summary>🔒 Détails techniques de sécurité</summary>
          <p>
            Les codes sont hashés avec SHA-256 et les noms sont chiffrés avec AES-256-GCM.
            Seul le code original permet de déchiffrer et révéler le destinataire.
            Aucune donnée n'est stockée - tout est inclus dans le lien partagé.
          </p>
        </details>
      </div>
    </div>
  );
};
