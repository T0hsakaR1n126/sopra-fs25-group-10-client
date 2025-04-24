"use client";

import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useRouter } from 'next/navigation';
import styles from "@/styles/results.module.css";
import { useApi } from "@/hooks/useApi";

const Results = () => {
  const router = useRouter();
  const apiService = useApi();
  const scoreBoard = useSelector(
    (state: { game: { scoreBoard: Record<string, number> } }) => state.game.scoreBoard
  );
  const username = useSelector(
    (state: { user: { username: string } }) => state.user.username
  );
  const gameId = useSelector(
    (state: { game: { gameId: string } }) => state.game.gameId
  );
  const ownerId = useSelector(
    (state: { game: { ownerId: string } }) => state.game.ownerId
  );
  const userId = useSelector(
    (state: { user: { userId: string } }) => state.user.userId
  );

  const entries = Object.entries(scoreBoard);

  const handleBackToLobby = async () => {
    if (String(userId) === String(ownerId)) {
      apiService.put(`/save/${gameId}`, {})
        .then(() => alert("Game saved successfully!"))
        .catch((error) => {
          alert(`Error saving game: ${error.message}`);
          router.push("/game");
        });
    }
    router.push("/lobby");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.aboveBox}>
        <span className={styles.congratsText}>🎉 Congratulations 🎉</span>
      </div>
      <div className={styles.resultsContainer}>
        <h2 className={styles.resultsTitle}>ScoreBoard</h2>
        <ul className={styles.resultsList}>
          {entries.length === 0 ? (
            <li style={{ color: "white", textAlign: "center" }}>Loading...</li>
          ) : (
            <>
              <li className={styles.resultsHeader}>
                <span className={styles.rank}>Rank</span>
                <span className={styles.user}>Username</span>
                <span className={styles.score}>Score</span>
              </li>
              {entries.map(([user, score], index) => (
                <li
                  key={user}
                  className={`${styles.resultsItem} ${user === username ? styles.currentUser : ""
                    }`}
                >
                  <span className={styles.rank}>{index + 1}</span>
                  <span className={styles.user}>{user}</span>
                  <span className={styles.score}>{score === -1 ? "give up" : score}</span>
                </li>
              ))}
            </>
          )}
        </ul>
        <div className={styles.belowBox}>
          <button className={styles.backButton} onClick={handleBackToLobby}>
            Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
