// src/components/RevealPage.tsx

import React, { useState } from 'react';
import type { HashedDrawResult } from '../types';
import { verifyAndDecrypt } from '../utils/crypto';
import './RevealPage.css';

interface Props {
  hashedResults: HashedDrawResult[];
}

export const RevealPage: React.FC<Props> = ({ hashedResults }) => {
  const [code, setCode] = useState('');
  const [revealed, setRevealed] = useState<{ giver: string; receiver: string } | null>(null);
  const [error, setError] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const hasData = hashedResults.length > 0;

  const handleReveal = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setRevealed(null);

    if (!code.trim()) {
      setError('Veuillez entrer un code');
      return;
    }

    if (!hasData) {
      setError('Aucune donnée de tirage disponible. Vérifiez le lien partagé.');
      return;
    }

    setIsRevealing(true);
    setAttempts((prev) => prev + 1);

    try {
      const result = await verifyAndDecrypt(code.trim(), hashedResults);

      if (!result) {
        setIsRevealing(false);
        setError('Code invalide. Vérifiez votre code et réessayez.');
        return;
      }

      setTimeout(() => {
        setRevealed(result);
        setIsRevealing(false);
      }, 1400);
    } catch (error) {
      console.error('Erreur lors de la révélation:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
      setIsRevealing(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setRevealed(null);
    setError('');
    setIsRevealing(false);
  };

  const renderContent = () => {
    if (!hasData) {
      return (
        <div className="state-block empty-state">
          <span className="state-icon">🔗</span>
          <h3>Aucun tirage chargé</h3>
          <p>
            Demandez l'organisateur de vous envoyer le lien complet contenant les données chiffrées.
          </p>
        </div>
      );
    }

    if (isRevealing) {
      return (
        <div className="state-block reveal-loading">
          <div className="gift-loader">🎁</div>
          <p>Déchiffrement en cours...</p>
          <div className="progress-track">
            <div className="progress-fill"></div>
          </div>
          <small>Ne fermez pas cette page.</small>
        </div>
      );
    }

    if (revealed) {
      return (
        <div className="state-block reveal-success">
          <div className="success-confetti">🎉 🎊 ✨</div>
          <span className="success-label">Bravo {revealed.giver} !</span>
          <div className="success-card">
            <p>Tu offres un cadeau à</p>
            <strong>{revealed.receiver}</strong>
          </div>
          <p className="success-note">
            Garde ce secret pour toi afin que la magie de Noël reste intacte.
          </p>
          <button className="btn-ghost" onClick={handleReset}>
            ↩️ Entrer un autre code
          </button>
        </div>
      );
    }

    return (
      <form onSubmit={handleReveal} className="code-form">
        <div className="input-wrap">
          <label htmlFor="code">Ton code secret</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC12345"
            maxLength={8}
            className="code-input"
            autoComplete="off"
            autoFocus
          />
          <span className="input-helper">8 caractères – lettres et chiffres, sans espaces.</span>
        </div>

        {error && (
          <div className="error-message">
            <span>❌</span> {error}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="reveal-btn" disabled={code.length !== 8}>
            🎁 Révéler mon destinataire
          </button>
          <p className="form-note">
            Appuie doucement sur entrée, nous nous occupons du reste en toute sécurité.
          </p>
        </div>

        {attempts > 2 && (
          <div className="hint-box">
            <strong>Astuce :</strong> vérifie que tu n'as pas ajouté d'espaces ou inversé des caractères.
          </div>
        )}
      </form>
    );
  };

  return (
    <div className="reveal-page">
      <section className="reveal-hero">
        <div className="hero-text">
          <p className="hero-badge">🎁 Espace participant</p>
          <h1>Révèle ton destinataire en toute discrétion</h1>
          <p>
            Entre le code que tu as reçu. Il est unique et permet de révéler ton destinataire sans
            dévoiler les autres correspondances.
          </p>
          <div className="hero-stats">
            <div>
              <span>Codes chargés</span>
              <strong>{hashedResults.length}</strong>
            </div>
            <div>
              <span>Protection</span>
              <strong>AES-256 &amp; SHA-256</strong>
            </div>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="gift-ring">
            <span role="img" aria-hidden="true">
              🎄
            </span>
          </div>
          <p>Confidentiel &amp; joyeux</p>
        </div>
      </section>

      <div className="reveal-grid">
        <section className="reveal-card form-card">
          <header className="card-header">
            <p className="card-kicker">Code secret personnel</p>
            <h2>Entre ton code pour découvrir ton destinataire</h2>
            <p>Un seul code, une seule révélation. Prenez votre temps.</p>
          </header>
          {renderContent()}
        </section>

        <aside className="reveal-card info-card">
          <h3>Comment ça marche ?</h3>
          <ol className="step-list">
            <li>Récupère le code reçu par SMS, mail ou papier.</li>
            <li>Entre-le dans le champ dédié puis clique sur révéler.</li>
            <li>Découvre ton destinataire et garde l'information secrète.</li>
          </ol>

          <div className="info-security">
            <h4>🔐 Sécurité totale</h4>
            <p>
              Les données sont chiffrées dans l'URL. Aucune information n'est stockée sur un
              serveur externe.
            </p>
          </div>

          <div className="info-hint">
            <h4>Besoin d'aide ?</h4>
            <p>
              Contacte l'organisateur si ton code ne fonctionne pas. Un nouveau lien peut être
              généré en quelques secondes.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
