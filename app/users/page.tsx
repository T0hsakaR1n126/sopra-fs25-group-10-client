"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React, { useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import "../styles/dashboard.css";
import { useRouter } from "next/navigation"; // use NextJS router for navigation

const Dashboard: React.FC = () => {
  const router = useRouter();
  const {
    // value: token, // is commented out because we dont need to know the token value for logout
    // set: setToken, // is commented out because we dont need to set or update the token value
    clear: clearToken, // all we need in this scenario is a method to clear the token
  } = useLocalStorage<string>("token", ""); // if you wanted to select a different token, i.e "lobby", useLocalStorage<string>("lobby", "");

  const [selectedSoloTime, setSelectedSoloTime] = useState("5");
  const [showSoloPopup, setSoloShowPopup] = useState(false);

  const handleSoloChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setSelectedSoloTime(e.target.value);
  };

  const handleStart = () => {
    alert("start!"); // TODO: push to solo game page
  };

  const toggleSoloPopup = () => {
    setSoloShowPopup(!showSoloPopup);
  };

  return (
    <div className="game-body">
      <div className="game-container">
        <div className="solo-container">
          <button className="button solo-button" onClick={toggleSoloPopup}>
            Solo Mode
          </button>
          <div className={`popup ${showSoloPopup ? "visible" : "hidden"}`}>
            <div className="popup-header">
              ⏱ Time Setting:
            </div>

            <div className="popup-controls">
              <select className="time-select" value={selectedSoloTime} onChange={handleSoloChange}>
                <option value="1">1 minutes</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="20">20 minutes</option>
              </select>

              <button className="start-btn" onClick={handleStart}>Start</button>
            </div>
          </div>
        </div>

        <div className="combat-container">
          <button className="button combat-button" onClick={() => router.push("/lobby")}>
            Combat Mode
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
