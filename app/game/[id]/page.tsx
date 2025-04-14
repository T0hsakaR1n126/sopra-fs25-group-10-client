"use client";

import React, { useState } from 'react';
import styles from '@/styles/gameBoard.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { hintUsageIncrement } from '@/gameSlice';
import InteractiveMap from '@/hooks/interactiveMap';

const GameBoard: React.FC = () => {
  const dispatch = useDispatch(); // Set up dispatch for Redux actions
  const [hintIndex, setHintIndex] = useState(1);
  const rawHints = useSelector(
    (state: { game: { hints: { difficulty: string; text: string }[] } }) =>
      state.game.hints || []
  );
  const hints = [...rawHints].sort((a, b) => parseInt(b.difficulty) - parseInt(a.difficulty));
  console.log("hints", hints);

  const currentHint = hints[hintIndex - 1];
  const handleHintClick = (index: number) => {
    if (index === hintIndex && hintIndex < hints.length) {
      setHintIndex(prev => prev + 1);
      dispatch(hintUsageIncrement());
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <button className={styles.userBoxGreen}>Exit</button>
        <button className={styles.userBoxBlue}>scoreboard</button>
        <div className={styles.timer}>
          <div>Time left:</div>
          <div className={styles.red}>04:00</div>
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
              const isUsed = index < hintIndex;

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
