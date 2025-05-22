"use client";

import React, { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import styles from "@/styles/gameHistory.module.css";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

type MatchHistoryItem = {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  gameTime: number;
  gameCreationDate: string;
  modeType: string;
  gameName: string;
};

const GameHistoryPage: React.FC = () => {
  const apiService = useApi();
  const [history, setHistory] = useState<Array<MatchHistoryItem>>([]);
  const [filter, setFilter] = useState<"All" | "Solo" | "Combat">("All");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await apiService.get(`/history/${userId}`);
        const gameHistory = (response as { gameHistory: Array<MatchHistoryItem> }).gameHistory;
        if (
          gameHistory &&
          typeof gameHistory === "object" &&
          Object.values(gameHistory).every(
            (item) =>
              item &&
              typeof item === "object" &&
              "score" in item &&
              "correctAnswers" in item &&
              "totalQuestions" in item &&
              "gameTime" in item &&
              "gameCreationDate" in item &&
              "modeType" in item
          )
        ) {
          setHistory(Object.values(gameHistory));
        } else {
          throw new Error("Invalid data format from server.");
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to fetch match history:", error.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [apiService, userId]);

  const [isLeaving, setIsLeaving] = useState(false);
  useEffect(() => {
    const handleExit = () => {
      if (!isLeaving) setIsLeaving(true);
    };

    window.addEventListener("otherExit", handleExit);
    return () => window.removeEventListener("otherExit", handleExit);
  }, [isLeaving]);

  const filtered = history.filter((entry) => {
    if (filter === "All") return true;
    return filter === "Solo" ? entry.modeType === "solo" : entry.modeType === "combat";
  });

  const paginated = filtered.slice(start, end);

  function formatTimestampToYMDHM(timestamp: string): string {
    const iso = timestamp.split(".")[0];
    const date = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function getScoreContent(score: number) {
    if (score === -1) return <span style={{ color: "#ff4d4f" }}>❌</span>;
    if (score >= 1000) return <span style={{ color: "#f7c325", fontWeight: "bold" }}>🏆 {score}</span>;
    if (score >= 500) return <span style={{ color: "#40a9ff", fontWeight: "bold" }}>🌟 {score}</span>;
    if (score === 0) return <span style={{ color: "#bbb" }}>0</span>;
    return <span style={{ color: "#fff" }}>{score}</span>;
  }

  function renderAccuracyBar(correct: number, total: number) {
    const percent = total !== 0 ? correct / total : 0;
    const blocks = 10;
    const filledBlocks = Math.round(percent * blocks);
    const bar = "█".repeat(filledBlocks) + "░".repeat(blocks - filledBlocks);
    const percentage = Math.round(percent * 100);

    return (
      <div className={styles.accuracyBar}>
        <span className={styles.barText}>[{bar}]</span>
        <span className={styles.percentageText}>{percentage}%</span>
      </div>
    );
  }

  return (
    <div className={`${styles.page} ${isLeaving ? styles.pageExit : styles.pageEnter}`}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          <span className={styles.icon}>🏆</span>
          Game History
        </h1>
        <h2 className={styles.subtitle}>
          <span style={{ color: "#f7c325" }}>★</span>
          &nbsp;Record all your performance!
        </h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className={styles.filterGroup}>
              {["All", "Solo", "Combat"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type as "All" | "Solo" | "Combat")}
                  className={`${styles.filterTab} ${filter === type ? styles.activeTab : ""}`}
                >
                  {type === "Solo" && "🎮 "}
                  {type === "Combat" && "⚔️ "}
                  {type}
                </button>
              ))}
            </div>

            <div className={styles.leftPanel}>
              <div className={styles.tableGrid}>
                {/* <div className={styles.tableHeader}>
                  <div className={`${styles.cell} ${styles.cellIndex}`}>#️⃣</div>
                  <div className={`${styles.cell} ${styles.cellName}`}>🏷️ Name</div>
                  <div className={`${styles.cell} ${styles.cellDate}`}>📅 Date</div>
                  <div className={`${styles.cell} ${styles.cellAccuracy}`}>🎯 Accuracy</div>
                  <div className={`${styles.cell} ${styles.cellDuration}`}>⏳ Duration</div>
                  <div className={`${styles.cell} ${styles.cellScore}`}>🏅 Score</div>
                </div> */}

                {paginated.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className={styles.emptyMessage}>No Available History.</div>
                  </motion.div>) : (
                  <>
                    {paginated.map((item, index) => (
                      <motion.div
                        key={index}
                        className={styles.gameCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        {/* <div className={styles.cardLine}><span>#️⃣</span>{start + index + 1}</div>
                      <div className={styles.cardLine}>
                        {getGameIcon(item.modeType)} {item.gameName}
                      </div>
                      <div className={styles.cardLine}>
                        <span>📅</span>
                        {formatTimestampToYMDHM(item.gameCreationDate)}
                      </div>
                      <div className={styles.cardLine}>
                        <span>🎯</span>
                        {item.score !== -1 ? renderAccuracyBar(item.correctAnswers, item.totalQuestions) : "❌"}
                      </div>
                      <div className={styles.cardLine}>
                        <span>⏳</span>
                        {item.gameTime !== -1 ? item.gameTime : ""}{" "}
                        {item.gameTime === -1 ? "infinite" : item.gameTime === 1 ? "min" : "mins"}
                      </div>
                      <div className={styles.cardLine}>
                        <span>🏅</span>
                        {getScoreContent(item.score)}
                      </div> */}
                        <div className={styles.rowTop}>
                          <div className={styles.leftTop}>
                            <span className={styles.index}>#{start + index + 1}</span>
                            <span className={styles.name}>🎮 {item.gameName}</span>
                          </div>
                          <div className={styles.score}>🏅 {getScoreContent(item.score)}</div>
                        </div>

                        <div className={styles.rowBottomGrid}>
                          <div className={styles.infoBox}>
                            📅 {formatTimestampToYMDHM(item.gameCreationDate)}
                          </div>
                          <div className={styles.infoBox}>
                            🎯 {item.score !== -1 ? renderAccuracyBar(item.correctAnswers, item.totalQuestions) : "❌"}
                          </div>
                          <div className={styles.infoBox}>
                            ⏳ {item.gameTime} min
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div className={styles.pagination}>
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ marginRight: "8px" }}
                      >
                        ◀ Prev
                      </button>
                      <span style={{ minWidth: 70, display: "inline-block", textAlign: "center" }}>Page {currentPage}</span>
                      <button
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={end >= filtered.length}
                        style={{ marginLeft: "8px" }}
                      >
                        Next ▶
                      </button>
                    </div>
                  </>
                )
                }
              </div>
              {/* <div className={styles.pagination}>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  style={{ marginRight: "8px" }}
                >
                  ◀ Prev
                </button>
                <span style={{ minWidth: 70, display: "inline-block", textAlign: "center" }}>Page {currentPage}</span>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={end >= filtered.length}
                  style={{ marginLeft: "8px" }}
                >
                  Next ▶
                </button>
              </div> */}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GameHistoryPage;
