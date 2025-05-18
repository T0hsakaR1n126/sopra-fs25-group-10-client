"use client";

import React, { useEffect, useRef, useState } from 'react';
import styles from '@/styles/gameStart.module.css';
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

interface Message {
  sender: string;
  content: string;
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

  const [players, setPlayers] = useState<User[]>([]);
  const [gameCodeShown, setGameCodeShown] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [countDown, setCountDown] = useState<string | null>(null);
  const [countDownStart, setCountDownStart] = useState<number | null>(null);
  const [readyStatus, setReadyStatus] = useState<Record<string, boolean>>({});
  const [canStart, setCanStart] = useState<boolean>(false);
  const [client, setClient] = useState<Client | null>(null);

  // State for chat functionality
  const [showChat, setShowChat] = useState(true); // Toggle chat visibility
  const [chatMessages, setChatMessages] = useState<Message[]>([]); // Store chat messages with Message type
  const [chatInput, setChatInput] = useState(""); // Store current chat input

  // mini profile
  interface miniProfile {
    username: string;
    level?: number;
    email?: string;
    bio?: string;
  }
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedPlayerProfile, setSelectedPlayerProfile] = useState<miniProfile | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const xp = selectedPlayerProfile ? (selectedPlayerProfile.level ?? 0) * 100 : 0;
  let barPercent = 0;
  let barColor = "";
  if (xp < 5000) {
    barPercent = (xp / 5000) * 100;
    barColor = "linear-gradient(90deg, #73d13d, #52c41a)"; // MapAmateur
  } else if (xp < 10000) {
    barPercent = ((xp - 5000) / 5000) * 100;
    barColor = "linear-gradient(90deg, #40a9ff, #1890ff)"; // MapExpert
  } else {
    barPercent = ((xp - 10000) / 5000) * 100;
    barColor = "linear-gradient(90deg, #ffd700, #f4e542)"; // MapMaster
  }
  const title = xp >= 10000
    ? "MapMaster"
    : xp >= 5000
      ? "MapExpert"
      : "MapAmateur";
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setSelectedPlayer(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupRef]);

  useEffect(() => {
    setGameCodeShown(gameCode);

    const fetchPlayers = async () => {
      try {
        const response: User[] = await apiService.get(`/ready/${gameId}`);
        setPlayers(response);
        setOwnerName(response[0].username ?? "");
        dispatch(ownerUpdate(response[0].userId ?? ""));

        const initialReady: Record<string, boolean> = {};
        response.forEach(player => {
          if (player.userId != null) {
            initialReady[player.userId.toString()] = player.isReady ?? false;
          }
        });
        setReadyStatus(initialReady);
      } catch (error) {
        console.error("Failed to fetch players:", error);
        router.push("/lobby");
      }
    };

    fetchPlayers();

    const stompClient = new Client({
      brokerURL: "wss://sopra-fs25-group-10-server.oa.r.appspot.com/ws",
      // brokerURL: "http://localhost:8080/ws",
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("STOMP connected");

        stompClient.subscribe(`/topic/ready/${gameId}/players`, (message) => {
          const data: User[] = JSON.parse(message.body);
          setPlayers(data);
          setOwnerName(data[0].username ?? "");
          dispatch(ownerUpdate(data[0].userId ?? ""));
        });

        stompClient.subscribe(`/topic/ready/${gameId}/status`, (message) => {
          const map: Record<string, boolean> = JSON.parse(message.body);
          console.log("[WS] Ready Status Received:", map);
          const normalizedMap: Record<string, boolean> = {};
          for (const [k, v] of Object.entries(map)) {
            normalizedMap[k.toString()] = v;
          }
          console.log("[WS] Ready Status Received:", normalizedMap);
          setReadyStatus(normalizedMap);
        });

        stompClient.subscribe(`/topic/ready/${gameId}/canStart`, (message) => {
          const can: boolean = JSON.parse(message.body);
          console.log("[WS] Can Start Received:", can);
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
            console.log("here")
            const data: Message = JSON.parse(message.body);
            setChatMessages((prevMessages) => [...prevMessages, data]);
          } catch (err) {
            console.error('Invalid chat message:', err);
          }
        });
      },
      onDisconnect: () => {
        console.log("STOMP disconnected");
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
        setCountDown("GO!");
        setTimeout(() => {
          setCountDown(null);
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
      await apiService.put(`/lobbyOut/${userId}`, {});
      dispatch(clearGameState());
      router.push("/lobby");
    } catch (error) {
      console.error("Error leaving game:", error);
    }
  };

  const handleBegin = async () => {
    try {
      await apiService.put(`/start/${gameId}`, {});
    } catch (error) {
      console.error("Error starting game:", error);
    }
  };

  const toggleReady = () => {
    const newReady = !readyStatus[userId.toString()];
    console.log("[Toggle Ready] Sending:", { userId, ready: newReady });

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
    showSuccessToast("Game Code Copied!");
  };

  const handleSendMessage = () => {
    if (chatInput.trim() && client && client.connected) {
      const message: Message = {
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
      <div className={styles.roomWrapper}>
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
                        onClick={async (e) => {
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
                      />
                    ) : (
                      <div className={styles.avatarFallback}>{idx + 1}</div>
                    )}
                    <div className={styles.playerName}>
                      {player.userId?.toString() === players[0]?.userId?.toString() && "👑 "}{player.username}
                    </div>
                    <div className={styles.readyStampWrapper}>
                      {readyStatus[player.userId?.toString() ?? ""] && (
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
        </div>

        <div className={`${styles.gameCode} ${luckiestGuy.className}`} onClick={handleCopyCode}>
          Click to Copy the Game Code: {gameCodeShown}
        </div>

        {/* chatbox */}
        {showChat && (
          <div className={styles.chatBox}>
            <div className={styles.chatHeader}>
              <span>Chat 💬</span>
              <button className={styles.collapseBtn} onClick={() => setShowChat(false)}>
                Fold
              </button>
            </div>
            <div className={styles.chatMessages}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={styles.chatLine}>
                  <b>{msg.sender}:</b> {msg.content}
                </div>
              ))}
            </div>
            <div className={styles.chatInputWrapper}>
              <input
                className={styles.chatInput}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button className={styles.chatSendButton} onClick={handleSendMessage}>
                Send
              </button>
            </div>
          </div>
        )}
        {!showChat && (
          <div className={styles.chatToggle} onClick={() => setShowChat(true)}>
            💬
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
        {selectedPlayer && popupPos && (
          <div
            ref={popupRef}
            className={styles.playerPopup}
            style={{ top: popupPos.y, left: popupPos.x }}
            onClick={() => setSelectedPlayer(null)}
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
            <div className={styles.email}>
              <strong>Email:</strong> {selectedPlayer.email ?? 'Not Set'}
            </div>
            <div className={styles.bio}>
              <strong>Bio:</strong> {selectedPlayer.bio ?? 'Not Set'}
            </div>
          </div>
        )}

        {/* countdown */}
        {countDown !== null && (
          <div className={styles.overlay}>
            <div className={styles.countdown} key={countDown}>{countDown === "0" ? "GO!" : countDown}</div>
          </div>
        )}
      </div>
    </>
  );
};

export default GameStart;