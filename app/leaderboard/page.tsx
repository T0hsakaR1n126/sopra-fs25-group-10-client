"use client";

import React, { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import styles from "@/styles/leaderboard.module.css";
import { User } from "@/types/user";
import Link from "next/link";

const LeaderboardPage: React.FC = () => {
  const apiService = useApi();
  const [paginatedEntries, setPaginatedEntries] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await apiService.get("/leaderboard") as User[];
        setPaginatedEntries(data.slice(0, itemsPerPage));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [apiService]);

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
      <p style={{ textAlign: "center", color: "#ccc", fontSize: "14px", marginBottom: "20px" }}>
        🏅 Titles are based on score: <strong>🥉MapAmateur</strong> (below 5000), <strong>🥈MapExpert</strong> (5000–9999), <strong> 🥇MapMaster</strong> (10000+)
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Leaderboard table header */}
          <div className={styles.leftPanel}>
            <div className={styles.headerRow}>
              <div className={styles.cell}>Rank</div>
              <div className={styles.cell}>Name</div>
              <div className={`${styles.cell} ${styles.cellLevel}`}>Level</div>
              <div className={`${styles.cell} ${styles.cellScore}`}>Score</div>
            </div>

            {/* Player rows */}
            {paginatedEntries.map((entry, index) => (
              <div className={getRankClass(index)} key={entry.userId ?? `fallback-${index}`}>
                {/* Rank */}
                <div className={styles.cell}>{index + 1}</div>

                {/* Avatar + Name */}
            <div className={`${styles.cell} ${styles.cellName}`}>
              <div style={{ display: "flex", alignItems: "center",  justifyContent: "center" , gap: "10px" }}>
                <img
                  src={entry.avatar}
                  alt={`${entry.username}'s avatar`}
                  style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
                />
                <Link href={`/users/${entry.userId}/profile`} style={{ color: "#0ea5e9", textDecoration: "underline" }}>
                  {entry.username}
                </Link>
              </div>
            </div>

                {/* Level */}
                <div className={`${styles.cell} ${styles.cellLevel}`}>
                  {parseInt(entry.level ?? "0") < 5000
                    ? "🥉MapAmateur"
                    : parseInt(entry.level ?? "0") < 10000
                      ? "🥈MapExpert"
                      : "🥇MapMaster"}
                </div>

                {/* Score */}
                <div className={`${styles.cell} ${styles.cellScore}`}>
                  {parseInt(entry.level ?? "0")}
                </div>
              </div>
            ))}

            {/* Empty rows to fill 10 total */}
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
