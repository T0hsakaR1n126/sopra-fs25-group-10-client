"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'next/navigation';
import styles from "@/styles/results.module.css";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { updateUserInfo } from "@/userSlice";
import { Client } from "@stomp/stompjs";
import { Game } from "@/types/game";
import { clearGameState, gameInitialize, setRecreateGame } from "@/gameSlice";
import { handleJoinGame } from "@/lobby/join/handleJoinGame";

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
  const ownerId = useSelector(
    (state: { game: { ownerId: string } }) => state.game.ownerId
  ); 
  const recreateGame = useSelector(
    (state: { game: { recreateGame: Game } }) => state.game.recreateGame
  ); 

  const entries = Object.entries(scoreBoard) as [string, number][];

  useEffect(() => {
    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws",
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("STOMP connected");

        stompClient.subscribe(`/topic/recreate/${gameId}`, (message) => {
          try {
            const data: Game = JSON.parse(message.body);
            dispatch(setRecreateGame(data));
          } catch (err) {
            console.error('Invalid chat message:', err);
          }
        });
      },
      onDisconnect: () => {
        console.log("STOMP disconnected");
      }
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  const handleBack = async () => {
    const currentUserId = userId;
    const currentOwnerId = ownerId;
    const currentGameId = gameId;
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

      dispatch(clearGameState());

      if (recreateGame === null) {
        const response: Game = await apiService.post<Game>(`/back/${currentGameId}`, {});
        dispatch(setRecreateGame(response));
      }

      if (recreateGame?.gameId) {
        dispatch(gameInitialize(
          {
            gameId: recreateGame.gameId,
            gamename: recreateGame.gameName,
            gameCode: recreateGame.gameCode,
            gameStarted: false,
            modeType: recreateGame.modeType,
            time: recreateGame.time,
            ownerId: null,
            hints: null,
            gameHistory: [],
            learningProgress: [],
            currentGameMode: null,
            currentTeamId: null,
            gameResults: null,
            hintUsage: 0,
            scoreBoard: null,
            answer: null,
            recreateGame: null,
          }
        ));

        if (String(currentUserId) !== String(currentOwnerId)) {
          try {
            await apiService.put<Game>(`/lobbyIn/${currentUserId}`, recreateGame);
            router.push(`/game/start/${recreateGame.gameId}`);
          } catch (error) {
            if (error instanceof Error) {
              alert(`Something went wrong during game joining:\n${error.message}`);
            } else {
              console.error("An unknown error occurred during game joining.");
            }
          }
        } else {
          router.push(`/game/start/${recreateGame.gameId}`)
        }
      }
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
          <button className={styles.backButton} onClick={handleBack}>
            {gameMode === "solo" ? "Back to Hall" : "Back"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
