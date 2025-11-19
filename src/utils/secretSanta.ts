// src/utils/secretSanta.ts

import type { Participant, Couple, DrawResult } from '../types';
import { generateSecretCode } from './crypto';

/**
 * Vérifie si deux participants sont en couple
 */
function areCouple(
  participant1Id: string,
  participant2Id: string,
  couples: Couple[]
): boolean {
  return couples.some(
    (couple) =>
      (couple.participant1Id === participant1Id &&
        couple.participant2Id === participant2Id) ||
      (couple.participant1Id === participant2Id &&
        couple.participant2Id === participant1Id)
  );
}

/**
 * Algorithme de tirage au sort avec contraintes
 */
export function performDraw(
  participants: Participant[],
  couples: Couple[]
): DrawResult[] | null {
  const maxAttempts = 1000;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const results: DrawResult[] = [];
    const availableReceivers = [...participants];
    let valid = true;

    // Mélanger les participants
    const shuffledGivers = [...participants].sort(() => Math.random() - 0.5);

    for (const giver of shuffledGivers) {
      // Filtrer les receveurs invalides
      const validReceivers = availableReceivers.filter(
        (receiver) =>
          receiver.id !== giver.id && // Pas soi-même
          !areCouple(giver.id, receiver.id, couples) // Pas son/sa partenaire
      );

      if (validReceivers.length === 0) {
        valid = false;
        break;
      }

      // Choisir un receveur aléatoire parmi les valides
      const randomIndex = Math.floor(Math.random() * validReceivers.length);
      const receiver = validReceivers[randomIndex];

      results.push({
        giverId: giver.id,
        giverName: giver.name,
        receiverId: receiver.id,
        receiverName: receiver.name,
        secretCode: generateSecretCode(),
      });

      // Retirer le receveur de la liste
      const receiverIndex = availableReceivers.findIndex(
        (p) => p.id === receiver.id
      );
      availableReceivers.splice(receiverIndex, 1);
    }

    if (valid) {
      return results;
    }
  }

  return null; // Impossible de trouver une solution
}
