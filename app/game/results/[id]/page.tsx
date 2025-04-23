"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { Layout, Typography, Row, Col, Card } from "antd";
import { useApi } from "@/hooks/useApi";
import styles from "@/styles/results.module.css";
import { useSelector } from "react-redux";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const { Content } = Layout;
const { Title, Text } = Typography;

interface Game1v1CardProps {
  players?: Map<string, number>;
  bgColor: string;
  isWinner?: boolean;
}

const Game1v1Card: React.FC<Game1v1CardProps> = ({
  players = new Map(),
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
    {Array.from(players.entries()).map(([player, score]) => (
      <div key={player}>
        <Text>{player}: {score} points</Text>
      </div>
    ))}
  </Card>
);

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
  mode: "SOLO" | "ONE_VS_ONE" | "TEAM_V_TEAM";
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
  const [winnerMap, setWinnerMap] = useState<Map<string, number> | null>(null);
  const [loserMap, setLoserMap] = useState<Map<string, number> | null>(null);

  useEffect(() => {
    if (scoreBoard) {
      const entries = Array.from(scoreBoard.entries());
      if (entries.length > 0) {
        const [firstEntry, ...remainingEntries] = entries;
        setWinnerMap(new Map([firstEntry]));
        setLoserMap(new Map(remainingEntries));
      }
    }
  }, [scoreBoard]);

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
  }, []);

  const renderContent = () => {
    if (!scoreBoard) return null;

    // TODO: Replace with actual game data fetching logic
    // if (mode === "solo") {
    //   return (
    //     <Row justify="center" align="middle">
    //       <Col>
    //         <Title level={3} className={styles.title}>
    //           You scored {userScore} points!
    //         </Title>
    //         <Image
    //           src="/solo.gif"
    //           alt="Solo game"
    //           width={280}
    //           height={280}
    //           priority
    //         />
    //       </Col>
    //     </Row>
    //   );
    // }

    return (
      <>
        <Row justify="center">
          <Col span={24} className={styles.headerCol}>
            <Title
              level={2}
              className={`${styles.title} ${isWinner ? styles.winTitle : styles.loseTitle
                }`}
            >
              {isWinner
                ? `🎉 You win! 🎉`
                : `${scoreBoard?.keys().next().value} takes the win — better luck next time!`}
            </Title>
          </Col>
        </Row>

        <Row gutter={[24, 24]} justify="center" align="top">
          <Col xs={24} sm={12} md={8}>
            <Game1v1Card
              players={winnerMap || undefined}
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
            <Game1v1Card
              players={loserMap || undefined}
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
