"use client";

import React, { useEffect, useState } from 'react';
import styles from '@/styles/gameBoard.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { hintUsageIncrement, gameTimeInitialize } from '@/gameSlice';
import InteractiveMap from '@/hooks/interactiveMap';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';

const GameBoard: React.FC = () => {
  const dispatch = useDispatch(); // Set up dispatch for Redux actions
  const router = useRouter();
  const apiService = useApi();
  const [hintIndex, setHintIndex] = useState(1);
  const [unlockedHints, setUnlockedHints] = useState(1);
  const [showScoreBoard, setShowScoreBoard] = useState(false);
  const [showExitWindow, setShowExitWindow] = useState(false);
  const [scoreBoard, setScoreBoard] = useState<Map<string, number>>();
  const rawHints = useSelector(
    (state: { game: { hints: { difficulty: string; text: string }[] } }) =>
      state.game.hints || []
  );
  const hints = [...rawHints].sort((a, b) => parseInt(b.difficulty) - parseInt(a.difficulty));
  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId);
  const gameId = useSelector((state: { game: { gameId: string } }) => state.game.gameId);
  const initialScoreBoard = useSelector((state: { game: { scoreBoard: Map<string, number> } }) => state.game.scoreBoard);
  const restTime = useSelector((state: { game: { currentTime: string } }) => state.game.currentTime);
  const [currentTime, setCurrentTime] = useState<string | null>(restTime);

  const currentHint = hints[hintIndex - 1];
  const handleHintClick = (index: number) => {
    const target = index + 1;

    if (target == unlockedHints + 1 && target <= hints.length) {
      setUnlockedHints(target);
      setHintIndex(target);
      dispatch(hintUsageIncrement());
      return;
    }

    if (target <= unlockedHints) {
      setHintIndex(target);
    }
  };

  useEffect(() => {
    setHintIndex(1);
    setUnlockedHints(1);
  }, [rawHints]);

  useEffect(() => {
    if (initialScoreBoard) {
      const map = new Map(Object.entries(initialScoreBoard));
      setScoreBoard(map);
    }

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('STOMP connected');

        client.subscribe(`/topic/user/scoreBoard`, (message) => {
          try {
            console.log('RAW message body:', message.body);
            const data: Map<string, number> = JSON.parse(message.body);
            setScoreBoard(new Map(Object.entries(data)));
          } catch (err) {
            console.error('Invalid message:', err);
          }
        });

        client.subscribe(`/topic/game/${gameId}/formatted-time`, (message) => {
          try {
            console.log('RAW message body:', message.body);
            const data: string = message.body;
            setCurrentTime(data);
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

    return () => {
      client.deactivate();
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.scoreboardWrapper}>
          <button className={styles.userBoxGreen} onClick={() => setShowExitWindow(prev => !prev)}>Exit</button>
        </div>
        {showExitWindow && (
          <div className={styles.modalOverlay}>
            <div className={styles.exitModal}>
              <p>The game is still ongoing.<br />Are you sure you want to exit?</p>
              <div className={styles.exitButtons}>
                <button
                  className={styles.exitButton}
                  onClick={async () => {
                    try {
                      await apiService.put(`/giveup/${userId}`, {});
                      router.push('/lobby');
                    } catch (error) {
                      console.error('Error leaving game:', error);
                    }
                  }}
                >
                  give up with score lost
                </button>
                <button
                  className={styles.exitButton}
                  onClick={() => setShowExitWindow(false)}
                >
                  misoperating, back...
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.scoreboardWrapper}>
          <button
            className={styles.userBoxBlue}
            onClick={() => setShowScoreBoard(prev => !prev)}
          >
            Scoreboard
          </button>

          <div
            className={`${styles.scoreboardPopup} ${showScoreBoard ? styles.popupVisible : styles.popupHidden
              }`}
          >
            <h3>Scoreboard</h3>
            <ul>
              {scoreBoard
                ? Array.from(scoreBoard.entries())
                  .sort(([, a], [, b]) => b - a)
                  .map(([player, score]) => (
                    <li key={player}>
                      {player}: {score}
                    </li>
                  ))
                : <li>Loading...</li>}
            </ul>
          </div>
        </div>
        <div className={styles.timer}>
          <div>Time left:</div>
          <div className={styles.red}>{currentTime}</div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.hintBox}>
          {currentHint && (
            <div className={styles.hintText}>
              <p>
                <strong>Hint {hintIndex}:</strong><br />
                {currentHint.text}
              </p>
            </div>
          )}

          <div className={styles.hintIcons}>
            Hint Usage:<br />
            {hints.map((_, index) => {
              const isUsed = index < unlockedHints;

              return (
                <span
                  key={index}
                  onClick={() => handleHintClick(index)}
                  className={`${styles.hintIcon} ${isUsed ? styles.hintUsed : ""}`}
                />
              );
            })}
          </div>

        </div>

        <div className={styles.mapArea}>
          <InteractiveMap />
        </div>
      </div>
    </div>
  );

}

export default GameBoard;
