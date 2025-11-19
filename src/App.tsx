// src/App.tsx

import { useState, useEffect } from 'react';
import type { Participant, Couple, DrawResult as DrawResultType, HashedDrawResult } from './types';
import { ParticipantForm } from './components/ParticipantForm';
import { DrawResult } from './components/DrawResult';
import { RevealPage } from './components/RevealPage';
import { performDraw } from './utils/secretSanta';
import { decodeHashPayload } from './utils/dataEncoding';
import './App.css';

type View = 'admin' | 'reveal';

function App() {
  const [view, setView] = useState<View>('admin');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [couples, setCouples] = useState<Couple[]>([]);
  const [drawResults, setDrawResults] = useState<DrawResultType[] | null>(null);
  const [hashedResults, setHashedResults] = useState<HashedDrawResult[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Charger les données depuis l'URL au démarrage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    
    if (data) {
      const decoded = decodeHashPayload<HashedDrawResult[]>(data);
      if (decoded) {
        setHashedResults(decoded);
        setView('reveal');
      } else {
        console.error('Impossible de décoder les données du lien');
      }
    }
  }, []);

  const handleAddParticipant = (participant: Participant) => {
    setParticipants([...participants, participant]);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
    setCouples(couples.filter(
      (c) => c.participant1Id !== id && c.participant2Id !== id
    ));
  };

  const handleAddCouple = (couple: Couple) => {
    setCouples([...couples, couple]);
  };

  const handleRemoveCouple = (id: string) => {
    setCouples(couples.filter((c) => c.id !== id));
  };

  const handlePerformDraw = () => {
    if (participants.length < 3) {
      alert('Il faut au moins 3 participants pour faire un tirage');
      return;
    }

    setIsDrawing(true);

    setTimeout(() => {
      const results = performDraw(participants, couples);

      if (!results) {
        alert(
          'Impossible de réaliser le tirage avec ces contraintes. ' +
          'Essayez de réduire le nombre de couples ou d\'ajouter plus de participants.'
        );
        setIsDrawing(false);
        return;
      }

      const uniqueReceivers = Array.from(new Set(results.map((r) => r.receiverName))).sort((a, b) => a.localeCompare(b));
      console.log('Destinataires :', uniqueReceivers);
      setDrawResults(results);
      setIsDrawing(false);
    }, 1500);
  };

  const handleHashedResultsReady = (hashed: HashedDrawResult[]) => {
    setHashedResults(hashed);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Êtes-vous sûr de vouloir recommencer ? Tous les codes seront perdus.'
      )
    ) {
      setDrawResults(null);
      setHashedResults([]);
      setParticipants([]);
      setCouples([]);
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  return (
    <div className="app">
      <nav className="app-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">🎅</span>
            <span className="logo-text">Père Noël Secret</span>
          </div>
          <div className="nav-tabs">
            <button
              className={`nav-tab ${view === 'admin' ? 'active' : ''}`}
              onClick={() => setView('admin')}
            >
              👤 Organisation
            </button>
            <button
              className={`nav-tab ${view === 'reveal' ? 'active' : ''}`}
              onClick={() => setView('reveal')}
            >
              🎁 Révélation
            </button>
          </div>
        </div>
      </nav>

      <main className="app-main">
        {view === 'admin' ? (
          <div className="admin-view">
            {!drawResults ? (
              <>
                <div className="admin-header">
                  <h1>🎄 Organiser le tirage</h1>
                  <p>
                    Ajoutez les participants et définissez les couples pour
                    éviter qu'ils ne se tirent entre eux.
                  </p>
                </div>

                <ParticipantForm
                  participants={participants}
                  couples={couples}
                  onAddParticipant={handleAddParticipant}
                  onRemoveParticipant={handleRemoveParticipant}
                  onAddCouple={handleAddCouple}
                  onRemoveCouple={handleRemoveCouple}
                />

                {participants.length >= 3 && (
                  <div className="draw-action">
                    <button
                      onClick={handlePerformDraw}
                      disabled={isDrawing}
                      className="btn-draw"
                    >
                      {isDrawing ? (
                        <>
                          <span className="spinner"></span>
                          Tirage en cours...
                        </>
                      ) : (
                        <>
                          🎲 Effectuer le tirage au sort
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <DrawResult 
                results={drawResults} 
                onReset={handleReset}
                onHashedResultsReady={handleHashedResultsReady}
              />
            )}
          </div>
        ) : (
          <RevealPage hashedResults={hashedResults} />
        )}
      </main>

      <footer className="app-footer">
        <p>🎄 Joyeuses fêtes ! 🎁</p>
        <p className="footer-security">
          🔒 Application sécurisée - Chiffrement de bout en bout
        </p>
      </footer>
    </div>
  );
}

export default App;
