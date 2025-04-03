"use client";

import React, { useState } from "react";
import Image from 'next/image';
import "../styles/dashboard.css";
import { useRouter } from "next/navigation";
import { Switch } from "antd"; // Ant Design Switch
import { RootState } from "../"; // Import RootState to type the useSelector hook
import { useSelector } from "react-redux"; // Import Redux hooks


const Dashboard = () => {
    const router = useRouter();
    const [selectedSoloTime, setSelectedSoloTime] = useState("5");
    const [showSoloPopup, setShowSoloPopup] = useState(false);
    const [clickedButton, setClickedButton] = useState<"solo" | "combat" | null>(null);
    const [combatMode, setCombatMode] = useState<"1v1" | "team">("1v1");
    const [combatTime, setCombatTime] = useState("10");
    const [teamSize, setTeamSize] = useState("2");
    const [isPrivate, setIsPrivate] = useState(true);

    const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

    const handleSoloChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSoloTime(e.target.value);
    };
    
    const handleCombatTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCombatTime(e.target.value);
    };
    
    const handleTeamSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTeamSize(e.target.value);
    };
    
    const handleButtonClick = (buttonType: "solo" | "combat") => {
        setClickedButton(buttonType);
        if (buttonType === "solo") {
            setShowSoloPopup(!showSoloPopup);
        } else {
            setShowSoloPopup(false);
        }
    };
    
    const handleCombatStart = () => {
        router.push("/lobby");
    };

    const handleJoinCombatSession = () => {
        router.push("/lobby"); 
    };
    
    return (
        <div className="game-body">
            <div className="game-container">
                <div className="image-container">
                    <Image
                        src="/mapmaster-logo.png"
                        alt="MapMaster Logo"
                        width={350}
                        height={300}
                    />
                </div>
                {/* SOLO MODE BUTTON */}
                <div className="solo-container">
                    <button
                        className={`big-button ${clickedButton === "solo" ? "green" : "blue"}`}
                        onClick={() => handleButtonClick("solo")}
                    >
                        Solo Mode
                    </button>

                    {/* SOLO POPUP */}
                    {showSoloPopup && (
                        <div className="popup visible">
                            <div className="popup-header">⏱ Duration:</div>
                            <div className="popup-content">
                                <select className="time-select" value={selectedSoloTime} onChange={handleSoloChange}>
                                    {Array.from({ length: 12 }, (_, i) => (i + 1) * 5).map((minutes) => (
                                        <option key={minutes} value={minutes}>
                                            {minutes} minutes
                                        </option>
                                    ))}
                                </select>
                                <button className="start-btn" onClick={() => alert("Start!")}>
                                    Start
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* COMBAT MODE BUTTON */}
                <div className="combat-container">
                <button
                        className={`big-button ${clickedButton === "combat" ? "green" : "blue"}`}
                        onClick={() => handleButtonClick("combat")}
                    >
                        Combat Mode
                    </button>
                    {/* If the user is logged in, show combat settings */}
                    {isLoggedIn && clickedButton === "combat" && (
                        <div className="popup visible">
                            <div className="popup-content">
                                <div className="combat-mode-select">
                                    <button
                                        className={`small-button ${combatMode === "1v1" ? "green" : "blue"}`}
                                        onClick={() => setCombatMode("1v1")}
                                    >
                                        1 vs 1
                                    </button>
                                    <button
                                        className={`small-button ${combatMode === "team" ? "green" : "blue"}`}
                                        onClick={() => setCombatMode("team")}
                                    >
                                        Team vs Team
                                    </button>
                                </div>

                                <div className="popup-header">⏱ Duration:</div>
                                <select
                                    className="time-select"
                                    value={combatTime}
                                    onChange={handleCombatTimeChange}
                                >
                                    {Array.from({ length: 12 }, (_, i) => (i + 1) * 5).map((minutes) => (
                                        <option key={minutes} value={minutes}>
                                            {minutes} minutes
                                        </option>
                                    ))}
                                </select>

                                {combatMode === "team" && (
                                    <div className="team-size-select">
                                        <div className="popup-header">Team Size:</div>
                                        <select
                                            className="time-select"
                                            value={teamSize}
                                            onChange={handleTeamSizeChange}
                                        >
                                            {Array.from({ length: 9 }, (_, i) => i + 2).map((size) => (
                                                <option key={size} value={size}>
                                                    {size}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="combat-private-public">
                                    <label>Private Match</label>
                                    <Switch checked={isPrivate} onChange={() => setIsPrivate(!isPrivate)} />
                                </div>

                                <button className="start-combat-btn" onClick={handleCombatStart}>
                                    Create Combat Session
                                </button>
                            </div>
                        </div>
                    )}

                    {/* If the user is not logged in, show "Join Combat Session" button */}
                    {!isLoggedIn && clickedButton === "combat" && (
                        <div className="popup visible">
                            <div className="popup-content">
                                <button className="start-combat-btn" onClick={handleJoinCombatSession}>
                                    Join Combat Session
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
