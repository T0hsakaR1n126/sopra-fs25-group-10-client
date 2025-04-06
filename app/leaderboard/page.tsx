"use client";

import React from "react";

interface GameHistoryItem {
  id: number;
  title: string;
  date: string;
  score: string;
  duration: string;
  mode: string;
  points: number;
}

const mockData: GameHistoryItem[] = [
  {
    id: 1,
    title: "Map Genies",
    date: "01.01.2025",
    score: "5 of 10 correct",
    duration: "60 mins",
    mode: "Team Play",
    points: 1500,
  },
  {
    id: 2,
    title: "Player 1",
    date: "01.01.2025",
    score: "5 of 10 correct",
    duration: "60 mins",
    mode: "Own Play",
    points: 200,
  },
];

const GameHistory: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white px-5 py-10 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-8 text-center">Game History</h2>

      {mockData.map((game) => (
        <div
          key={game.id}
          className="bg-[#1e1e1e] rounded-lg px-5 py-3 mb-4 w-full max-w-3xl grid grid-cols-6 items-center text-sm"
        >
          <span className="break-words">#{game.id} {game.title}</span>
          <span className="break-words">{game.date}</span>
          <span className="break-words">{game.score}</span>
          <span className="break-words">{game.duration}</span>
          <span className="break-words">{game.mode}</span>
          <span className="text-right font-bold break-words">{game.points}</span>
        </div>
      ))}
    </div>
  );
};

export default GameHistory;
