"use client";

import React, { useEffect, useState } from 'react';
import styles from '@/styles/gameStart.module.css';
import { Client } from '@stomp/stompjs';
import { useParams, useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { useApi } from '@/hooks/useApi';
import { useSelector, useDispatch } from 'react-redux';
import { Game } from '@/types/game';
import { gameIdUpdate, gameStart, gameTimeInitialize, ownerUpdate } from '@/gameSlice';

const GameStart = () => {
  const router = useRouter();
  const gameId = useParams()?.id;
  const apiService = useApi();
  const dispatch = useDispatch();

  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId);
  const username = useSelector((state: { user: { username: string } }) => state.user.username);

  const [players, setPlayers] = useState<User[]>([]);
  const [playersNumber, setPlayersNumber] = useState<number>(0);
  const [ownerName, setOwnerName] = useState("");
  const [countDown, setCountDown] = useState<string | null>(null);
  const [countDownStart, setCountDownStart] = useState<number | null>(null);
  const [readyStatus, setReadyStatus] = useState<Record<string, boolean>>({});
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    dispatch(gameIdUpdate(gameId?.toString() ?? ""));

    const fetchPlayers = async () => {
      try {
        const response: User[] = await apiService.get<User[]>(`/ready/${gameId}`);
        setPlayers(response);
        setOwnerName(response[0].username ?? "");
        dispatch(ownerUpdate(response[0].userId ?? ""));

        const initialReady: Record<string, boolean> = {};
        response.forEach(player => {
          initialReady[player.userId] = player.isReady ?? false;
        });
        setReadyStatus(initialReady);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while fetching players:\n${error.message}`);
          router.push("/lobby");
        } else {
          console.error("An unknown error occurred while fetching players.");
        }
      }
    };

    fetchPlayers();

    const stompClient = new Client({
      //brokerURL: 'wss://sopra-fs25-group-10-server-246820907268.europe-west6.run.app/ws',
      brokerURL: 'ws://localhost:8080/ws', // TODO: replace with your WebSocket URL
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('STOMP connected', gameId);

        stompClient.subscribe(`/topic/ready/${gameId}/players`, (message) => {
          try {
            const data: User[] = JSON.parse(message.body);
            setPlayers(data);
            setOwnerName(data[0].username ?? "");
            dispatch(ownerUpdate(data[0].userId ?? ""));

            const newReadyStatus: Record<string, boolean> = {};
            data.forEach(player => {
              newReadyStatus[player.userId] = player.isReady ?? false;
            });
            setReadyStatus(newReadyStatus);
          } catch (err) {
            console.error('Invalid message:', err);
          }
        });

        stompClient.subscribe(`/topic/gametime`, (message) => {
          try {
            const data: string = message.body;
            dispatch(gameTimeInitialize(data));
          } catch (err) {
            console.error('Invalid message:', err);
          }
        });

        stompClient.subscribe(`/topic/start/${gameId}/ready-time`, (message) => {
          try {
            const data: string = message.body;
            setCountDownStart(parseInt(data));
          } catch (err) {
            console.error('Invalid message:', err);
          }
        });

        stompClient.subscribe(`/topic/start/${gameId}/hints`, (message) => {
          try {
            const game: Game = JSON.parse(message.body);
            if (game.hints) {
              dispatch(gameStart({
                hints: game.hints ?? [],
                gameId: gameId?.toString() ?? "",
                scoreBoard: game.scoreBoard ?? new Map<string, number>(),
                modeType: game.modeType ?? "combat",
              }));
            }
          } catch (err) {
            console.error('Invalid message:', err);
          }
        });

        stompClient.subscribe(`/topic/playersNumber`, (message) => {
          try {
            const data: string = message.body;
            setPlayersNumber(parseInt(data));
          } catch (err) {
            console.error('Invalid message:', err);
          }
        });
      },
      onDisconnect: () => {
        console.log('STOMP disconnected');
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
      router.push('/lobby');
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  };

  const handleBegin = async () => {
    try {
      await apiService.put(`/start/${gameId}`, {});
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const toggleReady = () => {
    const newReady = !readyStatus[userId];
    setReadyStatus(prev => ({ ...prev, [userId]: newReady }));

    if (client && client.connected) {
      client.publish({
        destination: `/app/ready/${gameId}`,
        body: JSON.stringify({ userId, ready: newReady }),
      });
    }
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Game</h3>

      <div className={styles.players}>
        {players.map((player, idx) => (
          <p key={idx}>
            {idx === 0 ? `Owner: ${player.username}` : player.username}
            {readyStatus[player.userId] && ' ✅'}
          </p>
        ))}
      </div>

      <div className={styles.buttonGroup}>
        {username !== ownerName && (
          <button className={styles.button} onClick={toggleReady}>
            {readyStatus[userId] ? "Cancel Ready" : "Ready"}
          </button>
        )}
        {username === ownerName && (
          <button
            className={styles.button}
            onClick={handleBegin}
            disabled={
              players.length !== playersNumber ||
              !players.slice(1).every(p => readyStatus[p.userId])
            }
          >
            Begin
          </button>
        )}
        <button className={styles.button} onClick={handleExitGame}>Exit</button>
      </div>

      {countDown !== null && (
        <div className={styles.overlay}>
          <div className={styles.countdown} key={countDown}>
            {countDown === "0" ? "GO!" : countDown}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameStart;
