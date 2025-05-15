"use client";

import React, { useEffect, useRef, useState } from 'react';
import styles from '@/styles/gameBoard.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { answerUpdate, clearGameState, hintUpdate, hintUsageClear, hintUsageIncrement, ownerUpdate, scoreBoardResultSet } from '@/gameSlice';
import InteractiveMap from '@/hooks/interactiveMap';
import { Client } from '@stomp/stompjs';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { Game } from '@/types/game';

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
  const ownerId = useSelector((state: { game: { ownerId: string } }) => state.game.ownerId);
  const gameMode = useSelector((state: { game: { modeType: string } }) => state.game.modeType);
  const initialScoreBoard = useSelector((state: { game: { scoreBoard: Map<string, number> } }) => state.game.scoreBoard);
  const answer = useSelector((state: { game: { answer: string } }) => state.game.answer);
  const restTime = useSelector((state: { game: { time: string } }) => state.game.time);
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [endMessage, setEndMessage] = useState('');
  const [nextLocked, setNextLocked] = useState(false);

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

  const answerRef = useRef(answer);
  const [answerShown, setAnswerShown] = useState("");
  const idToCountryName = useSelector((state: any) => state.game.idToCountryName);
  useEffect(() => {
    answerRef.current = answer;
    setAnswerShown(idToCountryName[answerRef.current] || answerRef.current);
  }, [answer]);

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
      brokerURL: 'ws://localhost:8080/ws', // TODO: replace with your WebSocket URL
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('STOMP connected');

        client.subscribe(`/topic/user/${gameId}/scoreBoard`, (message) => {
          try {
            console.log('RAW message body:', message.body);
            const data: Map<string, number> = JSON.parse(message.body);
            setScoreBoard(new Map(Object.entries(data)));
            dispatch(scoreBoardResultSet(data));
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

        client.subscribe(`/topic/end/${gameId}`, (message) => {
          try {
            console.log('RAW message body:', message.body);
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
            console.error('Invalid message:', err);
          }
        });

        client.subscribe(`/topic/game/${gameId}/owner`, (message) => {
          try {
            console.log('RAW message body:', message.body);
            const data: string = message.body;
            dispatch(ownerUpdate(data));
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
        {gameMode !== "exercise" ? (
          <div className={styles.scoreboardWrapper}>
            <button className={styles.userBoxGreen} onClick={() => setShowExitWindow(prev => !prev)}>Exit</button>
          </div>
        ) : (
          <div className={styles.scoreboardWrapper}>
            <button className={styles.userBoxGreen} onClick={async () => {
              if (nextLocked) return;
              setNextLocked(true);

              try {
                const response: Game = await apiService.post(`/next/${gameId}`, {});
                dispatch(hintUpdate(response.hints ?? []));
                dispatch(hintUsageClear());
                dispatch(answerUpdate(response.answer ?? ""));
              } catch (err) {
                console.error('error', err);
              } finally {
                setTimeout(() => setNextLocked(false), 500);
              }
            }}>
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
                      if (gameMode === "combat") {
                        router.push('/lobby');
                      } else {
                        router.push('/game');
                      }
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
          {gameMode !== "exercise" ? (
            <>
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
                          {player}: {score === -1 ? "give up" : score}
                        </li>
                      ))
                    : <li>Loading...</li>}
                </ul>
              </div>
            </>
          ) : (
            <>
              <button
                className={styles.userBoxBlue}
                onClick={() => setShowScoreBoard(prev => !prev)}
              >
                Answer
              </button>

              <div
                className={`${styles.scoreboardPopup} ${showScoreBoard ? styles.popupVisible : styles.popupHidden
                  }`}
              >
                <h3>{answerShown}</h3>
              </div>
            </>
          )}
        </div>

        <div className={styles.scoreboardWrapper}>
          {String(restTime) !== "-1" ? (
            <div className={styles.timer}>
              <div>Time left:</div>
              <div className={styles.red}>{currentTime}</div>
            </div>
          ) : (
            <button className={styles.userBoxGreen} onClick={handleFinishGame}>Finish</button>
          )}
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
      {gameEnded && (
        <div className={styles.endOverlay}>
          <div className={styles.endMessage}>
            {endMessage}
          </div>
        </div>
      )}
    </div>
  );

}

export default GameBoard;
