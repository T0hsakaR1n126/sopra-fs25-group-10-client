"use client";

import React, { useEffect, useState } from 'react';
import styles from '@/styles/gameStart.module.css';
import { Client } from '@stomp/stompjs';
import { useParams, useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { useApi } from '@/hooks/useApi';
import { useSelector } from 'react-redux';
import { Game } from '@/types/game';
import { useDispatch } from "react-redux"; // Import useDispatch
import { gameStart, gameTimeInitialize } from '@/gameSlice';


const GameStart = () => {
  const router = useRouter();
  const gameId = useParams()?.id;
  const apiService = useApi();
  const dispatch = useDispatch(); // Set up dispatch for Redux actions

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SockJS = require('sockjs-client');

  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId)
  const username = useSelector((state: { user: { username: string } }) => state.user.username)

  const [players, setPlayers] = useState<User[]>([]);
  const [playersNumber, setPlayersNumber] = useState<number>(0);
  // const [isTeamMode, setIsTeamMode] = useState(false);
  // const [teamName, setTeamName] = useState("");
  // const [isTeamNameSaved, setIsTeamNameSaved] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [countDown, setCountDown] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response: User[] = await apiService.get<User[]>(`/ready/${gameId}`);
        setPlayers(response);
        setOwnerName(response[0].username ?? "");
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

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'), // TODO: replace with your WebSocket URL
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('STOMP connected', gameId);

        client.subscribe(`/topic/ready/${gameId}/players`, (message) => {
          try {
            console.log('RAW message body:', message.body);
            const data: User[] = JSON.parse(message.body);
            setPlayers(data);
            if (data[0].username === username) {
              setOwnerName(data[0].username);
            }
          } catch (err) {
            console.error('Invalid message:', err);
          }
        });

        client.subscribe(`/topic/start/${gameId}/ready-time`, (message) => {
          try {
            console.log('RAW message body:', message.body);
            const data: string = message.body;
            if (!["1", "2", "3", "4", "5"].includes(data)) {
              dispatch(gameTimeInitialize(data));
              router.push(`/game/${gameId}`);
            } else {
              setCountDown(data);
            }
          } catch (err) {
            console.error('Invalid message:', err);
          }
        });

        client.subscribe(`/topic/start/${gameId}/hints`, (message) => {
          try {
            const game: Game = JSON.parse(message.body);
            if (game.hints) {
              dispatch(gameStart({
                hints: game.hints ?? [],
                gameId: gameId?.toString() ?? "",
                scoreBoard: game.scoreBoard ?? new Map<string, number>(),
              }));
            }
          } catch (err) {
            console.error('Invalid message:', err);
          }
        });

        client.subscribe(`/topic/playersNumber`, (message) => {
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

    client.activate();
    console.log('Subscribing to:', `/topic/ready/${gameId}/players`);

    return () => {
      client.deactivate();
    };
  }, [gameId]);

  useEffect(() => {
    if (countDown === null) return;
    if (countDown === "0") {
      setCountDown(null);
      return;
    }
  }, [countDown]);

  const handleExitGame = async () => {
    try {
      await apiService.put(`/lobbyOut/${userId}`, {});
      router.push('/lobby');
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  }

  const handleBegin = async () => {
    try {
      await apiService.put(`/start/${gameId}`, {});
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Game</h3>

      <div className={styles.players}>
        {players.map((player, idx) => (
          <p key={idx}>
            {idx === 0 ? `Owner: ${player.username}` : player.username}
          </p>
        ))}
      </div>

      {/* {username === ownerName && <div className={styles.inlineField}>
        <span className={styles.labelText}>Team Mode</span>

        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={isTeamMode}
            onChange={(e) => {
              setIsTeamMode(e.target.checked);
              setTeamName("");
              setIsTeamNameSaved(false);
            }}
          />
          <span className={styles.slider}></span>
        </label>
      </div>} */}

      {/* {isTeamMode && (
        <>
          {isTeamNameSaved ? (
            <p className={styles.teamName}>Team Name: {teamName}</p>
          ) : (
            <label>
              <input
                type="text"
                className={styles.input}
                value={teamName}
                placeholder='Enter your team name'
                onChange={(e) => setTeamName(e.target.value)}
              />
            </label>
          )}
        </>
      )} */}

      <div className={styles.buttonGroup}>
        {/* {!isTeamNameSaved && isTeamMode && <button className={styles.button} onClick={() => { setTeamName(teamName); setIsTeamNameSaved(true); }}>Save</button>} */}
        {username === ownerName && <button className={styles.button} onClick={handleBegin} disabled={players.length !== playersNumber}>Begin</button>}
        <button className={styles.button} onClick={handleExitGame}>Exit</button>
      </div>

      {countDown !== null && (
        <div className={styles.overlay}>
          <div className={styles.countdown}>{countDown === "0" ? "GO!" : countDown}</div>
        </div>
      )}
    </div>
  );
};

export default GameStart;
