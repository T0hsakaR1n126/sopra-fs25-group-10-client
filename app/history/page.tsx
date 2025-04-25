"use client";

import React, { useState, useEffect } from "react";
import { useApi } from "@/hooks/useApi";
import styles from "@/styles/gameHistory.module.css";
import { useSelector } from "react-redux";

type MatchHistoryItem = {
  // id: number;
  // name: string;
  // date: string;
  // result: string;
  // duration: string;
  // mode: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  gameTime: number;
  gameCreationDate: string;
};

// const fallbackHistory: MatchHistoryItem[] = [
//   { id: 1, name: "Map Genies", date: "01.01.2025", result: "5 of 10 correct", duration: "60 mins", mode: "Team Play", score: 1500 },
//   { id: 2, name: "Player 1", date: "01.01.2025", result: "5 of 10 correct", duration: "60 mins", mode: "Own Play", score: 200 },
//   { id: 3, name: "Team Alpha", date: "02.01.2025", result: "6 of 10 correct", duration: "55 mins", mode: "Team Play", score: 1600 },
//   { id: 4, name: "User X", date: "03.01.2025", result: "4 of 10 correct", duration: "45 mins", mode: "Own Play", score: 180 },
//   { id: 5, name: "Team Rocket", date: "04.01.2025", result: "7 of 10 correct", duration: "60 mins", mode: "Team Play", score: 1700 },
//   { id: 6, name: "Solo Master", date: "05.01.2025", result: "8 of 10 correct", duration: "40 mins", mode: "Own Play", score: 210 },
//   { id: 7, name: "Explorers", date: "06.01.2025", result: "9 of 10 correct", duration: "38 mins", mode: "Team Play", score: 1800 },
//   { id: 8, name: "Player Z", date: "07.01.2025", result: "2 of 10 correct", duration: "50 mins", mode: "Own Play", score: 150 },
//   { id: 9, name: "Geo Gods", date: "08.01.2025", result: "10 of 10 correct", duration: "35 mins", mode: "Team Play", score: 2000 },
//   { id: 10, name: "Beginner", date: "09.01.2025", result: "3 of 10 correct", duration: "60 mins", mode: "Own Play", score: 170 },
// ];

const GameHistoryPage: React.FC = () => {
  const apiService = useApi();
  const [history, setHistory] = useState<Map<string, MatchHistoryItem>>(new Map());
  const [filter, setFilter] = useState<"All" | "Single" | "Team">("All");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);

        const response = await apiService.get(`/history/${userId}`);
        const gameHistory = (response as { gameHistory: Map<string, MatchHistoryItem> }).gameHistory;

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
              "gameCreationDate" in item
          )
        ) {
          setHistory(new Map(Object.entries(gameHistory)));
        } else {
          throw new Error("Invalid data format from server.");
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to fetch match history:", error.message);
        }
        // setHistory(fallbackHistory);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);


  const filtered = Array.from(history.entries()).filter(() => {
    // if (filter === "All") return true;
    // return filter === "Team" ? entry.mode === "Team Play" : entry.mode === "Own Play";
    return true;
  });

  const paginated = filtered.slice(0, currentPage * itemsPerPage);
  const hasMore = paginated.length < filtered.length;

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  return (
    <div style={{ paddingTop: "80px" }}>
      <div className={styles.container}>
        <h2 className={styles.title}>Game History</h2>
        <h2 className={styles.subtitle}>Record all your performance!</h2>
        {/* {error && <p style={{ color: "red" }}>{error}</p>} */}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            {/* ✅ Filter buttons */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              {/* {["All", "Single", "Team"].map((type) => ( */}
              {["All"].map((type) => (
                <button
                  key={type}
                  // onClick={() => setFilter(type as "All" | "Single" | "Team")}
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

            <div className={styles.leftPanel}>
              <div className={styles.headerRow}>
                <div className={`${styles.cell} ${styles.cellIndex}`}>Index</div>
                <div className={`${styles.cell} ${styles.cellName}`}>Name</div>
                <div className={`${styles.cell} ${styles.cellDate}`}>Date</div>
                <div className={`${styles.cell} ${styles.cellAccuracy}`}>Accuracy</div>
                <div className={`${styles.cell} ${styles.cellDuration}`}>Duration</div>
                <div className={`${styles.cell} ${styles.cellScore}`}>Score</div>
              </div>

              {paginated.length === 0 ? (
                <div className={styles.emptyMessage}>No Available History</div>
              ) : (
                <>
                  {paginated.map(([key, item], index) => (
                    <div className={styles.lobbyCard} key={key}>
                      <div className={`${styles.cell} ${styles.cellIndex}`}>{index + 1}</div>
                      <div className={`${styles.cell} ${styles.cellName}`}>{key}</div>
                      <div className={`${styles.cell} ${styles.cellDate} ${styles.cellCenter}`}>{item.gameCreationDate}</div>
                      <div className={`${styles.cell} ${styles.cellAccuracy}`}>
                        {item.correctAnswers} of {item.totalQuestions} correct
                      </div>
                      <div className={`${styles.cell} ${styles.cellDuration}`}>
                        {item.gameTime} {item.gameTime === 1 ? "min" : "mins"}
                      </div>
                      <div className={`${styles.cell} ${styles.cellScore}`}>
                        {item.score === -1 ? "give up" : item.score}
                      </div>
                    </div>
                  ))}

                  {[...Array(Math.max(0, 7 - paginated.length))].map((_, idx) => (
                    <div className={styles.lobbyCard} key={`empty-${idx}`} style={{ opacity: 0.2 }}>
                      <div className={`${styles.cell} ${styles.cellIndex}`}>&nbsp;</div>
                      <div className={`${styles.cell} ${styles.cellName}`}>&nbsp;</div>
                      <div className={`${styles.cell} ${styles.cellDate} ${styles.cellCenter}`}>&nbsp;</div>
                      <div className={`${styles.cell} ${styles.cellAccuracy}`}>&nbsp;</div>
                      <div className={`${styles.cell} ${styles.cellDuration}`}>&nbsp;</div>
                      <div className={`${styles.cell} ${styles.cellScore}`}>&nbsp;</div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {hasMore && (
              <div
                className={styles.scrollDownBtn}
                onClick={handleLoadMore}
                title="Load more"
              >
                ⬇️
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GameHistoryPage;