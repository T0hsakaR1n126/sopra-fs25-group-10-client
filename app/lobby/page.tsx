"use client";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Layout, Typography, Table, Input, Button, Switch } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import "../styles/lobby.css";

const { Content } = Layout;
const { Title, Text } = Typography;

interface GameSession {
  key: string;
  teamName: string;
  players: string;
  owner: string;
  publicPrivate: React.ReactNode | null;
  gameId: string;
  mode: "team" | "1v1";
}

const Lobby: React.FC = () => {
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [passcode, setPasscode] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<"team" | "1v1">("team");

  useEffect(() => {
    const fetchActiveGames = async () => {
    //   setLoading(true);
    //   setError(null);
      try {
        const response = await fetch("/game/combat/active");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        interface GameData {
          gameId: string | null;
          teamName?: string;
          playersInGame?: number;
          maxPlayers?: number;
          owner?: string;
          isPrivate?: boolean;
          mode?: "team" | "1v1";
        }

        const formattedSessions: GameSession[] = data.map((game: GameData) => ({
          key: game.gameId ? game.gameId.toString() : Math.random().toString(),
          teamName: game.teamName || "Unnamed Team",
          players: `${game.playersInGame || 0} / ${game.maxPlayers || 5}`,
          owner: game.owner || "Unknown",
          publicPrivate: game.isPrivate ? <LockOutlined /> : null,
          gameId: game.gameId || "",
          mode: game.mode || "team",
        }));

        setGameSessions(formattedSessions);
      } catch (e) {
        console.error("Failed to fetch active games:", e);
        // setError("Failed to load active games.");
        setGameSessions(mockData); // Show test data on failure
      } finally {
        // setLoading(false);
      }
    };

    fetchActiveGames();
  }, []);

  const mockData: GameSession[] = [
    {
      key: "1",
      teamName: "Warriors",
      players: "3 / 5",
      owner: "Alice",
      publicPrivate: <LockOutlined />,
      gameId: "game-1",
      mode: "team",
    },
    {
      key: "2",
      teamName: "Solo Duel",
      players: "1 / 2",
      owner: "Bob",
      publicPrivate: null,
      gameId: "game-2",
      mode: "1v1",
    },
    {
      key: "3",
      teamName: "Raiders",
      players: "4 / 5",
      owner: "Charlie",
      publicPrivate: <LockOutlined />,
      gameId: "game-3",
      mode: "team",
    },
  ];

  const columns: ColumnsType<GameSession> = [
    { title: "Team Name", dataIndex: "teamName", key: "teamName" },
    { title: "Players", dataIndex: "players", key: "players", align: "center" },
    { title: "Owner", dataIndex: "owner", key: "owner" },
    {
      title: "Public / Private",
      dataIndex: "publicPrivate",
      key: "publicPrivate",
      align: "center",
      render: (icon) => icon,
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      render: (_, record) => (
        <Button size="small" type="primary" onClick={() => handleJoinGame(record.gameId)}>
          Request to Join
        </Button>
      ),
    },
  ];

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasscode(e.target.value);
  };

  const handleJoinWithPasscode = () => {
    if (passcode) {
      console.log("Joining game with passcode:", passcode);
      // API call to join game using passcode
    }
  };

  const handleJoinGame = (gameId: string) => {
    console.log("Joining game with ID:", gameId);
    // API call to join game
  };

  const filteredSessions = gameSessions.filter((game) => game.mode === gameMode);

  return (
    <>
      <Head>
        <title>MapMaster - Lobby</title>
        <meta name="description" content="MapMaster Game Lobby" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout className="lobby-container">
        <Content className="lobby-content">
          <Title level={2} className="lobby-title">Lobby</Title>
          <Text className="lobby-subtitle">Current game sessions you can join</Text>

          <div className="toggle-container">
            <Text className="toggle-label">Show:</Text>
            <Switch
              checkedChildren="Team"
              unCheckedChildren="1v1"
              defaultChecked
              onChange={(checked) => setGameMode(checked ? "team" : "1v1")}
            />
          </div>

          <Table
            dataSource={filteredSessions}
            columns={columns}
            pagination={false}
            rowClassName="lobby-table-row"
          />

          <div className="passcode-container">
            <Text className="passcode-text">Have a passcode for a game?</Text>
            <Input
              placeholder="Enter here"
              value={passcode}
              onChange={handlePasscodeChange}
              className="passcode-input"
            />
            <Button type="primary" onClick={handleJoinWithPasscode}>Join with Passcode</Button>
          </div>
        </Content>
      </Layout>
    </>
  );
};

export default Lobby;
