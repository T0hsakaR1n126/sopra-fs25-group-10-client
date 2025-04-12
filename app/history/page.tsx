"use client";

import React, { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import "./gamehistory.css";

// ✅ All mock data (used for simulated pagination)
const fallbackHistory = [
  { id: 1, name: "Map Genies", date: "01.01.2025", result: "5 of 10 correct", duration: "60 mins", mode: "Team Play", score: 1500 },
  { id: 2, name: "Player 1", date: "01.01.2025", result: "5 of 10 correct", duration: "60 mins", mode: "Own Play", score: 200 },
  { id: 3, name: "Team Alpha", date: "02.01.2025", result: "6 of 10 correct", duration: "55 mins", mode: "Team Play", score: 1600 },
  { id: 4, name: "User X", date: "03.01.2025", result: "4 of 10 correct", duration: "45 mins", mode: "Own Play", score: 180 },
  { id: 5, name: "Team Rocket", date: "04.01.2025", result: "7 of 10 correct", duration: "60 mins", mode: "Team Play", score: 1700 },
  { id: 6, name: "Solo Master", date: "05.01.2025", result: "8 of 10 correct", duration: "40 mins", mode: "Own Play", score: 210 },
  { id: 7, name: "Explorers", date: "06.01.2025", result: "9 of 10 correct", duration: "38 mins", mode: "Team Play", score: 1800 },
  { id: 8, name: "Player Z", date: "07.01.2025", result: "2 of 10 correct", duration: "50 mins", mode: "Own Play", score: 150 },
  { id: 9, name: "Geo Gods", date: "08.01.2025", result: "10 of 10 correct", duration: "35 mins", mode: "Team Play", score: 2000 },
  { id: 10, name: "Beginner", date: "09.01.2025", result: "3 of 10 correct", duration: "60 mins", mode: "Own Play", score: 170 },
];

export default function GameHistoryPage() {
  const apiService = useApi();
  const [history, setHistory] = useState(fallbackHistory);
  const [filter, setFilter] = useState<"All" | "Single" | "Team">("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Load data (can be replaced with real API call)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // const data = await apiService.get("/history"); // Real API endpoint
        // setHistory(data);
        setHistory(fallbackHistory); // Use fallback mock data
      } catch (e) {
        setError("Failed to load data. Displaying fallback records.");
        setHistory(fallbackHistory);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // ✅ Filtered and paginated data
  const filtered = history.filter((entry) => {
    if (filter === "All") return true;
    return filter === "Team" ? entry.mode === "Team Play" : entry.mode === "Own Play";
  });

  const paginated = filtered.slice(0, currentPage * itemsPerPage);
  const hasMore = paginated.length < filtered.length;

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <div className="container page">
      <h2 className="title">Game History</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* ✅ Filter buttons */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            {["All", "Single", "Team"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as any)}
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

          {/* ✅ Record list */}
          <div className="leftPanel">
            {paginated.map((item) => (
              <div className="lobbyCard" key={item.id}>
                <div>{item.id} {item.name}</div>
                <div>{item.date}</div>
                <div>{item.result}</div>
                <div>{item.duration}</div>
                <div>{item.mode}</div>
                <div>{item.score}</div>
              </div>
            ))}

            {[...Array(Math.max(0, 7 - paginated.length))].map((_, idx) => (
              <div className="lobbyCard" key={`empty-${idx}`} style={{ opacity: 0.2 }} />
            ))}
          </div>

          {/* ✅ Load more button */}
          {hasMore && (
            <div
              className="scrollDownBtn"
              onClick={handleLoadMore}
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
