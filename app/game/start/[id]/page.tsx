"use client";

import React, { useEffect, useState } from "react";
import styles from "@/styles/gameStart.module.css";
import { Client } from "@stomp/stompjs";
import { useParams, useRouter } from "next/navigation";
import { User } from "@/types/user";
import { useApi } from "@/hooks/useApi";
import { useSelector, useDispatch } from "react-redux";
import { Game } from "@/types/game";
import {
  clearGameState,
  gameStart,
  gameTimeInitialize,
  ownerUpdate,
} from "@/gameSlice";

const GameStart = () => {
  const router = useRouter();
  const gameId = useParams()?.id;
  const apiService = useApi();
  const dispatch = useDispatch();

  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId);
  const username = useSelector((state: { user: { username: string } }) => state.user.username);
  const gameCode = useSelector((state: { game: { gameCode: string } }) => state.game.gameCode);

  const [players, setPlayers] = useState<User[]>([]);
  const [playersNumber, setPlayersNumber] = useState<number>(0);
  const [gameCodeShown, setGameCodeShown] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [countDown, setCountDown] = useState<string | null>(null);
  const [countDownStart, setCountDownStart] = useState<number | null>(null);
  const [readyStatus, setReadyStatus] = useState<Record<string, boolean>>({});
  const [canStart, setCanStart] = useState<boolean>(false);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    setGameCodeShown(gameCode);

    const fetchPlayers = async () => {
      try {
        const response: User[] = await apiService.get(`/ready/${gameId}`);
        setPlayers(response);
        setOwnerName(response[0].username ?? "");
        dispatch(ownerUpdate(response[0].userId ?? ""));

        const initialReady: Record<string, boolean> = {};
        response.forEach(player => {
          if (player.userId != null) {
            initialReady[player.userId.toString()] = player.isReady ?? false;
          }
        });
        setReadyStatus(initialReady);
      } catch (error) {
        console.error("Failed to fetch players:", error);
        router.push("/lobby");
      }
    };

    fetchPlayers();

    const stompClient = new Client({
      brokerURL: "ws://localhost:8080/ws",
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("STOMP connected");

        stompClient.subscribe(`/topic/ready/${gameId}/players`, (message) => {
          const data: User[] = JSON.parse(message.body);
          setPlayers(data);
          setOwnerName(data[0].username ?? "");
          dispatch(ownerUpdate(data[0].userId ?? ""));
        });

        stompClient.subscribe(`/topic/ready/${gameId}/status`, (message) => {
          const map: Record<string, boolean> = JSON.parse(message.body);
          console.log("[WS] Ready Status Received:", map);  // 添加这个
          const normalizedMap: Record<string, boolean> = {};
          for (const [k, v] of Object.entries(map)) {
            normalizedMap[k.toString()] = v;
          }
          console.log("[WS] Ready Status Received:", normalizedMap);
          setReadyStatus(normalizedMap);
        });

        stompClient.subscribe(`/topic/ready/${gameId}/canStart`, (message) => {
          const can: boolean = JSON.parse(message.body);
          console.log("[WS] Can Start Received:", can);
          setCanStart(can);
        });

        stompClient.subscribe(`/topic/${gameId}/gametime`, (message) => {
          const data: string = message.body;
          dispatch(gameTimeInitialize(data));
        });

        stompClient.subscribe(`/topic/start/${gameId}/ready-time`, (message) => {
          const data: string = message.body;
          setCountDownStart(parseInt(data));
        });

        stompClient.subscribe(`/topic/start/${gameId}/hints`, (message) => {
          const game: Game = JSON.parse(message.body);
          if (game.hints) {
            dispatch(gameStart({
              hints: game.hints,
              gameId: gameId?.toString() ?? "",
              scoreBoard: game.scoreBoard ?? new Map<string, number>(),
              modeType: game.modeType ?? "combat",
            }));
          }
        });

        stompClient.subscribe(`/topic/${gameId}/playersNumber`, (message) => {
          const data: string = message.body;
          setPlayersNumber(parseInt(data));
        });

        stompClient.subscribe(`/topic/${gameId}/gameCode`, (message) => {
          const data: string = message.body;
          setGameCodeShown(data);
        });
      },
      onDisconnect: () => {
        console.log("STOMP disconnected");
      }
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, [gameId]);

  useEffect(() => {
    if (countDownStart === null) return;

    let current = countDownStart;
    setCountDown(current.toString());

    const interval = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountDown(current.toString());
      } else if (current === 0) {
        setCountDown("GO!");
        setTimeout(() => {
          setCountDown(null);
          requestAnimationFrame(() => {
            router.push(`/game/${gameId}`);
          });
        }, 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownStart]);

  const handleExitGame = async () => {
    try {
      await apiService.put(`/lobbyOut/${userId}`, {});
      dispatch(clearGameState());
      router.push("/lobby");
    } catch (error) {
      console.error("Error leaving game:", error);
    }
  };

  const handleBegin = async () => {
    try {
      await apiService.put(`/start/${gameId}`, {});
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const toggleReady = () => {
    const newReady = !readyStatus[userId.toString()];
    console.log("[Toggle Ready] Sending:", { userId, ready: newReady });

    if (client && client.connected) {
      client.publish({
        destination: `/app/game/${gameId}/ready`,
        body: JSON.stringify({ userId, ready: newReady }),
      });
    } else {
      console.warn("[Toggle Ready] STOMP client not connected!");
    }
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Game</h3>

      <div className={styles.players}>
            {players.map((player, idx) => (
        <p key={idx}>
          {idx === 0 ? `Owner: ${player.username}` : player.username}
          {player.userId != null && readyStatus[player.userId.toString()] && " ✅"}
        </p>
      ))}
      </div>

      <div className={styles.gameCode}>
        <p>Game Code: {gameCodeShown}</p>
      </div>

      <div className={styles.buttonGroup}>
        {username !== ownerName && (
          <button className={styles.button} onClick={toggleReady}>
            {readyStatus[userId.toString()] ? "Cancel Ready" : "Ready"}
          </button>
        )}
        {username === ownerName && (
          <button
            className={styles.button}
            onClick={handleBegin}
            disabled={!canStart || players.length !== playersNumber}
          >
            Begin
          </button>
        )}
        <button className={styles.button} onClick={handleExitGame}>Exit</button>
      </div>

      {countDown !== null && (
        <div className={styles.overlay}>
          <div className={styles.countdown}>
            {countDown === "0" ? "GO!" : countDown}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStart;

