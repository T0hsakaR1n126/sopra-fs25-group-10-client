// src/types/game.ts

export interface GameScoreResponse {
    "winning team": string;
    team1: {
      name: string;
      players: string[];
      score: number;
    };
    team2: {
      name: string;
      players: string[];
      score: number;
    };
  }
  