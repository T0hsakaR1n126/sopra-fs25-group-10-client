"use client";

import React, { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import styles from "@/styles/leaderboard.module.css";
import { User } from "@/types/user";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const medals = ["🏆", "🥈", "🥉"];

const LeaderboardPage: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  const [paginatedEntries, setPaginatedEntries] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  const [isLeaving, setIsLeaving] = useState(false);
  useEffect(() => {
    const handleExit = () => {
      if (!isLeaving) setIsLeaving(true);
    };

    window.addEventListener("otherExit", handleExit);
    return () => window.removeEventListener("otherExit", handleExit);
  }, [isLeaving]);

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

  return (
    <div className={`${styles.page} ${isLeaving ? styles.pageExit : styles.pageEnter}`}>
      <h2 className={styles.title}>🌍 Global Leaderboard</h2>
      <h2 className={styles.subtitle}>👇 Top 10 players are shown here!</h2>
      <p style={{ textAlign: "center", color: "#ccc", fontSize: "14px", marginBottom: "20px" }}>
        🏅 Titles: <strong>🗺️MapAmateur</strong> (below 5000), <strong>🧭MapExpert</strong> (5000–9999), <strong> 🛰️MapMaster</strong> (10000+)
      </p>

      {loading ? (
        <p style={{ textAlign: "center", color: "#fff", fontSize: "1.2em" }}>Loading...</p>
      ) : (
        <div className={styles.leftPanel}>
          {/* 表头 */}
          {/* <div className={styles.headerRow}>
            <div className={styles.cell}>Rank</div>
            <div className={styles.cell}>Name</div>
            <div className={`${styles.cell} ${styles.cellLevel}`}>Level</div>
            <div className={`${styles.cell} ${styles.cellScore}`}>Score</div>
          </div> */}

          {/* player list */}
          {paginatedEntries.map((entry, index) => (
            <motion.div
              key={entry.userId ?? index}
              className={`${styles.leaderCard} ${index === 0 ? styles.firstCard : index === 1 ? styles.secondCard : index === 2 ? styles.thirdCard : ""
                }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => { router.push(`/users/${entry.userId}/profile`) }}
            >
              <div className={styles.rankSection}>
                {index < 3 ? medals[index] : index + 1}
              </div>
              <div className={styles.avatarSection}>
                <img src={entry.avatar ?? ""} alt="avatar" className={styles.avatarImg} />
              </div>
              <div className={styles.infoSection}>
                <div className={styles.username}>{entry.username}</div>
              </div>
              <div className={styles.levelText}>
                <div
                  style={{
                    marginTop: 4,
                    padding: "4px 12px",
                    backgroundColor:
                      Number(entry.level) * 100 >= 10000 ? "#d4af37" :
                        Number(entry.level) * 100 >= 5000 ? "#40a9ff" :
                          "#73d13d",
                    color: "#000",
                    fontWeight: "bold",
                    borderRadius: "999px",
                    fontSize: "12px",
                    textAlign: "center",
                    display: "inline-block",
                    boxShadow: "0 0 6px rgba(0,0,0,0.2)",
                  }}
                >
                  {Number(entry.level) * 100 >= 10000
                    ? "MapMaster"
                    : Number(entry.level) * 100 >= 5000
                      ? "MapExpert"
                      : "MapAmateur"}
                </div>
              </div>
              <div className={styles.scoreSection}>
                {parseInt(entry.level ?? "0")}
              </div>
            </motion.div>
          ))}

          {/* 空白行填满10行 */}
          {/* {[...Array(Math.max(0, 10 - paginatedEntries.length))].map((_, idx) => (
            <div className={styles.lobbyCard} key={`empty-${idx}`} style={{ opacity: 0.14 }}>
              <div className={styles.cell}>&nbsp;</div>
              <div className={styles.cell}>&nbsp;</div>
              <div className={styles.cell}>&nbsp;</div>
              <div className={styles.cell}>&nbsp;</div>
            </div>
          ))} */}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
