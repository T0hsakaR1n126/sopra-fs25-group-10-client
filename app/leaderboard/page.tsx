"use client";

import React, { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi"; // ✅ 引入 API Hook
import "./leaderboard.css";

type LeaderboardEntry = {
  id: number;
  name: string;
  score: number;
  type: "Team" | "Single";
};

const fallbackLeaderboard: LeaderboardEntry[] = [
  { id: 1, name: "Map Genies", score: 1500, type: "Team" },
  { id: 2, name: "Map Maniacs", score: 1499, type: "Team" },
  { id: 3, name: "Map Mangoes", score: 1492, type: "Team" },
  { id: 4, name: "Map Gooses", score: 1450, type: "Team" },
  { id: 5, name: "Map Maniacs", score: 1430, type: "Team" },
  { id: 6, name: "Map Dragons", score: 1400, type: "Team" },
  { id: 7, name: "Solo Stars", score: 1390, type: "Single" },
  { id: 8, name: "Solo Beast", score: 1375, type: "Single" },
  { id: 9, name: "Solo X", score: 1350, type: "Single" },
];

export default function LeaderboardPage() {
  const apiService = useApi(); // ✅ 获取 API 客户端

  const [entries, setEntries] = useState<LeaderboardEntry[]>(fallbackLeaderboard);
  const [filter, setFilter] = useState<"Team" | "Single">("Team");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await apiService.get("/leaderboard") as LeaderboardEntry[];
        setEntries(data);
      } catch (e) {
        console.error(e);
        setError("Failed to load leaderboard. Showing fallback data.");
        setEntries(fallbackLeaderboard);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const filtered = entries
    .filter((entry) => entry.type === filter)
    .sort((a, b) => b.score - a.score);

  const paginated = filtered.slice(0, currentPage * itemsPerPage);
  const hasMore = paginated.length < filtered.length;

  const getRankClass = (index: number): string => {
    if (index === 0) return "lobbyCard first";
    if (index === 1) return "lobbyCard second";
    if (index === 2) return "lobbyCard third";
    return "lobbyCard";
  };

  return (
    <div className="container page">
      <h2 className="title">Global Leaderboard</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Filter buttons */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", justifyContent: "center" }}>
            {["Team", "Single"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as "Team" | "Single")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: "2px solid white",
                  backgroundColor: filter === type ? "#0ea5e9" : "transparent",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Leaderboard list */}
          <div className="leftPanel">
            {paginated.map((entry, index) => (
              <div className={getRankClass(index)} key={entry.id}>
                <div>{index + 1}. {entry.name}</div>
                <div>{entry.score}</div>
              </div>
            ))}

            {[...Array(Math.max(0, 7 - paginated.length))].map((_, idx) => (
              <div className="lobbyCard" key={`empty-${idx}`} style={{ opacity: 0.2 }} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div
              className="scrollDownBtn"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              title="Load more"
            >
              ⬇️
            </div>
          )}
        </>
      )}
    </div>
  );
}
