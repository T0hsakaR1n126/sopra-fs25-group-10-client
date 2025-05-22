"use client";

import React, { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import styles from "@/styles/gameHistory.module.css";
import { useSelector } from "react-redux";




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
  const itemsPerPage = 6;
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

  const filtered = history.filter((entry) => {
    if (filter === "All") return true;
    return filter === "Solo" ? entry.modeType === "solo" : entry.modeType === "combat";
  });

  const paginated = filtered.slice(start, end);

  function formatTimestampToYMDHM(timestamp: string): string {
    const iso = timestamp.split(".")[0] + "Z";
    const date = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function getGameIcon(mode: string) {
    if (mode.toLowerCase() === "solo") return "🎮";
    if (mode.toLowerCase() === "combat") return "⚔️";
    return "🎲";
  }

  function getAccuracyIcon(correct: number, total: number) {
    if (total === 0) return "❓";
    if (correct === total) return "🥇";
    if (correct === 0) return "❌";
    if (correct / total >= 0.7) return "🌟";
    return "";
  }

  function getScoreContent(score: number) {
    if (score === -1) return <span style={{ color: "#ff4d4f" }}>🚩 Give Up</span>;
    if (score >= 1000) return <span style={{ color: "#f7c325", fontWeight: "bold" }}>🏆 {score}</span>;
    if (score >= 500) return <span style={{ color: "#40a9ff", fontWeight: "bold" }}>🌟 {score}</span>;
    if (score === 0) return <span style={{ color: "#bbb" }}>😢 0</span>;
    return <span style={{ color: "#fff" }}>{score}</span>;
  }

  return (
    <div style={{ paddingTop: "80px" }}>
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
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              {["All", "Solo", "Combat"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type as "All" | "Solo" | "Combat")}
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
                  {type === "Solo" && "🎮 "}
                  {type === "Combat" && "⚔️ "}
                  {type}
                </button>
              ))}
            </div>

            <div className={styles.leftPanel}>
              <div className={styles.headerRow}>
                <div className={`${styles.cell} ${styles.cellIndex}`}>#</div>
                <div className={`${styles.cell} ${styles.cellName}`}>Name</div>
                <div className={`${styles.cell} ${styles.cellDate}`}>Date</div>
                <div className={`${styles.cell} ${styles.cellAccuracy}`}>Accuracy</div>
                <div className={`${styles.cell} ${styles.cellDuration}`}>Duration</div>
                <div className={`${styles.cell} ${styles.cellScore}`}>Score</div>
              </div>

              {paginated.length === 0 ? (
                <div className={styles.emptyMessage} style={{ fontSize: "1.1em" }}>
                  😅 No Available History. Try joining a game!
                </div>
              ) : (
                <>
                  {paginated.map((item, index) => (
                    <div className={styles.lobbyCard} key={index} style={{
                      opacity: item.score === -1 ? 0.65 : 1,
                      background: item.score === -1
                        ? "linear-gradient(90deg,#ece9e6,#fff6)"
                        : undefined
                    }}>
                      <div className={`${styles.cell} ${styles.cellIndex}`}>{start + index + 1}</div>
                      <div className={`${styles.cell} ${styles.cellName}`}>
                        {getGameIcon(item.modeType)} {item.gameName}
                      </div>
                      <div className={`${styles.cell} ${styles.cellDate} ${styles.cellCenter}`}>
                        📅 {formatTimestampToYMDHM(item.gameCreationDate)}
                      </div>
                      <div className={`${styles.cell} ${styles.cellAccuracy}`}>
                        {getAccuracyIcon(item.correctAnswers, item.totalQuestions)}{" "}
                        {item.totalQuestions === 0
                          ? "No Data"
                          : `${item.correctAnswers} of ${item.totalQuestions} correct`}
                      </div>
                      <div className={`${styles.cell} ${styles.cellDuration}`}>
                        ⏳ {item.gameTime !== -1 ? item.gameTime : ""}{" "}
                        {item.gameTime === -1
                          ? "infinite"
                          : item.gameTime === 1
                          ? "min"
                          : "mins"}
                      </div>
                      <div className={`${styles.cell} ${styles.cellScore}`}>
                        {getScoreContent(item.score)}
                      </div>
                    </div>
                  ))}

                  <div className={styles.pagination} style={{ marginTop: "10px" }}>
                        <button
                          onClick={() => setCurrentPage((p) => p - 1)}
                          disabled={currentPage === 1}
                          title={currentPage === 1 ? "Already at the first page!" : ""}
                        >
                          ◀ Prev
                        </button>
                        <span style={{ minWidth: 70, display: "inline-block", textAlign: "center" }}>
                          Page {currentPage}
                        </span>
                        <button
                          onClick={() => setCurrentPage((p) => p + 1)}
                          disabled={end >= filtered.length}
                          title={end >= filtered.length ? "Already at the last page!" : ""}
                          style={{ marginLeft: "8px" }}
                        >
                           Next ▶
                        </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GameHistoryPage;
