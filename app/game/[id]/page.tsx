import React from 'react';
import styles from '@/styles/gameBoard.module.css';

const GameBoard: React.FC = () => {
  return (
    <div className={styles.container}>
    <div className={styles.topBar}>
      <button className={styles.userBoxGreen}>
        Exit
      </button>
      <button className={styles.userBoxBlue}>
        scoreboard
      </button>
      <div className={styles.timer}>
        <div>Time left:</div>
        <div className={styles.red}>04:00</div>
      </div>
    </div>

    <div className={styles.mainContent}>
      <div className={styles.hintBox}>
        <p><strong>Hint 2:</strong><br />This country is one of the most innovative countries in the world.</p>
        <div className={styles.hintIcons}>
          Get a hint (4):<br />
          {[...Array(4)].map((_, i) => (
            <span key={i} className={styles.hintIcon}></span>
          ))}
        </div>
      </div>

      <div className={styles.mapArea}>
        <img src="/map.svg" alt="Map" className={styles.mapImage} />
      </div>
    </div>
  </div>
  );
}

export default GameBoard;
