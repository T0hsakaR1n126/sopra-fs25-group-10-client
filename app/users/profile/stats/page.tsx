"use client";

import React, { useState, useEffect } from "react";
import { countryCodeMap } from "@/utils/countryCodeMap";
import { useApi } from "@/hooks/useApi";
import { useParams } from "next/navigation";
import styles from "@/styles/GuestStatsGrid.module.css";

interface Country {
  name: string;
  answered: number;
}

const GuestPage: React.FC = () => {
  const apiService = useApi();
  const { id } = useParams();

  const [countryData, setCountryData] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountryStats = async () => {
      try {
        setLoading(true);

        const response: Country[] = await apiService.get(`/users/${id}/statistics`);

        if (Array.isArray(response) && response.every(item => "name" in item && "answered" in item)) {
          setCountryData(response);
        } else {
          throw new Error("Invalid data format from server.");
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error("Failed to fetch country statistics:", error.message);
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
          { name: "Japan", answered: 20 },
          { name: "China", answered: 27 },
          { name: "India", answered: 24 },
          { name: "Italy", answered: 19 },
          { name: "Spain", answered: 21 },
          { name: "Brazil", answered: 26 },
          { name: "Canada", answered: 23 },
          { name: "Russia", answered: 17 },
          { name: "South Korea", answered: 22 },
          { name: "Australia", answered: 20 },
          { name: "Mexico", answered: 18 },
          { name: "United Kingdom", answered: 29 },
          { name: "Argentina", answered: 16 },
          { name: "South Africa", answered: 15 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryStats();
  }, [apiService, id]);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>User Statistics</h1>

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
                src={`/flag/${countryCode}.png`}
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
