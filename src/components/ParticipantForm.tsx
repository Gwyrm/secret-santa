// src/components/ParticipantForm.tsx

import React, { useMemo, useState } from 'react';
import type { Couple, Participant } from '../types';

interface ParticipantFormProps {
  participants: Participant[];
  couples: Couple[];
  onAddParticipant: (participant: Participant) => void;
  onRemoveParticipant: (participantId: string) => void;
  onAddCouple: (couple: Couple) => void;
  onRemoveCouple: (coupleId: string) => void;
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export const ParticipantForm: React.FC<ParticipantFormProps> = ({
  participants,
  couples,
  onAddParticipant,
  onRemoveParticipant,
  onAddCouple,
  onRemoveCouple,
}) => {
  const [participantName, setParticipantName] = useState('');
  const [participant1Id, setParticipant1Id] = useState('');
  const [participant2Id, setParticipant2Id] = useState('');

  const participantMap = useMemo(
    () =>
      participants.reduce<Record<string, Participant>>((acc, participant) => {
        acc[participant.id] = participant;
        return acc;
      }, {}),
    [participants]
  );

  const handleAddParticipant = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = participantName.trim();
    if (!trimmedName) {
      return;
    }

    const alreadyExists = participants.some(
      (participant) => participant.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (alreadyExists) {
      alert('Ce participant existe déjà.');
      return;
    }

    onAddParticipant({
      id: generateId(),
      name: trimmedName,
    });
    setParticipantName('');
  };

  const handleAddCouple = (event: React.FormEvent) => {
    event.preventDefault();
    if (!participant1Id || !participant2Id) {
      alert('Veuillez sélectionner deux participants.');
      return;
    }

    if (participant1Id === participant2Id) {
      alert('Un participant ne peut pas être dans un couple avec lui-même.');
      return;
    }

    const participant1 = participantMap[participant1Id];
    const participant2 = participantMap[participant2Id];
    if (!participant1 || !participant2) {
      alert('Sélectionnez deux participants valides.');
      return;
    }

    const duplicateCouple = couples.some((couple) => {
      const ids = [couple.participant1Id, couple.participant2Id];
      return ids.includes(participant1Id) && ids.includes(participant2Id);
    });

    if (duplicateCouple) {
      alert('Ce couple a déjà été ajouté.');
      return;
    }

    onAddCouple({
      id: generateId(),
      name: `${participant1.name} & ${participant2.name}`,
      participant1Id,
      participant2Id,
    });

    setParticipant1Id('');
    setParticipant2Id('');
  };

  return (
    <section className="participant-form">
      <div className="card">
        <h2>Ajouter un participant</h2>
        <form onSubmit={handleAddParticipant} className="form-inline">
          <input
            type="text"
            placeholder="Nom du participant"
            value={participantName}
            onChange={(event) => setParticipantName(event.target.value)}
          />
          <button type="submit" className="btn-primary">
            Ajouter
          </button>
        </form>
        <ul className="list">
          {participants.map((participant) => (
            <li key={participant.id} className="list-item">
              <span>{participant.name}</span>
              <button
                type="button"
                className="btn-link"
                onClick={() => onRemoveParticipant(participant.id)}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2>Définir les couples</h2>
        <form onSubmit={handleAddCouple} className="form-grid">

          <select
            value={participant1Id}
            onChange={(event) => setParticipant1Id(event.target.value)}
          >
            <option value="">Participant 1</option>
            {participants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.name}
              </option>
            ))}
          </select>

          <select
            value={participant2Id}
            onChange={(event) => setParticipant2Id(event.target.value)}
          >
            <option value="">Participant 2</option>
            {participants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.name}
              </option>
            ))}
          </select>

          <button type="submit" className="btn-primary">
            Ajouter le couple
          </button>
        </form>

        <ul className="list">
          {couples.map((couple) => (
            <li key={couple.id} className="list-item">
              <div>
                <strong>{couple.name}</strong>
                <div className="list-subtext">
                  {participantMap[couple.participant1Id]?.name ?? 'Participant inconnu'} &nbsp;•&nbsp;
                  {participantMap[couple.participant2Id]?.name ?? 'Participant inconnu'}
                </div>
              </div>
              <button
                type="button"
                className="btn-link"
                onClick={() => onRemoveCouple(couple.id)}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

