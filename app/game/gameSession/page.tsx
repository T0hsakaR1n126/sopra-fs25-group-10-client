'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Typography, Space, Button } from 'antd';
import styles from '../../styles/gameScreen.module.css';
import { useRouter } from 'next/navigation';

const { Content } = Layout;
const { Text } = Typography;

const GameScreen = () => {
  const [team1Score] = useState(2); // Removed setTeam1Score
  const [team2Score] = useState(4); // Removed setTeam2Score
  const [timeLeft, setTimeLeft] = useState(5); // Timer for 5 seconds
  const [currentCountryQuestion] = useState('Which country is this?'); // Removed setCurrentCountryQuestion
  const [hintsUsed, setHintsUsed] = useState(0); // Tracks the number of hints used
  const [hintCost] = useState(4); // Removed setHintCost
  const [currentHintText, setCurrentHintText] = useState(''); // State to store the current hint text
  const router = useRouter();

  const [hints, setHints] = useState([
    { id: 0, text: 'Hint 0: Country with famous pyramids', used: false, available: true },
    { id: 1, text: 'Hint 1: Country with ancient temples', used: false, available: false },
    { id: 2, text: 'Hint 2: Country known for its rich cultural history', used: false, available: false },
    { id: 3, text: 'Hint 3: Country with a large desert', used: false, available: false },
    { id: 4, text: 'Hint 4: Country located in Africa', used: false, available: false }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    if (timeLeft === 0) {
      clearInterval(timer);
      console.log('Redirecting to results...');
      router.push('/game/results');
    }

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleUseHint = (hintId: number) => {
    console.log(`Using hint with ID: ${hintId}`);
    const updatedHints = hints.map((hint) => {
      if (hint.id === hintId && !hint.used) {
        return { ...hint, used: true, available: false };
      } else if (hint.id === hintId + 1 && !hint.available) {
        return { ...hint, available: true };
      }
      return hint;
    });

    setHints(updatedHints);
    setHintsUsed(hintsUsed + 1);
  };

  const getHintText = (hintId: number) => {
    const hint = hints.find((hint) => hint.id === hintId);
    return hint ? hint.text : '';
  };

  const handleHintClick = (hintId: number) => {
    const hintText = getHintText(hintId);
    setCurrentHintText(hintText);

    if (hints[hintId].available && !hints[hintId].used) {
      handleUseHint(hintId);
    }
  };

  const renderHintIcons = () => {
    return hints.map((hint) => {
      const hintIconSrc = `/hint_${hint.used ? 'used' : hint.available ? 'available' : 'unused'}.png`;

      return (
        <img
          key={hint.id}
          src={hintIconSrc}
          alt={`Hint ${hint.id}`}
          className={`${styles.hintIcon} ${hint.used ? styles.hintUsed : ''} ${hint.available ? styles.clickable : ''}`}
          onClick={() => (hint.available || hint.used) && handleHintClick(hint.id)}  // Only allow clicking if available or used
          style={{ cursor: (hint.available || hint.used) ? 'pointer' : 'not-allowed' }}  // Change cursor style based on hint availability
        />
      );
    });
  };

  const handleEndSessionForMe = () => {
    console.log("Ending session for me...");
    // TODO: Implement logic to end the session for this player
  };

  const handleEndForEveryone = () => {
    console.log("Ending session for everyone...");
    // TODO: Implement logic to end the session for everyone
  };

  return (
    <Layout className={styles.layout}>
      <Content className={styles.content}>
        <div className={styles.headerRow}>
          <div className={styles.teamBoxGreen}>
            <Text strong className={styles.whiteText}>Map Genies</Text><br />
            <Text className={styles.whiteText}>Countries identified: {team1Score}</Text>
          </div>
          <div className={styles.teamBoxBlue}>
            <Text strong className={styles.whiteText}>Map Dragons</Text><br />
            <Text className={styles.whiteText}>Countries identified: {team2Score}</Text>
          </div>
          <div className={styles.timerBox}>
            <Text strong className={styles.timerLabel}>Time left:</Text><br />
            <Text className={styles.timer}>{formatTime(timeLeft)}</Text>
          </div>
        </div>

        <div className={styles.mainRow}>
          <div className={styles.questionBox}>
            <Text strong className={styles.label}>Country 1:</Text><br />
            <Text className={styles.text}>{currentCountryQuestion}</Text><br />
            <Text strong className={styles.label}>Hint {hintsUsed + 1}:</Text><br />
            <Text className={styles.text}>{currentHintText}</Text>

            <div className={styles.hintRow}>
              <Text strong className={styles.hintLabel}>Get a hint ({hintCost}):</Text>
              <Space>
                {renderHintIcons()}
              </Space>
            </div>
          </div>
          <div className={styles.mapContainer}>
            <img src="/world_map.png" alt="World Map" className={styles.mapImage} />
            <div className={styles.mapOverlay}>
              Scroll to zoom
              <br />
              Double click to lock in
            </div>
          </div>
        </div>

        <div className={styles.endSessionButtons}>
          <Button
            className={styles.endButton}
            onClick={handleEndSessionForMe}
            type="primary"
            danger
          >
            End session for me
          </Button>
          <Button
            className={styles.endButton}
            onClick={handleEndForEveryone}
            type="primary"
            danger
          >
            End for everyone
          </Button>
        </div>
      </Content>
    </Layout>
  );
};

export default GameScreen;
