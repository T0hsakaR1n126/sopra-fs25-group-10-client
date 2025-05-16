"use client";

import React, { useEffect, useState } from 'react';
import styles from '@/styles/gameBoard.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { answerUpdate, clearGameState, hintUpdate, hintUsageClear, hintUsageIncrement, ownerUpdate, scoreBoardResultSet } from '@/gameSlice';
import InteractiveMap from '@/hooks/interactiveMap';
import { Client } from '@stomp/stompjs';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { Game } from '@/types/game';

const GameBoard: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const apiService = useApi();
  const [hintIndex, setHintIndex] = useState(1);
  const [unlockedHints, setUnlockedHints] = useState(1);
  const [showScoreBoard, setShowScoreBoard] = useState(false);
  const [showExitWindow, setShowExitWindow] = useState(false);
  const [scoreBoard, setScoreBoard] = useState<Map<string, number> | null>(null);
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [endMessage, setEndMessage] = useState('');
  const [nextLocked, setNextLocked] = useState(false);

  const rawHints = useSelector((state: { game: { hints: { difficulty: string; text: string }[] } }) => state.game.hints || []);
  const hints = [...rawHints].sort((a, b) => parseInt(b.difficulty) - parseInt(a.difficulty));
  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId);
  const gameId = useSelector((state: { game: { gameId: string } }) => state.game.gameId);
  const ownerId = useSelector((state: { game: { ownerId: string } }) => state.game.ownerId);
  const gameMode = useSelector((state: { game: { modeType: string } }) => state.game.modeType);
  const initialScoreBoard = useSelector((state: { game: { scoreBoard: Map<string, number> } }) => state.game.scoreBoard);
  const answer = useSelector((state: { game: { answer: string } }) => state.game.answer);
  const restTime = useSelector((state: { game: { time: string } }) => state.game.time);

  const currentHint = hints[hintIndex - 1];

  const handleHintClick = (index: number) => {
    const target = index + 1;
    if (target === unlockedHints + 1 && target <= hints.length) {
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
    if (restTime != null) {
      const minutes = Math.floor(parseInt(restTime));
      setCurrentTime(`${String(minutes).padStart(2, '0')}:00`);
    }
  }, [restTime]);

  useEffect(() => {
    if (initialScoreBoard) {
      const map = new Map(Object.entries(initialScoreBoard));
      setScoreBoard(map);
    }

    const client = new Client({
      brokerURL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
      onConnect: () => {

        client.subscribe(`/topic/user/${gameId}/scoreBoard`, (message) => {
          try {
            const data: Map<string, number> = JSON.parse(message.body);
            setScoreBoard(new Map(Object.entries(data)));
            dispatch(scoreBoardResultSet(data));
          } catch (err) {
            console.error('Invalid scoreboard message:', err);
          }
        });
        client.subscribe(`/topic/game/${gameId}/formatted-time`, (message) => {
          try {
            const data: string = message.body;
            setCurrentTime(data);
          } catch (err) {
            console.error('Invalid time message:', err);
          }
        });
        client.subscribe(`/topic/end/${gameId}`, (message) => {
          try {
            const data: string = message.body;
            setGameEnded(true);
            setEndMessage(data);
            setTimeout(() => {
              if (String(userId) === String(ownerId)) {
                apiService.put(`/save/${gameId}`, {})
                  .then()
                  .catch((error) => {
                    alert(`Error saving game: ${error.message}`);
                    router.push("/game");
                  });
              }
              router.push(`/game/results/${gameId}`);
            }, 1000);
          } catch (err) {
            console.error('Invalid end message:', err);
          }
        });
        client.subscribe(`/topic/game/${gameId}/owner`, (message) => {
          try {
            const data: string = message.body;
            dispatch(ownerUpdate(data));
          } catch (err) {
            console.error('Invalid owner message:', err);
          }
        });
      },
      onDisconnect: () => {
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
    });

    client.activate();
    return () => {
      client.deactivate();
    };
  }, [apiService, dispatch, gameId, initialScoreBoard, ownerId, router, userId]);

  const handleFinishGame = async () => {
    try {
      await apiService.put(`/finishexercise/${gameId}`, {});
      setTimeout(() => {
        dispatch(hintUsageClear());
        dispatch(clearGameState());
      }, 1000);
      router.push(`/game`);
    } catch (error) {
      console.error('Error finishing game:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          {gameMode !== "exercise" ? (
            <div className={styles.scoreboardWrapper}>
              <button className={styles.userBoxGreen} onClick={() => setShowExitWindow(prev => !prev)}>
                Exit
              </button>
            </div>
          ) : (
            <div className={styles.scoreboardWrapper}>
              <button
                className={styles.userBoxGreen}
                onClick={async () => {
                  if (nextLocked) return;
                  setNextLocked(true);
                  try {
                    const response: Game = await apiService.post(`/next/${gameId}`, {});
                    dispatch(hintUpdate(response.hints ?? []));
                    dispatch(hintUsageClear());
                    dispatch(answerUpdate(response.answer ?? ""));
                  } catch (err) {
                    console.error('Error fetching next game:', err);
                  } finally {
                    setTimeout(() => setNextLocked(false), 500);
                  }
                }}
              >
                Next
              </button>
            </div>
          )}
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
                        router.push(gameMode === "combat" ? '/lobby' : '/game');
                      } catch (error) {
                        console.error('Error leaving game:', error);
                      }
                    }}
                  >
                    Give up with score lost
                  </button>
                  <button
                    className={styles.exitButton}
                    onClick={() => setShowExitWindow(false)}
                  >
                    Misoperating, back...
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.topCenter}>
          <div className={styles.scoreboardWrapper}>
            <button
              className={styles.userBoxBlue}
              onClick={() => setShowScoreBoard(prev => !prev)}
            >
              {gameMode !== "exercise" ? "Scoreboard" : "Answer"}
            </button>
            <div
              className={`${styles.scoreboardPopup} ${showScoreBoard ? styles.popupVisible : styles.popupHidden}`}
            >
              {gameMode !== "exercise" ? (
                <>
                  <h3>Scoreboard</h3>
                  <ul>
                    {scoreBoard ? (
                      Array.from(scoreBoard.entries())
                        .sort(([, a], [, b]) => b - a)
                        .map(([player, score]) => (
                          <li key={player}>
                            {player}: {score === -1 ? "gave up" : score}
                          </li>
                        ))
                    ) : (
                      <li>Loading...</li>
                    )}
                  </ul>
                </>
              ) : (
                <h3>{answer || "No answer available"}</h3>
              )}
            </div>
          </div>
        </div>

        <div className={styles.topRight}>
          <div className={styles.scoreboardWrapper}>
            <button
              className={styles.userBoxQuestion}
              onClick={() => setShowRules(prev => !prev)}
              aria-label="Show game rules"
            >
              <svg
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path
                  fill="#fff"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92c-.5.51-.86.97-1.04 1.69-.08.32-.13.68-.13 1.14h-2v-.5c0-.83.36-1.54.86-2.06l1.22-1.24c.36-.37.55-.88.55-1.44 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
                />
              </svg>
            </button>
            <div
              className={`${styles.scoreboardPopup} ${showRules ? styles.popupVisible : styles.popupHidden}`}
              style={{ width: '280px', textAlign: 'left' }}
            >
              <h3>Game Rules</h3>
              <p>
                <strong>Game Modes</strong><br />
                Solo Mode: Practice and simulate the game.<br />
                Combat Mode: Battles for multiple players.<br /><br />
                <strong>Scoring System</strong><br />
                Each game starts with 100 points.<br />
                Using a hint deducts 20 points.<br />
                5 hints max — using all results in 0 points.
              </p>
            </div>
          </div>
          {String(restTime) !== "-1" ? (
            <div className={styles.timer}>
              <div>Time left:</div>
              <div className={styles.red}>{currentTime || "00:00"}</div>
            </div>
          ) : (
            <button
              className={styles.userBoxGreen}
              onClick={handleFinishGame}
            >
              Finish
            </button>
          )}
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.hintBox}>
          {currentHint ? (
            <div className={styles.hintText}>
              <p>
                <strong>Hint {hintIndex}:</strong><br />
                {currentHint.text}
              </p>
            </div>
          ) : (
            <div className={styles.hintText}>
              <p>No hints available</p>
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
                  className={`${styles.hintIcon} ${isUsed ? styles.hintUsed : styles.hintLocked}`}
                >
                  {isUsed ? '✓' : '🔒'}
                </span>
              );
            })}
          </div>
        </div>
        <div className={styles.mapArea}>
          <InteractiveMap />
        </div>
      </div>
      {gameEnded && (
        <div className={styles.endOverlay}>
          <div className={styles.endMessage}>{endMessage}</div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;