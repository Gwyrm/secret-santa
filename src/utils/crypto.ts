// src/utils/crypto.ts

/**
 * Génère un code secret aléatoire
 */
export function generateSecretCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
  
  /**
   * Hash un code avec SHA-256
   */
  async function hashCode(code: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Chiffre les données du destinataire avec le code comme clé
   */
  async function encryptData(data: string, code: string): Promise<string> {
    const encoder = new TextEncoder();
    
    // Créer une clé de chiffrement depuis le code
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(code.padEnd(32, '0')),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('secret-santa-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    // Générer un IV aléatoire
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Chiffrer les données
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );
    
    // Combiner IV et données chiffrées
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);
    
    // Convertir en base64
    return btoa(String.fromCharCode(...combined));
  }
  
  /**
   * Déchiffre les données avec le code
   */
  async function decryptData(encryptedData: string, code: string): Promise<string> {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    // Décoder le base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    // Extraire IV et données chiffrées
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    // Créer la clé de déchiffrement
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(code.padEnd(32, '0')),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('secret-santa-salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    // Déchiffrer
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );
    
    return decoder.decode(decryptedBuffer);
  }
  
  /**
   * Crée une paire hash/données chiffrées pour un résultat
   */
  export async function createHashedResult(
    result: { giverName: string; receiverName: string; secretCode: string }
  ): Promise<{ hashedCode: string; encryptedData: string }> {
    const hashedCode = await hashCode(result.secretCode);
    const encryptedData = await encryptData(
      JSON.stringify({
        giver: result.giverName,
        receiver: result.receiverName
      }),
      result.secretCode
    );
    
    return { hashedCode, encryptedData };
  }
  
  /**
   * Vérifie un code et retourne les données déchiffrées
   */
  export async function verifyAndDecrypt(
    code: string,
    hashedResults: Array<{ hashedCode: string; encryptedData: string }>
  ): Promise<{ giver: string; receiver: string } | null> {
    const inputHash = await hashCode(code);
    
    // Trouver le résultat correspondant
    const result = hashedResults.find(r => r.hashedCode === inputHash);
    
    if (!result) {
      return null;
    }
    
    try {
      const decrypted = await decryptData(result.encryptedData, code);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Erreur de déchiffrement:', error);
      return null;
    }
  }
  