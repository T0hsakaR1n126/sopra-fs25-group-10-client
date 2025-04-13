"use client";

import React, { useEffect, useState } from 'react';
import styles from '@/styles/gameStart.module.css';
import { Client } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { useParams, useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { useApi } from '@/hooks/useApi';
import { useSelector } from 'react-redux';

const GameStart = () => {
  const router = useRouter();
  const gameId = useParams()?.id;
  const apiService = useApi();
  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId)

  const [players, setPlayers] = useState<User[]>([]);
  const [isTeamMode, setIsTeamMode] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [isTeamNameSaved, setIsTeamNameSaved] = useState(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response: User[] = await apiService.get<User[]>(`/ready/${gameId}`);
        setPlayers(response);
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
        console.log('STOMP connected');

        client.subscribe(`/topic/ready/${gameId}/players`, (message) => {
          try {
            console.log('RAW message body:', message.body);
            const data: User[] = JSON.parse(message.body);
            setPlayers(data);
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

  const handleExitGame = async () => {
    try {
      await apiService.put(`/lobbyOut/${userId}`, {});
      router.push('/lobby');
    } catch (error) {
      console.error('Error leaving game:', error);
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

      <div className={styles.inlineField}>
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
      </div>

      {isTeamMode && (
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
      )}

      <div className={styles.buttonGroup}>
        {!isTeamNameSaved && isTeamMode && <button className={styles.button} onClick={() => { setTeamName(teamName); setIsTeamNameSaved(true); }}>Save</button>}
        <button className={styles.button}>Begin</button>
        <button className={styles.button} onClick={handleExitGame}>Exit</button>
      </div>
    </div>
  );
};

export default GameStart;
