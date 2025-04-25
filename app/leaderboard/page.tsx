"use client";

import React, { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import styles from "@/styles/leaderboard.module.css";
import { User } from "@/types/user";

const LeaderboardPage: React.FC = () => {
  const apiService = useApi();
  // const [entries, setEntries] = useState<User[]>([]);
  const [paginatedEntries, setPaginatedEntries] = useState<User[]>([]);
  // const [filter, setFilter] = useState<"Team" | "Solo">("Team");
  const [filter, setFilter] = useState<"All" | "Solo">("All");
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

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
    if (index === 0) return `${styles.lobbyCard} ${styles.first}`;
    if (index === 1) return `${styles.lobbyCard} ${styles.second}`;
    if (index === 2) return `${styles.lobbyCard} ${styles.third}`;
    return styles.lobbyCard;
  };

  return (
    <div className={styles.containerPage}>
      <h2 className={styles.title}>Global Leaderboard</h2>
      <h2 className={styles.subtitle}>Top 10 players are shown here!</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Filter buttons */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px", justifyContent: "center" }}>
            {["All"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as "All")}
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
          <div className={styles.leftPanel}>
            <div className={styles.headerRow}>
              <div className={styles.cell}>Rank</div>
              <div className={styles.cell}>Name</div>
              <div className={`${styles.cell} ${styles.cellLevel}`}>Level</div>
              <div className={`${styles.cell} ${styles.cellScore}`}>Score</div>
            </div>

            {paginatedEntries.map((entry, index) => (
              <div className={getRankClass(index)} key={entry.userId ?? `fallback-${index}`}>
                <div className={styles.cell}>{index + 1}</div>
                <div className={styles.cell}>{entry.username}</div>
                <div className={`${styles.cell} ${styles.cellLevel}`}>
                  {parseInt(entry.level ?? "0") < 5000
                    ? "MapAmateur"
                    : parseInt(entry.level ?? "0") < 10000
                      ? "MapExpert"
                      : "MapMaster"}
                </div>
                <div className={`${styles.cell} ${styles.cellScore}`}>
                  {parseInt(entry.level ?? "0")}
                </div>
              </div>
            ))}

            {[...Array(Math.max(0, 10 - paginatedEntries.length))].map((_, idx) => (
              <div className={styles.lobbyCard} key={`empty-${idx}`} style={{ opacity: 0.2 }}>
                <div className={styles.cell}>&nbsp;</div>
                <div className={styles.cell}>&nbsp;</div>
                <div className={styles.cell}>&nbsp;</div>
                <div className={styles.cell}>&nbsp;</div>
              </div>
            ))}
          </div>

        </>
      )}
    </div>
  );
};

export default LeaderboardPage;
