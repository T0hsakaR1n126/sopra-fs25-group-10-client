"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'next/navigation';
import styles from "@/styles/results.module.css";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { updateUserInfo } from "@/userSlice";
import { motion } from "framer-motion";

const Results = () => {
  const router = useRouter();
  const apiService = useApi();
  const dispatch = useDispatch();
  const scoreBoard = useSelector(
    (state: { game: { scoreBoard?: Map<string, number> } }) => state.game.scoreBoard ?? {}
  );
  const username = useSelector(
    (state: { user: { username: string } }) => state.user.username
  );
  const userId = useSelector(
    (state: { user: { userId: string } }) => state.user.userId
  );
  const gameMode = useSelector(
    (state: { game: { modeType: string } }) => state.game.modeType
  );
  const gameId = useSelector(
    (state: { game: { gameId: string } }) => state.game.gameId
  );

  const entries = Object.entries(scoreBoard) as [string, number][];

  const handleBack = async () => {
    if (gameMode === "combat") {
      try {
        const response: User = await apiService.get<User>(`/users/${userId}`);
        dispatch(updateUserInfo({
          username: response.username ?? "",
          avatar: response.avatar ?? "",
          level: Number(response.level) / 100,
        }));
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while fetching user:\n${error.message}`);
          router.push("/game");
        } else {
          console.error("An unknown error occurred while fetching user.");
        }
      }

      router.push(`/game/start/${gameId}`);
    } else {
      router.push("/game");
    }
  }

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
              {entries.sort((a, b) => b[1] - a[1]).map(([user, score], index) => (
                <li
                  key={user}
                  className={`${styles.resultsItem} ${user === username ? styles.currentUser : ""}`}
                >
                  <span className={styles.rank}>
                    {index === 0 ? <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    >
                      🥇
                    </motion.span> : index === 1 ? <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    >
                      🥈
                    </motion.span> : index === 2 ? <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    >
                      🥉
                    </motion.span> : index + 1}
                  </span>
                  <span className={styles.user}>{user}</span>
                  <span className={styles.score}>{score === -1 ? "❌" : score}</span>
                </li>
              ))}
            </>
          )}
        </ul>
        <div className={styles.belowBox}>
          <button className={styles.backButton} onClick={handleBack}>
            {gameMode === "solo" ? "Back to Hall" : "Back"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
