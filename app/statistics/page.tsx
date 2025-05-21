"use client";

import React, { useState, useEffect } from "react";
import { countryCodeMap } from "@/utils/countryCodeMap";
import { useApi } from "@/hooks/useApi";
import { useParams } from "next/navigation";
import styles from "@/styles/Statistics.module.css";
import { useSelector } from "react-redux";
import { Luckiest_Guy, Orbitron } from "next/font/google";

const luckiestGuy = Luckiest_Guy({ weight: "400", subsets: ['latin'] });
const orbitron = Orbitron({ weight: "500", subsets: ['latin'] });

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
          const formattedData: Country[] = Object.entries(learningTracking)
            .filter(([_, answered]) => answered > 0)
            .map(([name, answered]) => ({ name, answered }));
          // 排序：数量多的在前
          formattedData.sort((a, b) => b.answered - a.answered);
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
  }, [apiService, id, userId]);

  // 总答题数统计
  const totalAnswered = countryData.reduce((sum, c) => sum + c.answered, 0);

  return (
    <div className={styles.container}>
<h1 className={`${styles.heading} ${luckiestGuy.className}`}>
  <span style={{
    display: "inline-block",
    marginRight: 8,
    fontSize: "1.25em",
    verticalAlign: "middle"
  }}>📈</span>
  <span
    style={{
      background: "linear-gradient(90deg,#32d1ff,#3fffa8 60%,#fff46c 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      display: "inline-block",
      fontWeight: 900,
      letterSpacing: "1.7px"
    }}
  >
    User Statistics
  </span>
</h1>
<p className={`${styles.description} ${orbitron.className}`}>
  The flags below represent the number of correctly answered questions for each country across all game modes.<br />
  <span style={{ color: "#ffc63f", fontWeight: 600 }}>
    Total correct: {totalAnswered} | Countries: {countryData.length}
  </span>
  <br />
  <span style={{ color: "#54e1f7" }}>
    📈 If no flags are displayed, the player has not yet participated in any games.
  </span>
</p>

      {loading ? (
        <p className={styles.loading}>Loading...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : null}

      <div className={styles.grid}>
        {countryData.length === 0 && !loading && (
          <div style={{ color: "#888", fontSize: "1.15em", margin: "32px 0" }}>
            No answered questions yet.<br />Start your first game!
          </div>
        )}
        {countryData.map((country, index) => {
          const countryCode = countryCodeMap[country.name] || "unknown";
          return (
            <div key={index} className={styles.card}>
              <img
                src={countryCode !== "unknown"
                  ? `/flag/${countryCode}.svg`
                  : `/flag/world.svg`}
                alt={country.name}
                className={styles.flag}
                style={{
                  filter: country.answered >= 20 ? "drop-shadow(0 0 8px #ffd70066)" : undefined,
                  border: country.answered >= 20 ? "2.5px solid #ffd700cc" : "2.5px solid #eee",
                  background: "#fff"
                }}
              />
              <p className={styles.label}>
                <span style={{
                  fontWeight: country.answered >= 20 ? "bold" : "normal",
                  color: country.answered >= 20 ? "#f7b924" : "#3faff7",
                  fontSize: country.answered >= 30 ? "1.1em" : "1em"
                }}>
                  {country.name}
                </span>
                <span style={{
                  marginLeft: 8,
                  fontWeight: "bold"
                }}>
                  {country.answered >= 50 ? "🏆" : country.answered >= 30 ? "🌟" : ""}
                  {country.answered}
                  {" "}
                  <span style={{ color: "#95de64" }}>✔</span>
                </span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuestPage;
