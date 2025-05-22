"use client";

import React, { useState, useEffect } from "react";
import { countryCodeMap } from "@/utils/countryCodeMap";
import { useApi } from "@/hooks/useApi";
import styles from "@/styles/Statistics.module.css";
import { useSelector } from "react-redux";
import { showErrorToast } from "@/utils/showErrorToast";

const allCountries = Object.keys(countryCodeMap);
const grouped = allCountries.reduce((acc, country) => {
  const letter = country[0].toUpperCase();
  if (!acc[letter]) acc[letter] = [];
  acc[letter].push(country);
  return acc;
}, {} as Record<string, string[]>);

const Statistics: React.FC = () => {
  const apiService = useApi();
  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId);

  const [collectedCountries, setCollectedCountries] = useState<Set<string>>(new Set());

  const [isLeaving, setIsLeaving] = useState(false);
  useEffect(() => {
    const handleExit = () => {
      if (!isLeaving) setIsLeaving(true);
    };

    window.addEventListener("otherExit", handleExit);
    return () => window.removeEventListener("otherExit", handleExit);
  }, [isLeaving]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiService.get(`/users/${userId}`);
        const { learningTracking } = response as { learningTracking: Record<string, number> };
        const collected = Object.entries(learningTracking)
          .filter(([, count]) => count > 0)
          .map(([country]) => country);
        setCollectedCountries(new Set(collected));
      } catch (e) {
        if (e instanceof Error) {
          showErrorToast(e.message);
        }
      }
    };
    fetchUserData();
  }, [apiService, userId]);

  return (
    <div className={`${styles.container} ${isLeaving ? styles.pageExit : styles.pageEnter}`}>
      <h2 className={styles.title}>📈 User Statistics</h2>
      <h3 className={styles.subtitle}>
        🚩 Light up the flags of countries you have guessed right!
      </h3>

      <div className={styles.grid}>
        {Object.keys(grouped).sort().map(letter => (
          <div key={letter} className={styles.group}>
            <h3 className={styles.groupTitle}>{letter}</h3>
            <div className={styles.grid}>
              {grouped[letter].map((name, idx) => {
                const code = countryCodeMap[name] || "unknown";
                const collected = collectedCountries.has(name);
                return (
                  <div
                    key={idx}
                    className={`${styles.card} ${collected ? styles.collected : styles.locked}`}
                    onClick={() => {
                      if (collected) {
                        window.open(`https://en.wikipedia.org/wiki/${name}`, "_blank");
                      }
                    }}
                  >
                    <img src={`/flag/${code}.svg`} alt={name} className={styles.flag} />
                    <p className={styles.label}>{collected ? name : "???"}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
};

export default Statistics;
