"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { Layout, Typography, Row, Col, Card } from "antd";
import { useApi } from "@/hooks/useApi";
// import { useSelector } from "react-redux";
// import { RootState } from "../../";
import styles from "../../styles/results.module.css";
import { useSelector } from "react-redux";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const { Content } = Layout;
const { Title, Text } = Typography;

interface TeamCardProps {
  teamName: string;
  score: number;
  players?: string[];
  bgColor: string;
  isWinner?: boolean;
}

const TeamCard: React.FC<TeamCardProps> = ({
  teamName,
  score,
  players = [],
  bgColor,
  isWinner = false,
}) => (
  <Card
    className={`${styles.teamCard} ${isWinner ? styles.winnerCard : ""}`}
    style={{ backgroundColor: bgColor }}
    bodyStyle={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}
  >
    <Title level={4} className={styles.teamTitle}>{teamName}</Title>
    {players.map((player, index) => (
      <Text key={index} className={styles.playerText}>
        {player}
      </Text>
    ))}
    <Title level={3} className={styles.scoreText}>{score} points</Title>
  </Card>
);

interface GameData {
  mode: "solo" | "combat";
  combatType?: "1v1" | "team";
  userScore: number;
  opponentScore?: number;
  userName?: string;
  opponentName?: string;
  isWinner?: boolean;
  userTeamName?: string;
  opponentTeamName?: string;
  userTeamPlayers?: string[];
  opponentTeamPlayers?: string[];
}

const Results = () => {
  const apiService = useApi();
  // const userId = useSelector((state: RootState) => state.user.userId);
  // const username = useSelector((state: RootState) => state.user.username);
  const [loading, setLoading] = useState(true);
  const [isWinner, setIsWinner] = useState(false);
  const [scoreBoard, setScoreBoard] = useState<Map<string, number> | null>(null);

  const gameId = useSelector((state: { game: { gameId: string | null } }) => state.game.gameId);
  const username = useSelector((state: { user: { username: string } }) => state.user.username);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('STOMP connected');

        client.subscribe(`/topic/end/scoreBoard`, (message) => {
          try {
            console.log('RAW message body:', message.body);
            const data: Map<string, number> = JSON.parse(message.body);
            setScoreBoard(new Map(Object.entries(data)));
            setIsWinner(username === String(data.keys().next().value));
          } catch (err) {
            console.error('Invalid message:', err);
          }
        });
      },
      onDisconnect: () => {
        console.log('STOMP disconnected');
      }
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  useEffect(() => {
    const fetchGameResults = async (gameId: string) => {
      setLoading(true);
      try {
        await apiService.put(`/save/${gameId}`, {});
      } catch (error) {
        console.error("Failed to fetch game results:", error);
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchGameResults(gameId);
    }
  }, [gameId]);

    return (
      <>
        <Row justify="center">
          <Col span={24} className={styles.headerCol}>
            <Title
              level={2}
              className={`${styles.title} ${username === scoreBoard?.get(0) ? styles.winTitle : styles.loseTitle
                }`}
            >
              {isWinner
                ? `🎉 ${userLabel} wins! 🎉`
                : `${opponentLabel} takes the win — better luck next time!`}
            </Title>
          </Col>
        </Row>

        <Row gutter={[24, 24]} justify="center" align="top">
          <Col xs={24} sm={12} md={8}>
            <TeamCard
              teamName={userLabel || "You"}
              score={userScore}
              players={combatType === "team" ? userTeamPlayers : undefined}
              bgColor="#f0f0f0"
              isWinner={isWinner}
            />
          </Col>

          <Col xs={24} sm={12} md={8} className={styles.centerCol}>
            <Image
              src={isWinner ? "/congrats.gif" : "/betterluck.gif"}
              alt={isWinner ? "Congrats" : "Better Luck"}
              width={300}
              height={300}
              priority
              className={styles.gifImage}
            />
          </Col>

          <Col xs={24} sm={12} md={8}>
            <TeamCard
              teamName={opponentLabel || "Opponent"}
              score={opponentScore ?? 0}
              players={combatType === "team" ? opponentTeamPlayers : undefined}
              bgColor="#e6f7ff"
              isWinner={!isWinner}
            />
          </Col>
        </Row>
      </>
    );
  };

  return (
    <>
      <Head>
        <title>MapMaster - Game Results</title>
        <meta name="description" content="MapMaster Game Results" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout className={styles.layout}>
        <Content className={styles.content}>
          {loading ? (
            <Row justify="center">
              <Col>
                <Text className={styles.loadingText}>Loading results...</Text>
              </Col>
            </Row>
          ) : (
            renderContent()
          )}
        </Content>
      </Layout>
    </>
  );
};

export default Results;
