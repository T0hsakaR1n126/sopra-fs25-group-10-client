'use client';

import React, { useEffect, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useSelector } from "react-redux";
import { RootState } from "../"; 

export default function Chat() {
  const username = useSelector((state: RootState) => state.user.username);

  const [client, setClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<{ sender: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);

  const gameId = '9'; // Static gameId for testing

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('[WebSocket] Connected');
        setConnected(true);

        stompClient.subscribe(`/topic/chat/${gameId}`, (msg) => {
          const body = JSON.parse(msg.body);
          setMessages(prev => [...prev, body]);
        });
      },
      onStompError: (frame) => console.error('[WebSocket] STOMP Error:', frame),
      onWebSocketError: (err) => console.error('[WebSocket] WebSocket Error:', err),
      onDisconnect: () => {
        console.log('[WebSocket] Disconnected');
        setConnected(false);
      },
    });

    stompClient.activate();
    setClient(stompClient);

    return () => {
      stompClient.deactivate();
    };
  }, []);

  const sendMessage = () => {
    if (client && connected && input.trim()) {
      const message = {
        sender: username || 'Unknown',
        content: input,
      };

      client.publish({
        destination: `/app/chat/${gameId}`,
        body: JSON.stringify(message),
      });

      setInput('');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Game Chat - {gameId}</h2>
      <div style={{ marginBottom: '1rem', color: connected ? 'green' : 'red' }}>
        WebSocket is {connected ? 'Connected' : 'Disconnected'}
      </div>
      <div style={{ border: '1px solid #ccc', padding: '1rem', height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, idx) => (
          <div key={idx}>
            <strong>{msg.sender}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        style={{ marginTop: '1rem', width: '80%' }}
      />
      <button onClick={sendMessage} style={{ marginLeft: '1rem' }}>
        Send
      </button>
    </div>
  );
}
