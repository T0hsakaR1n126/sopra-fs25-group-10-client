import React, { useState } from 'react';
import styles from "@/styles/lobby.module.css";
import { useDispatch } from 'react-redux';
import { useApi } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Game } from '@/types/game';

const CreateForm: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  const username = useSelector((state: { user: { username: string } }) => state.user.username)
  const [isPrivate, setIsPrivate] = useState(false);
  const [gameName, setGameName] = useState("");
  const [password, setPassword] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("2");
  const [duration, setDuration] = useState("5");

  const handleCreateGame = async () => {
    if (!gameName.trim()) {
      alert("Game name cannot be empty!");
      return;
    }

    const newGame: Game = {
      gameName: gameName,
      playersNumber: maxPlayers,
      time: duration,
      password: password,
      owner: username,
      gameId: null,
      realPlayersNumber: null,
      modeType: "combat" // placeholder
    };

    try {
      const response = await apiService.post<Game>("/games", newGame);
      console.log(JSON.stringify(response, null, 2));
      if (response.gameId)  {
        alert("Game created successfully!");
        router.push("/game/1v1")
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
    <form className={styles.form} onSubmit={handleCreateGame}>
      <h2 className={styles.createTitle}>Create Game Session</h2>
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
          <option value="5">5 Minutes</option>
          <option value="10">10 Minutes</option>
          <option value="15">15 Minutes</option>
          <option value="30">30 Minutes</option>
        </select>
      </label>

      <div className={styles.inlineField}>
        <span className={styles.labelText}>Private 🔒</span>

        <label className={styles.switch}>
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          <span className={styles.slider}></span>
        </label>
      </div>

      {isPrivate && (
        <label>
          Password:
          <input
            type="text"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      )}

      <button type="submit" className={styles.createButton}>Create</button>
    </form>
  );
};

export default CreateForm;
