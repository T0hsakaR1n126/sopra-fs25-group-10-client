"use client";

import React, { useState, useEffect } from "react";
import { countryCodeMap } from "@/utils/countryCodeMap";
import { useApi } from "@/hooks/useApi";
import { useParams } from "next/navigation";
import styles from "@/styles/GuestStatsGrid.module.css";
import { useSelector } from "react-redux";

interface Country {
  name: string;
  answered: number;
}

const GuestPage: React.FC = () => {
  const apiService = useApi();
  const { id } = useParams();
  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId);

  const [countryData, setCountryData] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const response = await apiService.get(`/users/${userId}`);
        const { learningTracking } = response as { learningTracking: Record<string, number> };

        if (
          learningTracking &&
          typeof learningTracking === "object" &&
          Object.entries(learningTracking).every(([k, v]) => typeof k === "string" && typeof v === "number")
        ) {
          const formattedData: Country[] = Object.entries(learningTracking).map(([name, answered]) => ({
            name,
            answered,
          }));
          setCountryData(formattedData);
        } else {
          throw new Error("Invalid learningTracking data.");
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to fetch user data:", error.message);
          setError("Failed to load user country statistics. Showing mock data.");
        } else {
          setError("Unknown error occurred.");
        }

        // fallback mock data
        setCountryData([
          { name: "Switzerland", answered: 25 },
          { name: "United States", answered: 30 },
          { name: "France", answered: 18 },
          { name: "Germany", answered: 22 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [apiService, id]);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>User Statistics</h1>
      <p className={styles.description}>
        The flags below represent the number of correctly answered questions for each country across all game modes. If no flags are displayed, the player has not yet participated in any games.
      </p>

      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : null}

      <div className={styles.grid}>
        {countryData.map((country, index) => {
          const countryCode = countryCodeMap[country.name] || "unknown";
          return (
            <div key={index} className={styles.card}>
              <img
                src={`/flag/${countryCode}.svg`}
                alt={country.name}
                className={styles.flag}
              />
              <p className={styles.label}>
                {country.name}: {country.answered} questions
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuestPage;