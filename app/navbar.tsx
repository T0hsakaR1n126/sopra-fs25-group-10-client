"use client"; // ✅ Mark this as a Client Component

import Image from "next/image";
import Link from "next/link";
import { useState } from "react"; // Now it's safe to use hooks
import { UserOutlined, HistoryOutlined, TrophyOutlined, LoginOutlined, UserAddOutlined, LogoutOutlined, BookOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false); //set true to see logged in state
    
    return (
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 30px", background: "#000", color: "#fff" }}>
        {/* Logo */}
        <Tooltip title="Home">
        <Link href="/">
        <Image src="/mapmaster-logo.png" alt="Home" width={60} height={50} />
        </Link>
        </Tooltip>
        
        {/* Right-side Icons */}
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {isLoggedIn ? (
            <>
            <Tooltip title="Profile">
            <Link href="/profile">
            <UserOutlined 
            style={{ fontSize: "24px", color: "#fff", cursor: "pointer" }} 
            aria-label="Profile"
            />
            </Link>
            </Tooltip>
            
            <Tooltip title="Game History">
            <Link href="/history">
            <HistoryOutlined 
            style={{ fontSize: "24px", color: "#fff", cursor: "pointer" }} 
            aria-label="Game History"
            />
            </Link>
            </Tooltip>
            
            <Tooltip title="Leaderboard">
            <Link href="/leaderboard">
            <TrophyOutlined 
            style={{ fontSize: "24px", color: "#fff", cursor: "pointer" }} 
            aria-label="Leaderboard"
            />
            </Link>
            </Tooltip>
            
            <Tooltip title="Learning">
            <Link href="/learning">
            <BookOutlined 
            style={{ fontSize: "24px", color: "#fff", cursor: "pointer" }} 
            aria-label="Learning"
            />
            </Link>
            </Tooltip>
            
            <Tooltip title="Logout">
            <Button 
            type="primary" 
            danger 
            icon={<LogoutOutlined aria-label="Logout" />} 
            onClick={() => setIsLoggedIn(false)}
            >
            Logout
            </Button>
            </Tooltip>
            </>
        ) : (
            <>
            <Tooltip title="Login">
            <Link href="/login">
            <LoginOutlined 
            style={{ fontSize: "24px", color: "#fff", cursor: "pointer" }} 
            aria-label="Login"
            />
            </Link>
            </Tooltip>
            
            <Tooltip title="Register">
            <Link href="/register">
            <UserAddOutlined 
            style={{ fontSize: "24px", color: "#fff", cursor: "pointer" }} 
            aria-label="Register"
            />
            </Link>
            </Tooltip>
            
            <Tooltip title="Leaderboard">
            <Link href="/leaderboard">
            <TrophyOutlined 
            style={{ fontSize: "24px", color: "#fff", cursor: "pointer" }} 
            aria-label="Leaderboard"
            />
            </Link>
            </Tooltip>
            </>
        )}
        </div>
        </nav>
    );
}
