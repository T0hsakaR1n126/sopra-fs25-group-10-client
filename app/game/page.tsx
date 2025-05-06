"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React, { useEffect, useState } from "react"; // Ensure React is imported for JSX
import "../styles/dashboard.css";
import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { Game } from "@/types/game";
import { useDispatch, useSelector } from "react-redux";
import { useApi } from "@/hooks/useApi";
import { Client } from "@stomp/stompjs";
import { gameIdUpdate, gameStart, gameTimeInitialize, ownerUpdate } from "@/gameSlice";

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const dispatch = useDispatch(); // Set up dispatch for Redux actions
  const [selectedSoloTime, setSelectedSoloTime] = useState("1");
  const [selectedSoloDifficulty, setSelectedSoloDifficulty] = useState("0");
  const [showSoloPopup, setSoloShowPopup] = useState(false);
  const [selectedExerciseDifficulty, setSelectedExerciseDifficulty] = useState("0");
  const [showExercisePopup, setExerciseShowPopup] = useState(false);
  const [countDown, setCountDown] = useState<string | null>(null);
  const [countDownStart, setCountDownStart] = useState<number | null>(null);
  const username = useSelector(
    (state: { user: { username: string } }) => state.user.username
  );
  const userId = useSelector(
    (state: { user: { userId: string } }) => state.user.userId
  );
  const gameId = useSelector(
    (state: { game: { gameId: string } }) => state.game.gameId
  );

  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws', // TODO: replace with your WebSocket URL
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('STOMP connected', gameId);

        client.subscribe(`/topic/startsolo/${userId}/gameId`, (message) => {
          try {
            const data: string = message.body;
            dispatch(gameIdUpdate(data));
          } catch (err) {
            console.error('Invalid message:', err);
          }
        });

        client.subscribe(`/topic/startExercise/${userId}/gameId`, (message) => {
          try {
            const data: string = message.body;
            dispatch(gameIdUpdate(data));
          } catch (err) {
            console.error('Invalid message:', err);
          }
        });

        client.subscribe(`/topic/start/${gameId}/ready-time`, (message) => {
          try {
            console.log('RAW message body:', message.body);
            const data: string = message.body;
            setCountDownStart(parseInt(data));
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
                modeType: game.modeType ?? "solo",
                answer: game.answer ?? "",
              }));
              dispatch(ownerUpdate(userId));
              dispatch(gameTimeInitialize(game.time ?? ""));
            }
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
  }, [gameId, userId, dispatch]);

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
  }, [countDownStart, gameId, router]);

  const handleStart = async (isExercise: boolean) => {
    const newGame: Game = {
      gameName: isExercise ? username + "-Exercise-" : username + "-Solo-",
      gameCode: null,
      playersNumber: "1",
      time: isExercise ? "-1" : selectedSoloTime,
      password: "",
      ownerId: userId,
      hints: null,
      gameId: null,
      realPlayersNumber: null,
      modeType: isExercise ? "exercise" : "solo", // placeholder
      endTime: null,
      scoreBoard: null,
      answer: null,
    };

    try {
      console.log(newGame);
      if (!isExercise) {
        await apiService.post<Game>("/startsolo", newGame);
      } else {
        await apiService.post<Game>("/startexercise", newGame);
      } 
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during game creation:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during game creation.");
      }
    }
  };

  const toggleSoloPopup = () => {
    setSoloShowPopup(!showSoloPopup);
    if (showExercisePopup) setExerciseShowPopup(!showExercisePopup);
  };

  const toggleExercisePopup = () => {
    setExerciseShowPopup(!showExercisePopup);
    if (showSoloPopup) setSoloShowPopup(!showSoloPopup);
  };

  return (
    <div className="game-body">
      <div className="game-container">
        <div className="solo-container">
          <button className="button solo-button" onClick={toggleSoloPopup}>
            <div className="button-inner">
              <img src="/solo.png" alt="Solo Icon" className="button-icon" />
              <span className="button-label">SOLO</span>
            </div>
          </button>
          <div className={`popup ${showSoloPopup ? "visible" : "hidden"}`}>
            {/* <div className="popup-header">⏱ Time Setting:</div> */}

            <div className="popup-controls">
              <div className="slider-row">
                <span className="slider-prefix">⌛</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={selectedSoloTime}
                  onChange={(e) => setSelectedSoloTime(e.target.value)}
                  className="time-slider solo-slider"
                />
                <span className="time-label">{selectedSoloTime} min{selectedSoloTime !== "1" ? "s" : ""}</span>
              </div>
              <div className="slider-row">
                <span className="slider-prefix">⚔️</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="1"
                  value={selectedSoloDifficulty}
                  onChange={(e) => setSelectedSoloDifficulty(e.target.value)}
                  className="time-slider solo-slider"
                />
                <span className="time-label">{selectedSoloDifficulty === "0" ? "easy" : "hard"}</span>
              </div>

              <button className="start-btn solo-btn" onClick={() => handleStart(false)}>
                Start
              </button>
            </div>
          </div>
        </div>

        <div className="combat-container">
          <button className="button combat-button" onClick={() => router.push("/lobby")}>
            <div className="button-inner">
              <img src="/combat.png" alt="Combat Icon" className="button-icon" />
              <span className="button-label">COMBAT</span>
            </div>
          </button>
        </div>

        <div className="exercise-container">
          <button className="button exercise-button" onClick={toggleExercisePopup}>
            <div className="button-inner">
              <img src="/exercise.png" alt="Exercise Icon" className="button-icon" />
              <span className="button-label">EXERCISE</span>
            </div>
          </button>
          <div className={`popup ${showExercisePopup ? "visible" : "hidden"}`}>
            <div className="popup-controls">
              <div className="slider-row">
                <span className="slider-prefix">⚔️</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="1"
                  value={selectedSoloDifficulty}
                  onChange={(e) => setSelectedSoloDifficulty(e.target.value)}
                  className="time-slider exercise-slider"
                />
                <span className="time-label">{selectedSoloDifficulty === "0" ? "easy" : "hard"}</span>
              </div>

              <button className="start-btn exercise-btn" onClick={() => handleStart(true)}>
                Start
              </button>
            </div>
          </div>
        </div>

      </div>
      {countDown !== null && (
        <div className="overlay">
          <div className="countdown" key={countDown}>{countDown === "0" ? "GO!" : countDown}</div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
