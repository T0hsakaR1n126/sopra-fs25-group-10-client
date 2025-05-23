"use client";

import React, { useEffect, useRef, useState } from 'react';
import styles from '@/styles/gameStart.module.css';
import "@/styles/globals.css";
import { Client } from '@stomp/stompjs';
import { useParams, useRouter } from 'next/navigation';
import { User } from '@/types/user';
import { useApi } from '@/hooks/useApi';
import { useSelector } from 'react-redux';
import { Game } from '@/types/game';
import { useDispatch } from "react-redux"; // Import useDispatch
import { answerUpdate, clearGameState, gameStart, gameTimeInitialize, ownerUpdate } from '@/gameSlice';
import 'react-toastify/dist/ReactToastify.css';
import { Luckiest_Guy } from "next/font/google";
import { showSuccessToast } from '@/utils/showSuccessToast';
import { showErrorToast } from "@/utils/showErrorToast";
import { AnimatePresence, motion } from 'framer-motion';

interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

function formatChatTimestamp(timestamp: string): string {
  const iso = timestamp.split(".")[0] + "Z";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const luckiestGuy = Luckiest_Guy({ weight: "400", subsets: ['latin'] });

const GameStart = () => {
  const router = useRouter();
  const gameId = useParams()?.id;
  const apiService = useApi();
  const dispatch = useDispatch();

  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId);
  const username = useSelector((state: { user: { username: string } }) => state.user.username);
  const gameCode = useSelector((state: { game: { gameCode: string } }) => state.game.gameCode);
  const playersNumber = useSelector((state: { game: { playersNumber: number } }) => state.game.playersNumber);
  const ownerId = useSelector((state: { game: { ownerId: string } }) => state.game.ownerId);

  const [players, setPlayers] = useState<User[]>([]);
  const [gameCodeShown, setGameCodeShown] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [countDown, setCountDown] = useState<string | null>(null);
  const [countDownStart, setCountDownStart] = useState<number | null>(null);
  const [readyStatus, setReadyStatus] = useState<Record<string, boolean>>({});
  const [canStart, setCanStart] = useState<boolean>(false);
  const [client, setClient] = useState<Client | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // State for chat functionality
  const [showChat, setShowChat] = useState(false); // Toggle chat visibility
  const [chatMessages, setChatMessages] = useState<Message[]>([]); // Store chat messages with Message type
  const [chatInput, setChatInput] = useState(""); // Store current chat input
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (chatMessages.length > 0 && chatMessages[chatMessages.length - 1]?.sender !== username && !showChat) {
      setHasUnread(true);
    }
  }, [chatMessages]);

  const ownerIdRef = useRef(ownerId);
  useEffect(() => {
    ownerIdRef.current = ownerId;
  }, [ownerId]);

  // mini profile
  interface miniProfile {
    username: string;
    level?: number;
    email?: string;
    bio?: string;
  }
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<miniProfile | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const xp = selectedPlayerProfile ? (selectedPlayerProfile.level ?? 0) : -1;
  const title = xp >= 10000
    ? "MapMaster"
    : xp >= 5000
      ? "MapExpert"
      : "MapAmateur";

  useEffect(() => {
    setGameCodeShown(gameCode);

    const fetchPlayers = async () => {
      try {
        const response: User[] = await apiService.get(`/ready/${gameId}`);
        setPlayers(response);
        setOwnerName(response[0].username ?? "");
        dispatch(ownerUpdate(response[0].userId ?? ""));

        if (String(userId) === String(ownerIdRef.current)) {
          try {
            await apiService.put(`/checkready/${gameId}`, {});
            setCanStart(true);
          } catch (error) {
            if (error instanceof Error) {
              return;
            }
          }
        }

        const initialReady: Record<number, boolean> = response[0].readyMap ?? {};
        setReadyStatus(initialReady);
      } catch (error) {
        window.dispatchEvent(new Event("globalLock"));
        console.error("Failed to fetch players:", error);
        showErrorToast(`${error}`);
        router.push("/lobby");
      }
    };

    fetchPlayers();

    const stompClient = new Client({
      brokerURL: "wss://sopra-fs25-group-10-server.oa.r.appspot.com/ws",
      // brokerURL: "http://localhost:8080/ws",
      reconnectDelay: 5000,
      onConnect: () => {


        stompClient.subscribe(`/topic/ready/${gameId}/players`, (message) => {
          const data: User[] = JSON.parse(message.body);
          setPlayers(data);
          setOwnerName(data[0].username ?? "");
          dispatch(ownerUpdate(data[0].userId ?? ""));
        });

        stompClient.subscribe(`/topic/ready/${gameId}/status`, (message) => {
          const map: Record<string, boolean> = JSON.parse(message.body);
          console.log(">> STATUS RECEIVED:", map);

          const normalizedMap: Record<string, boolean> = {};
          for (const [k, v] of Object.entries(map)) {
            normalizedMap[k.toString()] = v;
          }

          setReadyStatus(normalizedMap);
        });

        stompClient.subscribe(`/topic/ready/${gameId}/canStart`, (message) => {
          const can: boolean = JSON.parse(message.body);
          console.log(">> STATUS RECEIVED:", can);
          setCanStart(can);
        });

        stompClient.subscribe(`/topic/start/${gameId}/hints`, (message) => {
          try {
            const game: Game = JSON.parse(message.body);
            if (game.hints) {
              dispatch(gameStart({
                hints: game.hints ?? [],
                gameId: gameId?.toString() ?? "",
                scoreBoard: game.scoreBoard ?? new Map<string, number>(),
                modeType: game.modeType ?? "combat",
                answer: game.answer ?? "",
              }));
              dispatch(answerUpdate(game.answer ?? ""));
            }
          } catch (err) {
            console.error('Invalid message:', err);
            showErrorToast(`${err}`);
          }
        });

        stompClient.subscribe(`/topic/${gameId}/gametime`, (message) => {
          const data: string = message.body;
          dispatch(gameTimeInitialize(data));
        });

        stompClient.subscribe(`/topic/start/${gameId}/ready-time`, (message) => {
          const data: string = message.body;
          setCountDownStart(parseInt(data));
        });

        // stompClient.subscribe(`/topic/${gameId}/playersNumber`, (message) => {
        //   const data: string = message.body;
        //   setPlayersNumber(parseInt(data));
        // });

        stompClient.subscribe(`/topic/${gameId}/gameCode`, (message) => {
          const data: string = message.body;
          setGameCodeShown(data);
        });

        stompClient.subscribe(`/topic/chat/${gameId}`, (message) => {
          try {
            const data: Message = JSON.parse(message.body);
            setChatMessages((prevMessages) => [...prevMessages, data]);
          } catch (err) {
            console.error('Invalid chat message:', err);
            showErrorToast(`${err}`);
          }
        });
      },
      onDisconnect: () => {

      }
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, [gameId]);

  useEffect(() => {
    if (countDownStart === null) return;

    let current = countDownStart;
    setCountDown(current.toString());

    const interval = setInterval(() => {
      current -= 1;
      if (current > 0) {
        setCountDown(current.toString());
      } else if (current === 0) {
        window.dispatchEvent(new Event("globalLock"));
        setCountDown("GO!");
        setTimeout(() => {
          setIsLocked(true);
          setCountDown(null);
          try {
            apiService.put(`/startcounter/${gameId}`, {});
          } catch (err) {
            if (err instanceof Error) {
              showErrorToast(err.message);
            }
          }
          requestAnimationFrame(() => {
            router.push(`/game/${gameId}`);
          });
        }, 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownStart, router, gameId]);

  const handleExitGame = async () => {
    try {
      window.dispatchEvent(new Event("globalLock"));
      await apiService.put(`/lobbyOut/${userId}`, {});
      dispatch(clearGameState());
      document.querySelector(".roomWrapper")?.classList.add("roomWrapperExit");
      setTimeout(() => router.push("/lobby"), 200);
      // router.push("/lobby");
    } catch (error) {
      console.error("Error leaving game:", error);
      showErrorToast(`${error}`);
    }
  };

  const handleBegin = async () => {
    try {
      await apiService.put(`/start/${gameId}`, {});
    } catch (error) {
      console.error("Error starting game:", error);
      showErrorToast(`${error}`);
    }
  };

  const toggleReady = () => {
    const newReady = !readyStatus[userId.toString()];


    if (client && client.connected) {
      client.publish({
        destination: `/app/game/${gameId}/ready`,
        body: JSON.stringify({ userId, ready: newReady }),
      });
    } else {
      console.warn("[Toggle Ready] STOMP client not connected!");
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameCodeShown ?? "");
    showSuccessToast("Game Code Copied!");
  };

  const handleSendMessage = () => {
    if (chatInput.trim() && client && client.connected) {
      const message = {
        sender: username,
        content: chatInput,
      };

      client.publish({
        destination: `/app/chat/${gameId}`,
        body: JSON.stringify(message)
      });

      setChatInput("");  // Clear input after sending
    }
  };


  return (
    <>
      <div className={`${styles.roomWrapper} roomWrapper roomWrapperEnter`}>
        <div className={`${styles.gameCode} ${luckiestGuy.className}`} onClick={handleCopyCode}>
          Click to Copy the Game Code: {gameCodeShown}
        </div>

        <div className={styles.grid}>
          {Array.from({ length: playersNumber }).map((_, idx) => {
            const player = players[idx];
            return (
              <div key={idx} className={styles.slot}>
                {player ? (
                  <div className={styles.playerCard}>
                    {player.avatar ? (
                      <img
                        src={player.avatar}
                        alt="avatar"
                        className={styles.avatarImg}
                        onMouseEnter={async (e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setSelectedPlayer(player);
                          setPopupPos({ x: rect.right + 10, y: rect.top });
                          const response: User = await apiService.get<User>(`/users/${userId}`);
                          setSelectedPlayerProfile({
                            username: player.username ? player.username : "",
                            level: response.level ? Number(response.level) : 0,
                            email: response.email ? response.email : "",
                            bio: response.bio ? response.bio : "",
                          });
                        }}
                        onMouseLeave={() => {
                          setSelectedPlayer(null);
                          setPopupPos(null);
                        }}
                      />
                    ) : (
                      <div className={styles.avatarFallback}>{idx + 1}</div>
                    )}
                    <div className={styles.playerName}>
                      {player.userId?.toString() === players[0]?.userId?.toString() && "👑 "}{player.username}
                    </div>
                    <div className={styles.readyStampWrapper}>
                      {readyStatus[player.userId?.toString() ?? ""] && player.userId !== players[0]?.userId && (
                        <div className={styles.readyStamp}>
                          READY
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={styles.empty}>Wait...</div>
                )}
              </div>
            );
          })}
          <div className={styles.bubbleTip}>
            The game cannot begin until all players are ready!
          </div>
        </div>

        {/* chatbox */}
        <AnimatePresence mode="wait">
          {showChat && (
            <motion.div
              key="chatbox"
              className={styles.chatBox}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <div className={styles.chatHeader}>
                <span>Game Chat</span>
                <button className={styles.collapseBtn} onClick={() => { setShowChat(false); setHasUnread(false); }}>
                  Fold
                </button>
              </div>
              <div className={styles.chatMessages}>
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`${styles.chatLine} ${msg.sender === username ? styles.ownMessage : styles.otherMessage}`}
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
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && chatInput.trim()) {
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

        {/* button */}
        <div className={styles.buttonBar}>
          {username !== ownerName && (
            <button className={styles.fancyButton} onClick={toggleReady}>
              {readyStatus[userId.toString()] ? "Cancel" : "Ready"}
            </button>
          )}
          {username === ownerName && (
            <button
              className={`${styles.fancyButton} ${(!canStart || players.length !== playersNumber) ? styles.fancyButtonDisabled : ""}`}
              onClick={handleBegin}
              disabled={!canStart || players.length !== playersNumber}
            >
              Begin
            </button>
          )}
          <button className={styles.fancyButton} onClick={handleExitGame}>Exit</button>
        </div>

        {/* mini profile */}

        <AnimatePresence>
          {selectedPlayer && popupPos && (

            <motion.div
              ref={popupRef}
              className={styles.playerPopup}
              style={{ top: popupPos.y, left: popupPos.x }}
              onMouseEnter={() => clearTimeout(hideTimeoutRef.current as NodeJS.Timeout | undefined)}
              onMouseLeave={() => { setSelectedPlayer(null); }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <h3>{selectedPlayer.username}</h3>
              <div
                className={styles.playerTitle}
                style={{
                  background: xp >= 10000
                    ? 'linear-gradient(135deg, #ffcc00, #ff6600)'  // gold-orange
                    : xp >= 5000
                      ? 'linear-gradient(135deg, #40a9ff, #0050b3)'  // blue
                      : 'linear-gradient(135deg, #95de64, #389e0d)'  // green
                }}
              >
                {title}
              </div>
              {selectedPlayer.email && (<div className={styles.email}>
                <strong>📧</strong> {selectedPlayer.email}
              </div>)}
              {selectedPlayer.bio && (<div className={styles.bio}>
                <strong>✍️</strong> {selectedPlayer.bio}
              </div>)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* countdown */}
        {countDown !== null && (
          <div className={styles.overlay}>
            <div className={styles.countdown} key={countDown}>{countDown === "0" ? "GO!" : countDown}</div>
          </div>
        )}

        {isLocked && (
          <div className={styles.interactionLock} />
        )}
      </div>
    </>
  );
};

export default GameStart;