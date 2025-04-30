"use client";

import React, { useEffect, useState } from 'react';
import { useApi } from "@/hooks/useApi";
import { Game } from "@/types/game";
import { useRouter } from "next/navigation";
import styles from "@/styles/lobby.module.css";
import CreateForm from './create/page';
import { useDispatch, useSelector } from 'react-redux';
import { Client } from '@stomp/stompjs';
import { gameInitialize } from '@/gameSlice';

const Lobby: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  const dispatch = useDispatch(); // Set up dispatch for Redux actions
  const [showSidebar, setShowSidebar] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [paginatedGames, setPaginatedGames] = useState<Game[]>([]);
  const [joinCode, setJoinCode] = useState("");

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

  // useEffect(() => {
  //   const fetchGames = async () => {
  //     try {
  //       await apiService.put("/lobby", {});
  //     } catch (error) {
  //       if (error instanceof Error) {
  //         alert(`Something went wrong while fetching user:\n${error.message}`);
  //         router.push("/game");
  //       } else {
  //         console.error("An unknown error occurred while fetching user.");
  //       }
  //     }
  //   };

  //   fetchGames();
  // }, [apiService]);

  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws', // TODO: replace with your WebSocket URL // TODO: replace with your WebSocket URL
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('STOMP connected');

        client.subscribe(`/topic/lobby`, (message) => {
          try {
            console.log('RAW message body:', message.body);
            const data: Game[] = JSON.parse(message.body);
            setGames(data);
            setPaginatedGames(data.slice(start, start + itemsPerPage));
          } catch (err) {
            console.error('Invalid message:', err);
          }
        });

        apiService.put("/lobby", {}).catch((err) => {
          console.error('Error fetching lobby data: ', err);
        });
      },
      onDisconnect: () => {
        console.log('STOMP disconnected');
      }
    });

    client.activate();


    return () => {
      client.deactivate();
    };
  }, []);

  useEffect(() => {
    setPaginatedGames(games.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage));
  }, [games, currentPage]);

  const handleJoinGame = async (game: Game, userId: string): Promise<void> => {
    if (game.password) {
      const password = prompt("Enter the game password:");
      if (password === null || password.trim() === "") {
        return;
      }
      game.password = password;
    } else {
      game.password = "";
    }
    console.log(JSON.stringify(game, null, 2));
    try {
      await apiService.put<Game>(`/lobbyIn/${userId}`, game);
      dispatch(gameInitialize(
        {
          gameId: game.gameId,
          gamename: game.gameName,
          gameCode: game.gameCode,
          gameStarted: false,
          modeType: game.modeType,
          time: game.time,
          ownerId: null,
          hints: null,
          gameHistory: [],
          learningProgress: [],
          currentGameMode: null,
          currentTeamId: null,
          gameResults: null,
          hintUsage: 0,
          scoreBoard: null
        }
      ));
      router.push(`/game/start/${game.gameId}`);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during game joining:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during game joining.");
      }
    }
  };

  const handleJoinWithCode = async () => {
    if (!joinCode.trim()) {
      alert("Please enter a valid game code.");
      return;
    }

    try {
      const res: Game = await apiService.post<Game>(`/codejoin`, { gameCode: joinCode });
      await handleJoinGame(res, userId);
    } catch (error) {
      alert("Invalid code or game not found.");
      console.error(error);
    }
  };

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
            <div key={idx} className={styles.lobbyCard} onClick={() => handleJoinGame(game, userId)}>
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
      <div className={styles.joinCodeBox}>
        <h3>Join with Code?</h3>
        <div style={{ display: "flex", gap: "8px", width: "100%" }}>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter code..."
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button className={styles.createButton} onClick={handleJoinWithCode}>
            Join
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`${styles.rightPanel} ${showSidebar ? styles.show : ""}`}>
        <CreateForm />
      </div>
    </div>
  );
};

export default Lobby;