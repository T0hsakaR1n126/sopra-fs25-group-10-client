"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Layout, Typography, Row, Col, Card } from "antd";
import { useApi } from "@/hooks/useApi"; // Import the custom API hook

const { Content } = Layout;
const { Title, Text } = Typography;

interface TeamCardProps {
  teamName: string;
  players: string[];
  score: number;
  bgColor: string;
}

const TeamCard: React.FC<TeamCardProps> = ({ teamName, players, score, bgColor }) => (
  <Card
    style={{ backgroundColor: bgColor, borderRadius: "20px", padding: "20px", width: "100%" }}
    bodyStyle={{ display: "flex", flexDirection: "column", alignItems: "center" }}
  >
    <Title level={4} style={{ color: "#000" }}>{teamName}</Title>
    {players.map((player: string, index: number) => (
      <Text key={index} style={{ color: "#000", margin: "5px 0" }}>{player}</Text>
    ))}
    <Title level={3} style={{ color: "#000", marginTop: "10px" }}>{score} points</Title>
  </Card>
);

interface GameData {
  winningTeam: string | null;
  team1: { name: string; players: string[]; score: number };
  team2: { name: string; players: string[]; score: number };
}

const Results = () => {
  const dummyGameId = "12345"; // Hardcoded dummy game ID
  const apiService = useApi(); // Initialize API service hook
  const [loading, setLoading] = useState(true);
  const [gameData, setGameData] = useState<GameData>({
    winningTeam: null,
    team1: { name: "", players: [], score: 0 },
    team2: { name: "", players: [], score: 0 },
  });

  useEffect(() => {
    if (dummyGameId) {
      handleFetchGameScore(dummyGameId); // Use the dummy game ID
    } else {
      console.log("No game ID found");
    }
  }, [dummyGameId]);

  /**
   * Fetch game score data and set it in the state.
   * @param gameId - The game ID from the query params
   */
  const handleFetchGameScore = async (gameId: string) => {
    setLoading(true);
    try {
      const data = await apiService.getGameScore(gameId); // Fetch game score using the API service
      console.log("Fetched game data:", data);

      setGameData({
        winningTeam: data["winning team"] || "No Winner",
        team1: {
          name: data.team1?.name || "Team 1",
          players: data.team1?.players || ["Player 1", "Player 2"],
          score: data.team1?.score || 0,
        },
        team2: {
          name: data.team2?.name || "Team 2",
          players: data.team2?.players || ["Player 3", "Player 4"],
          score: data.team2?.score || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching game results:", error);
      // Fallback to dummy data if there's an error
      setGameData({
        winningTeam: "No Winner Yet",
        team1: { name: "Team 1", players: ["Alice", "Bob"], score: 5 },
        team2: { name: "Team 2", players: ["Charlie", "Dave"], score: 3 },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>MapMaster - Game Results</title>
        <meta name="description" content="MapMaster Game Results" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout style={{ minHeight: "100vh", backgroundColor: "#000" }}>
        <Content style={{ padding: "50px" }}>
          <Row justify="center" align="middle">
            <Col span={24} style={{ textAlign: "center", marginBottom: "20px" }}>
              {loading ? (
                <Text style={{ color: "#fff", fontSize: "18px" }}>Loading results...</Text>
              ) : (
                <Title level={2} style={{ color: "#fff" }}>
                  🎉 {gameData.winningTeam ? `Congratulations to ${gameData.winningTeam}!` : "Awaiting results..."} 🎉
                </Title>
              )}
            </Col>
          </Row>

          {!loading && (
            <Row gutter={[24, 24]} justify="center">
              <Col xs={24} sm={12} md={8}>
                <TeamCard
                  teamName={gameData.team1.name}
                  players={gameData.team1.players}
                  score={gameData.team1.score}
                  bgColor="#f0f0f0"
                />
              </Col>
              <Col xs={24} sm={12} md={8} style={{ display: "flex", justifyContent: "center" }}>
                <img
                  src="/congrats.gif"
                  alt="Congrats"
                  style={{ width: "200px", height: "200px", objectFit: "contain" }}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <TeamCard
                  teamName={gameData.team2.name}
                  players={gameData.team2.players}
                  score={gameData.team2.score}
                  bgColor="#e6f7ff"
                />
              </Col>
            </Row>
          )}
        </Content>
      </Layout>
    </>
  );
};

export default Results;
