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

export interface Game {
    gameId: string | null;
    gameName: string | null;
    password: string | null;
    modeType: string | null;
    time: string | null;
    playersNumber: string | null;
    realPlayersNumber: string | null;
    ownerId: string | null;
    endTime: string | null;
  }