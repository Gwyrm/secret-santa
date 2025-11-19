// src/types/index.ts

export interface Participant {
    id: string;
    name: string;
    coupleId?: string;
  }
  
  export interface Couple {
    id: string;
    name: string;
    participant1Id: string;
    participant2Id: string;
  }
  
  export interface DrawResult {
    giverId: string;
    giverName: string;
    receiverId: string;
    receiverName: string;
    secretCode: string;
  }
  
  export interface HashedDrawResult {
    hashedCode: string;
    encryptedData: string;
  }
  