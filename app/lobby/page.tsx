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
import { showErrorToast } from '@/utils/showErrorToast';
import { showPasswordPrompt } from '@/utils/showPasswordPrompt';
import { AnimatePresence, motion } from 'framer-motion';

interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

function formatChatTimestamp(timestamp: string): string {
  const iso = timestamp.split(".")[0];
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const Lobby: React.FC = () => {
  const apiService = useApi();
  const router = useRouter();
  const dispatch = useDispatch(); // Set up dispatch for Redux actions
  const [games, setGames] = useState<Game[]>([]);
  const [listReveal, setListReveal] = useState(false);
  const [paginatedGames, setPaginatedGames] = useState<Game[]>([]);
  const [joinCode, setJoinCode] = useState("");

  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId);
  const userName = useSelector((state: { user: { username: string } }) => state.user.username);

  //for chat
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]); // Store chat messages with Message type
  const [messageInput, setMessageInput] = useState(""); // Input state for new messages
  const [hasUnread, setHasUnread] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (chatMessages.length > 0 && chatMessages[chatMessages.length - 1]?.sender !== userName && !showChat) {
      setHasUnread(true);
    }
  }, [chatMessages]);

  // paginate page
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  // toggle create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const toggleCreate = () => setShowCreateForm((prev) => !prev);
  useEffect(() => {
    document.body.classList.add("lobby-no-scroll");
    return () => {
      document.body.classList.remove("lobby-no-scroll");
    };
  }, []);

  // animation
  const [gamesLoaded, setGamesLoaded] = useState(false);
  useEffect(() => {
    if (paginatedGames.length >= 0) {
      setGamesLoaded(true);
    }
  }, [games]);

  useEffect(() => {
    const handleExit = () => {
      document.querySelector(".page")?.classList.add("pageExit");
    };

    window.addEventListener("otherExit", handleExit);
    return () => window.removeEventListener("otherExit", handleExit);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setListReveal(true);
    }, 600); // delay the list reveal after entering animation
    return () => clearTimeout(timer);
  }, []);

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
      const password = await showPasswordPrompt();
      if (password === null) return;
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
          correctCount: 0,
          questionCount: 1,
          lastSubmitTime: Date.now(),
          guessTimeList: [],
        }
      ));

      // exit animation
      window.dispatchEvent(new Event("globalLock"));
      document.querySelector(".page")?.classList.add("pageExit");
      setTimeout(() => router.push(`/game/start/${game.gameId}`), 100);
    } catch (error) {
      if (error instanceof Error) {
        showErrorToast(error.message);
      } else {
        console.error("An unknown error occurred during game joining.");
      }
    }
  };

  const handleJoinWithCode = async () => {
    if (!joinCode.trim()) {
      showErrorToast("Please enter a valid game code.");
      return;
    }

    try {
      const res: Game = await apiService.post<Game>(`/codejoin`, { gameCode: joinCode });
      await handleJoinGame(res, userId);
    } catch (error) {
      showErrorToast("Invalid code or game not found.");
      console.error(error);
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim() === "") return;

    const newMessage = {
      sender: userName,
      content: messageInput,
      timestamp: new Date().toISOString(),
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
    <div className={`${styles.page} page pageEnter`}>
      {/* Chat Panel */}
      <AnimatePresence mode="wait">
        {showChat && (
          <motion.div
            // key="chatbox"
            className={styles.chatBox}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <div className={styles.chatHeader}>
              <span>Lobby Chat</span>
              <button className={styles.collapseBtn} onClick={() => { setShowChat(false); setHasUnread(false); }}>
                Fold
              </button>
            </div>
            <div className={styles.chatMessages}>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`${styles.chatLine} ${msg.sender === userName ? styles.ownMessage : styles.otherMessage}`}
                >
                  <div className={styles.bubble}>
                    <div className={styles.sender}>
                      {msg.sender}
                    </div>
                    <div className={styles.content}>
                      {typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)}
                    </div>
                    <div className={styles.time}>
                      {formatChatTimestamp(msg.timestamp)}
                    </div>
                  </div>
                </div>

              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className={styles.chatInputWrapper}>
              <input
                type="text"
                placeholder="Type a message..."
                className={styles.chatInput}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && messageInput.trim()) {
                    handleSendMessage();
                    e.preventDefault();
                  }
                }}
              />
              <button className={styles.chatSendButton} onClick={handleSendMessage}>
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!showChat && (
        <div className={styles.chatToggle} onClick={() => { setShowChat(true); setHasUnread(false); }}>
          💬
          {hasUnread && <span className={styles.unreadDot} />}
        </div>
      )}

      <div className={styles.leftPanel}>
        <h1 className={styles.title}><span className={styles.icon}>🎮</span> Game Lobby</h1>
        <h2 className={styles.subtitle}>👇 Tap a card to join!</h2>

        {!gamesLoaded ? (
          <div className={styles.emptyMessage}>Loading games...</div>
        ) : !listReveal ? (
          null // or spinner, or nothing
        ) : paginatedGames.length === 0 ? (
          <motion.div
            key="gameList"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.emptyMessage}>No Available Game. Create one!</div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {listReveal && (
              <motion.div
                key="gameList"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <div className={styles.roomListScrollable}>
                  {paginatedGames.map((game, idx) => (
                    <motion.div
                      key={game.gameId ?? idx}
                      className={styles.gameCard}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      exit={{ opacity: 0, y: 20 }}
                      onClick={() => handleJoinGame(game, userId)}
                    >
                      <div className={styles.cardTop}>
                        <span className={styles.gameName}>{game.gameName}</span>
                        {game.password && <span className={styles.lockIcon}>🔒</span>}
                      </div>
                      <div className={styles.cardBottom}>
                        <div className={styles.cardItem}>
                          <span>👥</span>
                          <span>{game.realPlayersNumber} / {game.playersNumber}</span>
                        </div>
                        <div className={styles.cardItem}>
                          <span>🕒</span>
                          <span>{Number(game.time) === 1 ? "1 min" : `${game.time ?? 60} mins`}</span>
                        </div>
                        <div className={styles.cardItem}>
                          ⭐ {game.difficulty ?? "Easy"}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className={styles.pagination}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  >
                    ◀ Prev
                  </button>

                  <span className={styles.currentPage}>Page {currentPage}</span>

                  <button
                    disabled={end >= games.length}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next ▶
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Toggle Button */}
      <div className={styles.sidePanel}>
        <button className={styles.createButton} onClick={toggleCreate}>
          {showCreateForm ? 'Close' : '+ Create Game'}
        </button>

        <motion.div
          animate={showCreateForm ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          initial={false}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ overflow: "hidden" }}
        >
          <CreateForm />
        </motion.div>

        <form
          className={styles.joinForm}
          onSubmit={(e) => {
            e.preventDefault();
            handleJoinWithCode();
          }}
        >
          <input
            className={styles.joinInput}
            type="text"
            placeholder="Join Wih Code..."
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button className={styles.joinButton} type="submit">
            Join
          </button>
        </form>
      </div>
    </div>
  );
};

export default Lobby;