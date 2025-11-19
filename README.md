# 🎅 Père Noël Secret

Application React (Vite + TypeScript) pour organiser un Secret Santa 100 % confidentiel.  
Tout se déroule côté navigateur : l’organisateur configure le tirage, génère des codes uniques et partage un lien contenant uniquement des données chiffrées. Chaque participant révèle son destinataire en autonomie, sans que l’organisateur ne voie les associations finales.

## ⚙️ Fonctionnement global

1. **Ajout des participants**  
   - Saisie d’un prénom/pseudo par ligne.  
   - Suppression possible à tout moment.
2. **Gestion des couples / contraintes**  
   - L’organisateur indique les duos qui ne doivent pas se tirer entre eux (couples, colocs, etc.).  
   - Le formulaire empêche les doublons et les auto-sélections.
3. **Tirage intelligent**  
   - Algorithme `performDraw` tente jusqu’à 1000 permutations pour respecter toutes les contraintes.  
   - S’il n’y arrive pas, l’appli invite à ajuster les couples ou à ajouter des participants.
4. **Génération des codes**  
   - Chaque donneur reçoit un code secret de 8 caractères (`A-Z` + chiffres).  
   - Pour chaque code, l’appli crée un hash SHA-256 et chiffre les noms donneur/destinataire avec AES-256-GCM (`createHashedResult`).
5. **Partage sécurisé**  
   - Le composant `DrawResult` permet de copier un message par participant, de télécharger ou d’imprimer tous les codes.  
   - Un lien de révélation est généré : `https://.../secret-santa?data=<payload>` où `<payload>` est compressé avec LZ-String (`encodeHashPayload`). Aucun serveur n’enregistre les données.
6. **Révélation côté participant**  
   - En cliquant sur l’onglet « 🎁 Révélation », chacun saisit son code.  
   - Le composant `RevealPage` vérifie le hash et déchiffre localement (`verifyAndDecrypt`). Si le code est valide, seul le destinataire correspondant est affiché.  
   - Aucun autre couple n’apparaît, même pour l’organisateur.

## 🚀 Prise en main

### Pré-requis
- Node.js ≥ 18
- npm (fourni avec Node)

### Installation
```bash
npm install
```

### Développement local
```bash
npm run dev
```
Le serveur Vite s’ouvre par défaut sur `http://localhost:5173`.

### Qualité & build
```bash
npm run lint    # ESLint
npm run build   # Bundle de production
npm run preview # Prévisualisation du build
```

## 🧭 Parcours utilisateur

- **Organisation** (`view = admin`)  
  - Formulaire pour ajouter participants et couples.  
  - Bouton « Effectuer le tirage » actif dès 3 participants.  
  - Après tirage, accès aux codes + lien partageable + reset complet.

- **Révélation** (`view = reveal`)  
  - Page dédiée aux participants, accessible via le lien partagé (`?data=...`).  
  - Interface guidée : champ code, animation de déchiffrement, message de succès ou erreurs pédagogiques (code manquant, invalide, données absentes).

## 🔐 Sécurité & confidentialité

- Aucune API ni base de données : toutes les informations restent dans l’URL ou la mémoire du navigateur.
- Hash des codes via SHA-256, chiffrement AES-256-GCM avec dérivation PBKDF2.
- Les données chiffrées sont compressées avant d’être ajoutées au lien, ce qui réduit la taille et empêche toute lecture en clair.
- L’organisateur peut supprimer toutes les données locales via « 🔄 Nouveau tirage ».

## ✅ Bonnes pratiques d’organisation

- Vérifier qu’il y a toujours au moins trois participants pour éviter les impasses.
- Partager les codes par un canal privé (SMS, DM, mail individuel).
- Envoyer le lien `?data=...` en même temps que les codes pour éviter les oublis.
- Conseiller aux participants de conserver leur code jusqu’à la révélation finale.

---
🎄 Joyeuses fêtes et bon tirage !

