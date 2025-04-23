"use client";

import React, { useEffect, useState } from 'react';
import { useApi } from "@/hooks/useApi";
import { Game } from "@/types/game";
import { useRouter } from "next/navigation";
import styles from "@/styles/lobby.module.css";
import CreateForm from './create/page';
import { handleJoinGame } from './join/handleJoinGame';
import { useSelector } from 'react-redux';

const Lobby: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [paginatedGames, setPaginatedGames] = useState<Game[]>([]);
  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId)

  // only for mock, remove when backend is ready
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  // useEffect(() => {
  //   setGames([
  //     { gameName: "Map genies", playersNumber: "1 / 5", owner: "RocketMan", password: "password", gameId: "1", modeType: "normal", time: "5" },
  //     { gameName: "Map Dragons", playersNumber: "4 / 5", owner: "RocketWo", password: "password", gameId: "1", modeType: "normal", time: "5" },
  //     { gameName: "Map xx", playersNumber: "1 / 5", owner: "RocketNN", password: "password", gameId: "1", modeType: "normal", time: "5" },
  //     { gameName: "Map yy", playersNumber: "1 / 5", owner: "RocketMM", password: "password", gameId: "1", modeType: "normal", time: "5" },
  //     { gameName: "Map yy", playersNumber: "1 / 5", owner: "RocketMM", password: "password", gameId: "1", modeType: "normal", time: "5" },
  //     { gameName: "Map yy", playersNumber: "1 / 5", owner: "RocketMM", password: "password", gameId: "1", modeType: "normal", time: "5" },
  //     { gameName: "Map yy", playersNumber: "1 / 5", owner: "RocketMM", password: "password", gameId: "1", modeType: "normal", time: "5" },
  //     { gameName: "Map yy", playersNumber: "1 / 5", owner: "RocketMM", password: "password", gameId: "1", modeType: "normal", time: "5" },
  //     { gameName: "Map yy", playersNumber: "1 / 5", owner: "RocketMM", password: "password", gameId: "1", modeType: "normal", time: "5" },
  //   ])
  // }, []);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response: Game[] = await apiService.get("/lobby");
        setGames(response);
        setPaginatedGames(games.slice(start, start + itemsPerPage));
        console.log(JSON.stringify(response, null, 2));
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while fetching user:\n${error.message}`);
          router.push("/game");
        } else {
          console.error("An unknown error occurred while fetching user.");
        }
      }
    };

    fetchGames();
  }, [apiService]);

  return (
    <div className={styles.page}>
      <div className={styles.leftPanel}>
        <h1 className={styles.title}>Game Lobby</h1>
        <p className={styles.subtitle}>Feel free to join!</p>

        <div className={styles.headerRow}>
          <div>Game Name</div>
          <div>Player in Game</div>
          <div>Private</div>
        </div>

        {paginatedGames.length === 0 ? (
          <div className={styles.emptyMessage}>No Available Game</div>
        ) : (
          paginatedGames.map((game, idx) => (
            <div key={idx} className={styles.lobbyCard} onClick={() => handleJoinGame(game, userId, apiService, router)}>
              <div className={styles.teamName}>
                {game.gameName}
              </div>
              <div className={styles.playerCount}>{game.realPlayersNumber} / {game.playersNumber}</div>
              <div className={styles.ownerLink}>{game.password !== "" && <span title="Private game">🔒</span>}</div>
            </div>
          ))
        )}
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          <span>Page {currentPage}</span>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={end >= games.length}
          >
            Next
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      <div className={styles.sidebarToggle} onClick={() => setShowSidebar(!showSidebar)}>
        {showSidebar ? ">" : "+ Create New Game"}
      </div>

      {/* Sidebar */}
      <div className={`${styles.rightPanel} ${showSidebar ? styles.show : ""}`}>
        <CreateForm />
      </div>
    </div>
  );
};

export default Lobby;