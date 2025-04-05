"use client";

import React, { useEffect, useState } from 'react';
import { useApi } from "@/hooks/useApi";
import { Game } from "@/types/game";
import { useParams, useRouter } from "next/navigation";
import styles from "@/styles/lobby.module.css";

const Lobby: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  
  // only for mock, remove when backend is ready
  useEffect(() => {
    setGames( [
      { gameName: "Map genies", playersNumber: "1 / 5", owner: "RocketMan", password: "password", gameId: "1", modeType: "normal", time: "5" },
      { gameName: "Map Dragons", playersNumber: "4 / 5", owner: "RocketWo", password: "password", gameId: "1", modeType: "normal", time: "5" },
      { gameName: "Map xx", playersNumber: "1 / 5", owner: "RocketNN", password: "password", gameId: "1", modeType: "normal", time: "5" },
      { gameName: "Map yy", playersNumber: "1 / 5", owner: "RocketMM", password: "password", gameId: "1", modeType: "normal", time: "5" },
    ])
  }, []);
  
  // useEffect(() => {
  //     const fetchGames = async () => {
  //       try {
  //         const response: Game[] = await apiService.get("/lobby");
  //         setGames(response);
  //       } catch (error) {
  //         if (error instanceof Error) {
  //           alert(`Something went wrong while fetching user:\n${error.message}`);
  //           router.push("/game");
  //         } else {
  //           console.error("An unknown error occurred while fetching user.");
  //         }
  //       }
  //     };
  
  //     fetchGames();
  //   }, [apiService]);

  return (
    <div className={styles.page}>
      <div className={styles.leftPanel}>
        <h1 className={styles.title}>Game Lobby</h1>
        <p className={styles.subtitle}>Feel free to join!</p>

        <div className={styles.headerRow}>
          <div>Game Name</div>
          <div>Player in Game</div>
          <div>Owner</div>
        </div>

        {games.map((lobby, idx) => (
          <div key={idx} className={styles.lobbyCard}>
            <div className={styles.teamName}>
              {lobby.gameName}
              {lobby.password !== null && <span title="Private game">🔒</span>}
            </div>
            <div>{lobby.playersNumber}</div>
            <div className={styles.ownerLink}>{lobby.owner}</div>
          </div>
        ))}
      </div>

      {/* Toggle Button */}
      <div className={styles.sidebarToggle} onClick={() => setShowSidebar(!showSidebar)}>
        {showSidebar ? ">" : "+ Create New Game"}
      </div>

      {/* Sidebar */}
      <div className={`${styles.rightPanel} ${showSidebar ? styles.show : ""}`}>
        <h2 className={styles.createTitle}>Create Game Session</h2>
        <form className={styles.form}>
          <label>
            Max Players:
            <select className={styles.input}>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </label>

          <label>
            Duration:
            <select className={styles.input}>
              <option value="5">5 Minutes</option>
              <option value="10">10 Minutes</option>
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
            </select>
          </label>

          <label>
            Password (optional):
            <input type="text" className={styles.input} />
          </label>

          <button type="submit" className={styles.createButton}>Create</button>
        </form>
      </div>
    </div>
  );
};

export default Lobby;