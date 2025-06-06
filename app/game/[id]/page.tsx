"use client";

import React, { useEffect, useRef, useState } from 'react';
import styles from '@/styles/gameBoard.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { answerUpdate, resetQuestionStats, clearGameState, hintUpdate, hintUsageClear, hintUsageIncrement, ownerUpdate, scoreBoardResultSet } from '@/gameSlice';
import InteractiveMap from '@/hooks/interactiveMap';
import { Client } from '@stomp/stompjs';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { Game } from '@/types/game';
import { countryIdMap } from '@/utils/idToCountryName';
import { AnimatePresence, motion } from 'framer-motion';
import { showSuccessToast } from '@/utils/showSuccessToast';
import { showErrorToast } from '@/utils/showErrorToast';
import { LoadingOutlined } from '@ant-design/icons';
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// interface GameState {
//   questionCount: number;
//   correctCount: number;
//   // add other properties as needed
// }

const GameBoard: React.FC = () => {
  const dispatch = useDispatch(); // Set up dispatch for Redux actions
  const router = useRouter();
  const apiService = useApi();
  const [hintIndex, setHintIndex] = useState(1);
  const [unlockedHints, setUnlockedHints] = useState(1);
  const [showInstruction, setShowInstruction] = useState(false);
  const [showExitWindow, setShowExitWindow] = useState(false);
  const [scoreBoard, setScoreBoard] = useState<Map<string, number>>(new Map());
  const rawHints = useSelector(
    (state: { game: { hints: { difficulty: string; text: string }[] } }) =>
      state.game.hints || []
  );
  const hints = [...rawHints].sort((a, b) => parseInt(b.difficulty) - parseInt(a.difficulty));
  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId);
  const username = useSelector((state: { user: { username: string } }) => state.user.username);
  const gameId = useSelector((state: { game: { gameId: string } }) => state.game.gameId);
  const ownerId = useSelector((state: { game: { ownerId: string } }) => state.game.ownerId);
  const gameMode = useSelector((state: { game: { modeType: string } }) => state.game.modeType);
  const initialScoreBoard = useSelector((state: { game: { scoreBoard: Record<string, number> } }) => state.game.scoreBoard);
  const answer = useSelector((state: { game: { answer: string } }) => state.game.answer);
  const restTime = useSelector((state: { game: { time: string } }) => state.game.time);
  const [currentTime, setCurrentTime] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [endMessage, setEndMessage] = useState('');
  const guessTimes = useSelector((state: { game: { guessTimeList?: number[] } }) =>
    state.game.guessTimeList ?? []
  );
  const guessTimesRef = useRef(guessTimes);
  const questionCount = useSelector((state: { game: { questionCount: number } }) => state.game.questionCount);
  const questionCountRef = useRef(questionCount);
  const correctCount = useSelector((state: { game: { correctCount: number } }) => state.game.correctCount);
  const correctCountRef = useRef(correctCount);

  // button lock
  const [nextLocked, setNextLocked] = useState(false);
  const [lastNextTime, setLastNextTime] = useState<number | null>(null);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [lastAnswerTime, setLastAnswerTime] = useState<number | null>(null);

  // animation
  const [transitionDirection, setTransitionDirection] = useState<"none" | "in" | "out">("in");
  useEffect(() => {
    const timer = setTimeout(() => setTransitionDirection("none"), 800);
    return () => clearTimeout(timer);
  }, []);

  const answerRef = useRef(answer);
  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);
  useEffect(() => {
    guessTimesRef.current = guessTimes;
  }, [guessTimes]);
  useEffect(() => {
    questionCountRef.current = questionCount;
  }, [questionCount]);
  useEffect(() => {
    correctCountRef.current = correctCount;
  }, [correctCount]);
  const accuracyValue = questionCountRef.current > 0
    ? Math.round((correctCountRef.current / questionCountRef.current) * 100)
    : 0;
  const avgTime =
    guessTimes.length > 0
      ? (guessTimes.reduce((a, b) => a + b, 0) / guessTimes.length / 1000).toFixed(1)
      : "0.0";

  // for individual score in the game
  const hintUsage = useSelector((state: { game: { hintUsage: number } }) => state.game.hintUsage);
  const hintUsageRef = useRef(hintUsage);
  useEffect(() => {
    hintUsageRef.current = hintUsage;
  }, [hintUsage]);

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
      brokerURL: 'wss://sopra-fs25-group-10-server.oa.r.appspot.com/ws', // TODO: replace with your WebSocket URL
      // brokerURL: "http://localhost:8080/ws",
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
            showErrorToast(`${err}`);
          }
        });

        client.subscribe(`/topic/game/${gameId}/formatted-time`, (message) => {
          try {
            console.log('RAW message body:', message.body);
            const data: string = message.body;
            setCurrentTime(data);
          } catch (err) {
            console.error('Invalid message:', err);
            showErrorToast(`${err}`);
          }
        });

        client.subscribe(`/topic/end/${gameId}`, (message) => {
          try {
            window.dispatchEvent(new Event("globalLock"));
            const data: string = message.body;
            setGameEnded(true);
            setEndMessage(data);
            dispatch(resetQuestionStats());
            setTimeout(() => {
              apiService.put(`/save/${gameId}`, {})
                .then()
                .catch((error) => {
                  showErrorToast("Error saving game: " + (error as Error).message);
                  router.push("/game");
                });

              setTransitionDirection("out");
              setTimeout(() => router.push(`/game/results/${gameId}`), 800);
            }, 1000);
          } catch (err) {
            console.error('Invalid message:', err);
            showErrorToast(`${err}`);
          }
        });

        client.subscribe(`/topic/game/${gameId}/owner`, (message) => {
          try {
            console.log('RAW message body:', message.body);
            const data: string = message.body;
            dispatch(ownerUpdate(data));
          } catch (err) {
            console.error('Invalid message:', err);
            showErrorToast(`${err}`);
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
      window.dispatchEvent(new Event("globalLock"));
      await apiService.put(`/finishexercise/${gameId}`, {});
      setTransitionDirection("out");
      setTimeout(() => {
        dispatch(hintUsageClear());
        dispatch(clearGameState());
        dispatch(resetQuestionStats());
        router.push(`/game`);
      }, 800);
    } catch (error) {
      console.error('Error finishing game:', error);
      showErrorToast(`${error}`);
    }
  };

  // avoid forward and backward
  // const enterLegally = useSelector((state: { game: { enterLegally: boolean } }) => state.game.enterLegally);
  // useEffect(() => {
  //   if (!enterLegally) {
  //     showErrorToast("You are entering game illegally! Redirect to game hall...");
  //     dispatch(clearGameState());
  //     router.push("/game");
  //   }
  // }, []);
  // useEffect(() => {
  //   const handler = (event: PopStateEvent) => {
  //     event.preventDefault();
  //     showErrorToast("You are trying to forward or backward! Give up the game and redirect to game hall...")
  //     setTransitionDirection("out");
  //     dispatch(hintUsageClear());
  //     dispatch(clearGameState());
  //     dispatch(resetQuestionStats());
  //     setTimeout(async () => {
  //       try {
  //         window.dispatchEvent(new Event("globalLock"));
  //         await apiService.put(`/giveup/${userId}`, {});
  //         if (gameMode === "combat") {
  //           router.push('/lobby');
  //         } else {
  //           router.push('/game');
  //         }
  //       } catch (error) {
  //         console.error('Error leaving game:', error);
  //       }
  //     }, 800);
  //   };

  //   history.pushState(null, '', location.href);
  //   window.addEventListener('popstate', handler);
  //   return () => {
  //     window.removeEventListener('popstate', handler);
  //   };
  // }, []);

  return (
    //     <div className={styles.container}>
    //       <div className={styles.topBar}>
    //         <div className={styles.topLeft}>
    //           {gameMode !== "exercise" ? (
    //             <div className={styles.scoreboardWrapper}>
    //               <button className={styles.userBoxRed} onClick={() => setShowExitWindow(prev => !prev)}>Exit</button>
    //             </div>
    //           ) : (
    //             <div className={styles.scoreboardWrapper}>
    //               <button className={styles.userBoxGreen} onClick={async () => {
    //                 if (nextLocked) return;
    //                 setNextLocked(true);

    //                 try {
    //                   const response: Game = await apiService.post(`/next/${gameId}`, {});
    //                   dispatch(hintUpdate(response.hints ?? []));
    //                   dispatch(hintUsageClear());
    //                   dispatch(answerUpdate(response.answer ?? ""));
    //                 } catch (err) {
    //                   console.error('error', err);
    //                   showErrorToast(`${err}`);
    //                 } finally {
    //                   setTimeout(() => setNextLocked(false), 500);
    //                 }
    //               }}>
    //                 Next
    //               </button>
    //             </div>
    //           )}
    //           {showExitWindow && (
    //             <div className={styles.modalOverlay}>
    //               <div className={styles.exitModal}>
    //                 <p>The game is still ongoing.<br />Are you sure you want to exit?</p>
    //                 <div className={styles.exitButtons}>
    <>
      {transitionDirection !== "none" && (
        <motion.div
          className={styles.transitionOverlay}
          initial={{ scaleY: transitionDirection === "in" ? 1 : 0 }}
          animate={{ scaleY: transitionDirection === "in" ? 0 : 1 }}
          exit={{ scaleY: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      )}
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.topLeft}>
            {gameMode !== "exercise" ? (
              <div className={styles.instructionWrapper}>
                <button className={styles.userBoxRed} onClick={() => setShowExitWindow(prev => !prev)}>Exit</button>
              </div>
            ) : (
              <div className={styles.instructionWrapper}>
                <button className={styles.userBoxGreen} disabled={nextLocked} onClick={async () => {
                  const now = Date.now();

                  if (nextLocked) {
                    showErrorToast("You are clicking too fast. Please wait...");
                    return;
                  }

                  if (lastNextTime && now - lastNextTime < 1000) {
                    showErrorToast("Please wait a bit before clicking again...");
                    return;
                  }

                  setNextLocked(true);
                  setLastNextTime(now);

                  try {
                    const response: Game = await apiService.post(`/next/${gameId}`, {});
                    dispatch(hintUpdate(response.hints ?? []));
                    dispatch(hintUsageClear());
                    dispatch(answerUpdate(response.answer ?? ""));
                  } catch (err) {
                    showErrorToast("Error fetching next question: " + (err as Error).message);
                  } finally {
                    setTimeout(() => setNextLocked(false), 1000);
                  }
                }}>
                  {nextLocked ? <LoadingOutlined spin /> : "Next"}
                </button>
              </div>
            )}
            {showExitWindow && (
              <div className={styles.modalOverlay}>
                <div className={styles.exitModalWrapper}>
                  <div className={styles.exitModal}>
                    <p>The game is still ongoing.<br />Are you sure you want to exit?</p>
                    <div className={styles.exitButtons}>
                      <button
                        className={styles.exitButton}
                        onClick={async () => {
                          setTransitionDirection("out");
                          dispatch(hintUsageClear());
                          dispatch(clearGameState());
                          dispatch(resetQuestionStats());
                          setTimeout(async () => {
                            try {
                              window.dispatchEvent(new Event("globalLock"));
                              await apiService.put(`/giveup/${userId}`, {});
                              if (gameMode === "combat") {
                                router.push('/lobby');
                              } else {
                                router.push('/game');
                              }
                            } catch (error) {
                              console.error('Error leaving game:', error);
                            }
                          }, 800);
                        }}
                      >
                        Give Up & Exit
                      </button>
                      <button
                        className={styles.exitButton}
                        onClick={() => setShowExitWindow(false)}
                      >
                        Cancel & Go Back to Game
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.topCenter}>
            <div className={styles.instructionWrapper}>
              {gameMode !== "exercise" ? (
                <>
                  <button
                    className={styles.userBoxBlue}
                    onClick={() => setShowInstruction(prev => !prev)}
                  >
                    Instruction
                  </button>

                  <div
                    className={`${styles.instructionPopup} ${showInstruction ? styles.popupVisible : styles.popupHidden
                      }`}
                  >
                    <h3>How to Play</h3>
                    <ul className={styles.instructionList}>
                      <li>🗺 Hover a country to see its name.</li>
                      <li>🖱 Click a country to submit your guess.</li>
                      <li>💡 Use hints to reach the answer.</li>
                      <li>🔒 The initial score for each country is 100.</li>
                      <li>🚫 Every hint deducts 20 scores.</li>
                      <li>❗ You can use a maximum of 5 hints.</li>
                      <li>➡️ You will start the next guess after submitting.</li>
                      <li>🎯 You will get a 10% score discount in easy mode.</li>
                      <li>🌐 Keep a good internet connection to avoid offline.</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <button
                    className={styles.userBoxBlue}
                    disabled={answerLocked}
                    onClick={async () => {
                      const now = Date.now();

                      if (answerLocked) {
                        showErrorToast("You are clicking too fast. Please wait...");
                        return;
                      }

                      if (lastAnswerTime && now - lastAnswerTime < 1000) {
                        showErrorToast("Please wait a bit before clicking again...");
                        return;
                      }

                      setAnswerLocked(true);
                      setLastAnswerTime(now);

                      try {
                        const response = await apiService.put(`/submit/${userId}`, { gameId: gameId, submitAnswer: answerRef.current, hintUsingNumber: hintUsageRef.current });
                        if ((response as { judgement: boolean }).judgement) {
                          showSuccessToast(`The answer is: ${countryIdMap[answerRef.current]}`);
                        }
                      } catch (error) {
                        console.error('Error leaving game:', error);
                        showErrorToast("Error fetching next question: " + (error as Error).message);
                      } finally {
                        setTimeout(() => setAnswerLocked(false), 1000);
                      }
                    }}
                  >
                    {answerLocked ? <LoadingOutlined spin /> : "Answer"}
                  </button>

                  <div
                    className={`${styles.instructionPopup} ${showInstruction ? styles.popupVisible : styles.popupHidden
                      }`}
                  >
                    <h3>{countryIdMap[answer]}</h3>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className={styles.topRight}>
            <div className={styles.instructionWrapper}>
              {/* <button
              className={styles.userBoxQuestion}
              onClick={() => setShowRules(prev => !prev)}
              aria-label="Show game rules"
              // style={{ color: '#fff', marginLeft: '1008px' }}
            >
              <svg
                viewBox="0 0 1024 1024"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path
                  fill="#fff"
                  d="M527.487228 48.563042 527.487228 48.563042c247.13868 0 447.478498 200.070688 447.478498 446.867584 0 246.798942-200.339818 446.868607-447.478498 446.868607-247.137657 0-447.482591-200.070688-447.482591-446.868607C80.004637 248.63373 280.350594 48.563042 527.487228 48.563042L527.487228 48.563042zM527.487228 110.49558c-100.254332 0-194.499809 39.909965-265.392416 110.699218-70.88442 70.794369-119.160937 174.137039-119.160937 274.250154s48.27754 203.459878 119.160937 274.249131c70.89056 70.794369 165.137061 109.780289 265.392416 109.780289 100.251262 0 203.739241-48.213072 274.622638-119.003348 70.889537-70.78823 109.932762-164.91398 109.932762-265.027096s-48.278563-194.23068-119.167077-265.023002C721.989083 159.632697 627.737466 110.49558 527.487228 110.49558L527.487228 110.49558zM354.562806 394.625756c1.161453-41.924855 3.344165-73.80596 12.090363-95.641267s20.888749-41.339524 40.134069-58.523905c19.24532-17.166985 40.672328-29.831422 64.288189-37.998429 23.61586-8.144494 48.543599-12.223393 74.783217-12.223393 53.055356 0 96.29823 18.355043 131.584897 49.498344 32.809243 28.981055 46.443775 72.057129 46.443775 121.694643 0 23.298636-3.602038 44.411489-12.634762 63.329351-9.04705 18.931165-21.814842 42.512233-51.254338 70.748321-29.445636 28.247344-48.977481 48.338938-58.599629 60.265572-9.619078 11.943007-16.919345 26.205848-21.862937 42.804898-4.964058 16.593933-6.563486 16.426111-6.563486 25.149796l-76.970022 0c0-11.059893 2.623757-16.990976 7.873318-36.508495 5.244444-19.505239 13.116739-36.535101 23.61586-51.094702 10.499122-14.553461 29.438473-35.954887 56.851822-64.198138 27.40107-28.236088 45.044916-48.764634 52.913117-61.579497 7.872295-12.801561 11.808954-31.879058 11.808954-57.20998 0-25.331945-9.042957-47.739281-27.114544-67.257823-18.080797-19.500123-44.316322-29.255301-78.716806-29.255301-77.556377 0-116.328425 46.001707-116.328425 137.998981L354.562806 394.625756 354.562806 394.625756 354.562806 394.625756 354.562806 394.625756zM574.468239 792.046161l-80.216973 0 0-89.094154 80.216973 0L574.468239 792.046161 574.468239 792.046161 574.468239 792.046161z"
                />
              </svg>
            </button> */}


              {/* <div
              className={`${styles.instructionPopup} ${showRules ? styles.popupVisible : styles.popupHidden}`}
              style={{ width: '280px', textAlign: 'left',padding: '10px' }}
            >
              <h3>Game Rules</h3>
              <p>
                Game Modes<br />
                Solo Mode: Practice and simulate the game.<br />
                Combat Mode: Battles for multiple players.<br />
                <br />
                Scoring System<br />
                Each game starts with 100 points.<br />
                Using a hint deducts 20 points.<br />
                5 hints max — using all results in 0 points.
              </p>
            </div> */}
            </div>
            <div className={styles.instructionWrapper}>
              {String(restTime) !== "-1" ? (
                <div
                  className={`${styles.timerValue} ${currentTime && currentTime <= "00:10"
                    ? styles.timerDanger
                    : currentTime && currentTime <= "00:30"
                      ? styles.timerWarning
                      : ''
                    }`}
                >
                  ⏱ {currentTime}
                </div>
              ) : (
                <button className={styles.userBoxRed} onClick={handleFinishGame}>Finish</button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.mainContent}>
          <div className={styles.sidebar}>

            <div className={styles.hintIconsContainer}>
              <div className={styles.hintIconsRow}>
                {hints.map((_, index) => {
                  const isUsed = index < unlockedHints;
                  const isNext = index === unlockedHints;      // the next hint to unlock
                  return (
                    <span
                      key={index}
                      className={`${styles.hintIcon} ${isUsed ? styles.hintUsed :
                        isNext ? styles.hintUnlocked :
                          styles.hintLocked
                        }`}
                    >
                      {isUsed ? '✓' : isNext ? (
                        // unlocked green SVG
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#81c784" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7h-1V7a5 5 0 00-10 0v3H6a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2v-7a2 2 0 00-2-2zm-7-3a3 3 0 016 0v3H11V7z" />
                        </svg>
                      ) : (
                        // locked red SVG
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect x="7" y="11" width="10" height="9" rx="2" ry="2" fill="#b71c1c" />
                          <path
                            d="M7 11V7a5 5 0 0110 0v4"
                            stroke="#ef5350"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="12" cy="15" r="1.5" fill="#ef5350" />
                        </svg>
                      )}
                    </span>
                  );
                })}
              </div>

              {currentHint ? (
                <div className={styles.hintText}>
                  {hints.slice(0, unlockedHints).map((hint, idx) => (
                    <React.Fragment key={idx}>
                      <p><strong className={styles.hintLabel}>Hint {idx + 1}:</strong> {hint.text}</p>
                      <div className={styles.hintDivider}></div>
                    </React.Fragment>
                  ))}
                  <div className={styles.hintButtonWrapper}>
                    <button
                      onClick={() => handleHintClick(hintUsage)}
                      className={styles.collapsibleToggle}
                      disabled={hintUsage >= 5}
                    >
                      GET A HINT!
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.hintText}>
                  <p>No hints available</p>
                </div>
              )}
            </div>

            {gameMode !== "exercise" ? (<div className={styles.ownScoreBox}>
              {/* <h3>My Score: {score}</h3>
            <div className={styles.scoreStat}>
              <span className={styles.label}>Total:</span>
              <span className={styles.attempted}>{questionCount}</span>
            </div>
            <div className={styles.scoreStat}>
              <span className={styles.label}>Correct:</span>
              <span className={styles.correct}>{correctCount}</span>
            </div> */}
              {scoreBoard
                ? (scoreBoard.size !== 1 ?
                  (<AnimatePresence>
                    <motion.div layout className={styles.scoreList}>
                      <div className={styles.scoreTitle}>Scoreboard</div>
                      {Array.from(scoreBoard.entries())
                        .sort(([, a], [, b]) => b - a)
                        .map(([player, score], idx) => {
                          const isSelf = player === username;
                          return (
                            <motion.div
                              layout
                              key={player}
                              className={`${styles.scoreRow} ${isSelf ? styles.currentUser : ""}`}
                              transition={{ type: "spring", stiffness: 700, damping: 20 }}
                            >
                              <span className={styles.rank}>{idx + 1}.</span>
                              <span className={styles.username}>
                                {player} {isSelf && <span className={styles.youTag}>👈 You</span>}
                              </span>
                              <span className={styles.userScore}>
                                {typeof score === "number"
                                  ? score === -1
                                    ? "❌"
                                    : score
                                  : "?"}
                              </span>
                            </motion.div>
                          );
                        })}
                    </motion.div>
                  </AnimatePresence>)
                  : (
                    <>
                      <div className={styles.statPanelTitle}>🧠 Game Stats</div>
                      <div className={styles.statBlock}>
                        <div className={styles.statLabel}>Accuracy</div>
                        <div style={{ width: 80, height: 80, margin: "0.5rem auto" }}>
                          <CircularProgressbar
                            value={accuracyValue}
                            text={`${accuracyValue}%`}
                            styles={buildStyles({
                              textColor: "#00e5ff",
                              pathColor: "#00e5ff",
                              trailColor: "rgba(255, 255, 255, 0.1)",
                              textSize: "16px",
                            })}
                          />
                        </div>
                      </div>
                      <div className={styles.statBlock}>
                        <div className={styles.statLabel}>Average Time</div>
                        <div className={styles.statValue}>{avgTime}s</div>
                      </div>
                    </>
                  )
                )
                : <div>Loading...</div>
              }
            </div>) : (
              <div className={styles.ownScoreBox}>
                <h3>How to Play</h3>
                <ul className={styles.instructionList}>
                  <li>🗺 Hover a country to see its name.</li>
                  <li>🖱 Click a country to submit your guess.</li>
                  <li>💡 Use hints to reach the answer.</li>
                  <li>🔒 The initial score for each country is 100.</li>
                  <li>🚫 Every hint deducts 20 scores.</li>
                  <li>❗ You can use a maximum of 5 hints.</li>
                  <li>➡️ Click Next to start the next guess.</li>
                  <li>🎯 You will get a 10% score discount in easy mode.</li>
                  <li>🌐 Keep a good internet connection to avoid offline.</li>
                </ul>
              </div>
            )}
          </div>

          {/* map area */}
          <div className={styles.mapArea}>
            <InteractiveMap />
          </div>
        </div>

        {/* overlay */}
        {gameEnded && (
          <div className={styles.endOverlay}>
            <div className={styles.endMessage}>
              {endMessage}
            </div>
          </div>
        )}
      </div>
    </>
  );

}

export default GameBoard;
