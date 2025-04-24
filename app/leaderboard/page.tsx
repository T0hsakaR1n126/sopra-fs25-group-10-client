"use client";

import React, { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import "./leaderboard.css";
import { User } from "@/types/user";

export default function LeaderboardPage() {
  const apiService = useApi(); 
  // const [entries, setEntries] = useState<User[]>([]);
  const [paginatedEntries, setPaginatedEntries] = useState<User[]>([]);
  // const [filter, setFilter] = useState<"Team" | "Solo">("Team");
  const [filter, setFilter] = useState<"Team" | "Solo">("Solo");
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await apiService.get("/leaderboard") as User[];
        // setEntries(data);
        setPaginatedEntries(data.slice(0, itemsPerPage));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // const paginated = filtered.slice(0, currentPage * itemsPerPage);
  // const hasMore = paginatedEntries.length < entries.length;

  const getRankClass = (index: number): string => {
    if (index === 0) return "lobbyCard first";
    if (index === 1) return "lobbyCard second";
    if (index === 2) return "lobbyCard third";
    return "lobbyCard";
  };

  return (
    <div className="container page">
      <h2 className="title">Global Leaderboard</h2>
      <h2 className="subtitle">Top 8 players are shown here!</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Filter buttons */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", justifyContent: "center" }}>
            {/* {["Team", "Solo"].map((type) => ( */}
            {["Solo"].map((type) => (
              <button
                key={type}
                // onClick={() => setFilter(type as "Team" | "Solo")}
                onClick={() => setFilter(type as "Solo")}
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
            {paginatedEntries.map((entry, index) => (
              <div className={getRankClass(index)} key={entry.userId ?? `fallback-${index}`} style={{ display: "grid", gridTemplateColumns: "200px 1fr 0px 0px", alignItems: "center", gap: "12px" }}>
                <div>{index + 1}. {entry.username}</div>
                <div>{parseInt(entry.level ?? "0") < 5000 ? "MapAmateur" : (parseInt(entry.level ?? "0") < 10000 ? "MapExpert" : "MapMaster")}</div>
                <div>{parseInt(entry.level ?? "0")}</div>
              </div>
            ))}

            {[...Array(Math.max(0, 8 - paginatedEntries.length))].map((_, idx) => (
              <div className="lobbyCard" key={`empty-${idx}`} style={{ opacity: 0.2 }} />
            ))}
          </div>

          {/* Load more */}
          {/* {hasMore && (
            <div
              className="scrollDownBtn"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              title="Load more"
            >
              ⬇️
            </div>
          )} */}
        </>
      )}
    </div>
  );
}
