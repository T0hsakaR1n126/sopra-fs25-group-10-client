"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useApi } from "@/hooks/useApi";
import { Game } from "@/types/game";
import { useRouter } from "next/navigation";
import styles from "@/styles/lobby.module.css";
import CreateForm from './create/page';
import { useDispatch, useSelector } from 'react-redux';
import { Client } from '@stomp/stompjs';
import { gameInitialize } from '@/gameSlice';


interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

const Lobby: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  const dispatch = useDispatch(); // Set up dispatch for Redux actions
  const [showSidebar, setShowSidebar] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [paginatedGames, setPaginatedGames] = useState<Game[]>([]);
  const [joinCode, setJoinCode] = useState("");
  //for chat
  const [chatMessages, setChatMessages] = useState<Message[]>([]); // Store chat messages with Message type
  const [messageInput, setMessageInput] = useState(""); // Input state for new messages
  const clientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId);
  const userName = useSelector((state: { user: { username: string } }) => state.user.username);

  // only for mock, remove when backend is ready
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  useEffect(() => {
    const client = new Client({
      brokerURL: 'wss://sopra-fs25-group-10-server.oa.r.appspot.com/ws', // TODO: replace with your WebSocket URL
      // brokerURL: "http://localhost:8080/ws",
      reconnectDelay: 5000,
      onConnect: () => {
        clientRef.current = client;

        client.subscribe(`/topic/lobby`, (message) => {
          try {

            const data: Game[] = JSON.parse(message.body);
            const filteredData = data.filter((game) => String(game.ownerId) !== String(userId));
            setGames(filteredData);
            setPaginatedGames(filteredData.slice(start, start + itemsPerPage));
          } catch (err) {
            console.error('Invalid message:', err);
          }
        });

        client.subscribe('/topic/chat/lobby', (message) => {
          try {
            const newMessage = JSON.parse(message.body);
            setChatMessages((prevMessages) => [...prevMessages, newMessage]);
          } catch (err) {
            console.error('Invalid message:', err);
          }
        });


        apiService.put("/lobby", {}).catch((err) => {
          console.error('Error fetching lobby data: ', err);
        });
      },
      onDisconnect: () => {
      }
    });

    client.activate();


    return () => {
      client.deactivate();
    };
  }, [apiService, userId, start]);

  useEffect(() => {
    setPaginatedGames(games.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage));
  }, [games, currentPage]);

  const handleJoinGame = async (game: Game, userId: string): Promise<void> => {
    if (game.password) {
      const password = prompt("Enter the game password:");
      if (password === null || password.trim() === "") {
        return;
      }
      game.password = password;
    } else {
      game.password = "";
    }
    try {
      await apiService.put<Game>(`/lobbyIn/${userId}`, game);
      dispatch(gameInitialize(
        {
          gameId: game.gameId,
          gamename: game.gameName,
          gameCode: game.gameCode,
          gameStarted: false,
          modeType: game.modeType,
          time: game.time,
          ownerId: null,
          hints: null,
          gameHistory: [],
          learningProgress: [],
          currentGameMode: null,
          currentTeamId: null,
          gameResults: null,
          hintUsage: 0,
          scoreBoard: null,
          answer: null,
          playersNumber: game.playersNumber ? parseInt(game.playersNumber, 10) : null,
        }
      ));
      router.push(`/game/start/${game.gameId}`);
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during game joining:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during game joining.");
      }
    }
  };

  const handleJoinWithCode = async () => {
    if (!joinCode.trim()) {
      alert("Please enter a valid game code.");
      return;
    }

    try {
      const res: Game = await apiService.post<Game>(`/codejoin`, { gameCode: joinCode });
      await handleJoinGame(res, userId);
    } catch (error) {
      alert("Invalid code or game not found.");
      console.error(error);
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim() === "") return;

    const newMessage = {
      sender: userName,
      content: messageInput,
      // timestamp: new Date().toISOString(),
    };

    if (clientRef.current) {
      clientRef.current.publish({
        destination: '/app/chat/lobby',
        body: JSON.stringify(newMessage),
      });
    }

    setMessageInput("");
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  return (
    <div className={styles.page}>
      {/* Chat Panel */}
      <div className={styles.chatPanel}>
        <h3 className={styles.chatTitle}>Lobby Chat</h3>
        <div className={styles.chatMessages}>
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`${styles.chatMessage} ${msg.sender === userName ? styles.ownMessage : ''}`}
            >
              <div className={styles.messageContent}>
                <span><strong>{msg.sender}</strong>: {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}</span>
              </div>
              <div className={styles.timestamp}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {/* Empty div to act as a scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
        <div className={styles.chatInputBox}>
          <input
            type="text"
            placeholder="Type a message..."
            className={styles.chatInput}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && messageInput.trim()) {
                handleSendMessage(); // Trigger send on Enter key press
                e.preventDefault(); // Prevent form submission or other default Enter key behavior
              }
            }}
          />
          <button className={styles.chatSendButton} onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </div>


      <div className={styles.leftPanel}>
        <h1 className={styles.title}>Game Lobby</h1>
        <p className={styles.subtitle}>Feel free to join!</p>

        <div className={styles.headerRow}>
          <div>Game Name</div>
          <div>Player in Game</div>
          <div>Private</div>
        </div>

        {paginatedGames.length === 0 ? (
          <div className={styles.emptyMessage}>No Available Game</div>
        ) : (
          paginatedGames.map((game, idx) => (
            <div key={idx} className={styles.lobbyCard} onClick={() => handleJoinGame(game, userId)}>
              <div className={styles.teamName}>
                {game.gameName}
              </div>
              <div className={styles.playerCount}>{game.realPlayersNumber} / {game.playersNumber}</div>
              <div className={styles.ownerLink}>{game.password !== "" && <span title="Private game">🔒</span>}</div>
            </div>
          ))
        )}
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          <span>Page {currentPage}</span>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={end >= games.length}
          >
            Next
          </button>
        </div>


      </div>

      {/* Toggle Button */}
      <div className={styles.sidebarToggle} onClick={() => setShowSidebar(!showSidebar)}>
        {showSidebar ? ">" : "+ Create New Game"}
      </div>
      <div className={styles.joinCodeBox}>
        <h3>Join with Code?</h3>
        <div style={{ display: "flex", gap: "8px", width: "100%" }}>
          <input
            type="text"
            className={styles.input}
            placeholder="Enter code..."
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button className={styles.createButton} onClick={handleJoinWithCode}>
            Join
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`${styles.rightPanel} ${showSidebar ? styles.show : ""}`}>
        <CreateForm />
      </div>
    </div>
  );
};

export default Lobby;