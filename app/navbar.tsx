"use client"; // ✅ Mark this as a Client Component

import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux"; // Import Redux hooks
import { UserOutlined, HistoryOutlined, TrophyOutlined, LoginOutlined, UserAddOutlined, LogoutOutlined, BookOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { RootState } from "./"; // Import RootState to type the useSelector hook
import { useLogout } from "@/utils/useLogout"; // Import the logout function

export default function Navbar() {
    // Use Redux state to check if the user is logged in
    const isLoggedIn = useSelector((state: RootState) => state.user.isLoggedIn);

    // Get the logout function
    const handleLogoutRedux = useLogout();

    return (
        <nav className="navbar">
            {/* Logo */}
            <Tooltip title="Home">
                <Link href="/game">
                    <Image src="/mapmaster-logo.png" alt="Home" width={60} height={50} />
                </Link>
            </Tooltip>

            {/* Right-side Icons */}
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                {isLoggedIn ? (
                    <>
                        <Tooltip title="Profile">
                            <Link href="/users/profile">
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
                                icon={<LogoutOutlined />} 
                                onClick={handleLogoutRedux} // Use handleLogoutRedux for logging out
                            >
                                Logout
                            </Button>
                        </Tooltip>
                    </>
                ) : (
                    <>
                        <Tooltip title="Login">
                            <Link href="/users/login">
                                <LoginOutlined
                                    style={{ fontSize: "24px", color: "#fff", cursor: "pointer" }}
                                    aria-label="Login"
                                />
                            </Link>
                        </Tooltip>

                        <Tooltip title="Register">
                            <Link href="/users/register">
                                <UserAddOutlined className="nav-icon" aria-label="Register" />
                            </Link>
                        </Tooltip>

                        <Tooltip title="Leaderboard">
                            <Link href="/leaderboard">
                                <TrophyOutlined className="nav-icon" aria-label="Leaderboard" />
                            </Link>
                        </Tooltip>
                    </>
                )}
            </div>
        </nav>
    );
}
