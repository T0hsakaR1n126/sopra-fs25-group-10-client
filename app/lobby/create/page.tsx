"use client";

import React, { useState } from 'react';
import styles from "@/styles/createForm.module.css";
import { useApi } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Game } from '@/types/game';
import { gameInitialize } from '@/gameSlice';

const CreateForm: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  const dispatch = useDispatch(); // Set up dispatch for Redux actions
  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId)
  // const [isPrivate, setIsPrivate] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [gameName, setGameName] = useState("");
  const [password, setPassword] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("2");
  const [duration, setDuration] = useState("1");

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    if (!gameName.trim()) {
      alert("Game name cannot be empty!");
      return;
    }

    const newGame: Game = {
      gameName: gameName,
      gameCode: null,
      playersNumber: maxPlayers,
      time: duration,
      password: password,
      ownerId: userId,
      hints: null,
      gameId: null,
      realPlayersNumber: null,
      modeType: "combat",
      endTime: null,
      scoreBoard: null,
      answer: null,
      difficulty: difficulty,
    };

    try {
      const response = await apiService.post<Game>("/games", newGame);
      if (response.gameId) {
        dispatch(gameInitialize(
          {
            gameId: response.gameId,
            gamename: response.gameName,
            gameCode: response.gameCode,
            gameStarted: false,
            modeType: response.modeType,
            time: response.time,
            ownerId: null,
            hints: null,
            gameHistory: [],
            learningProgress: [],
            currentGameMode: null,
            currentTeamId: null,
            gameResults: null,
            hintUsage: 0,
            scoreBoard: null,
            answer: null,
            playersNumber: response.playersNumber ? parseInt(response.playersNumber, 10) : null,
          }
        ));
        router.push(`/game/start/${response.gameId}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during game creation:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during game creation.");
      }
    }
  };

  return (
    <div className="createForm">
      <form className={styles.form} onSubmit={handleCreateGame}>
        <label>
          Game Name:
          <input
            type="text"
            className={styles.input}
            onChange={(e) => setGameName(e.target.value)}
          />
        </label>

        <label>
          Max Players:
          <select className={styles.input} onChange={(e) => setMaxPlayers(e.target.value)}>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </label>

        <label>
          Duration:
          <select className={styles.input} onChange={(e) => setDuration(e.target.value)}>
            <option value="1">1 Minutes</option>
            <option value="2">2 Minutes</option>
            <option value="5">5 Minutes</option>
          </select>
        </label>

        <label>
          Password (Optional):
          <input
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        <label>
          Difficulty:
          <select className={styles.input} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">easy</option>
            <option value="hard">hard</option>
          </select>
        </label>

        <button type="submit" className={styles.createButton}>Create</button>
      </form>
    </div>
  );
};

export default CreateForm;
