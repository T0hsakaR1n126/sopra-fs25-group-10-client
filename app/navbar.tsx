"use client";

import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux"; // Import Redux hooks
import { UserOutlined, HistoryOutlined, TrophyOutlined, LoginOutlined, UserAddOutlined, LogoutOutlined ,BarChartOutlined, BookOutlined } from "@ant-design/icons";
import { RootState } from "./"; // Import RootState to type the useSelector hook
import { useLogout } from "@/utils/useLogout"; // Import the logout function
import { Avatar, Dropdown, Tooltip } from "antd";
import { useState } from "react";

export default function Navbar() {
  const username = useSelector((state: RootState) => state.user.username);
  const avatar = useSelector((state: RootState) => state.user.avatar);
  const level = useSelector((state: RootState) => state.user.level);
  const logout = useLogout();

  const xp = (level ?? 0) * 100;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

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

  const dropdownContent = (
    <div
      style={{
        width: 200,
        background: "#002c4d",
        color: "#fff",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(4px)",
      }}
    >
      {/* menu */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Link
          href="/users/profile"
          onClick={() => setDropdownOpen(false)}
          style={{ ...menuItemStyle, backgroundColor: hovered === "profile" ? "#014b7d" : "transparent" }}
          onMouseEnter={() => setHovered("profile")}
          onMouseLeave={() => setHovered(null)}
        >
          <UserOutlined /> Profile
        </Link>
        <Link
          href="/history"
          onClick={() => setDropdownOpen(false)}
          style={{ ...menuItemStyle, backgroundColor: hovered === "history" ? "#014b7d" : "transparent" }}
          onMouseEnter={() => setHovered("history")}
          onMouseLeave={() => setHovered(null)}
        >
          <HistoryOutlined /> Game History
        </Link>
        <Link
          href="/statistics"
          onClick={() => setDropdownOpen(false)}
          style={{ ...menuItemStyle, backgroundColor: hovered === "statistics" ? "#014b7d" : "transparent" }}
          onMouseEnter={() => setHovered("statistics")}
          onMouseLeave={() => setHovered(null)}
        >
          <BookOutlined /> Statistics
        </Link>
        <div
          onClick={() => { logout(); setDropdownOpen(false); }}
          style={{ ...menuItemStyle, color: "#ff4d4f", backgroundColor: hovered === "logout" ? "#444" : "transparent" }}
          onMouseEnter={() => setHovered("logout")}
          onMouseLeave={() => setHovered(null)}
        >
          <LogoutOutlined /> Logout
        </div>
      </div>
    </div>
  );

  return (
    <nav
      className="navbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#002140",
      }}
    >
      {/* Logo */}
      <Link href="/game">
        <Image src="/mapmaster-logo.png" alt="Home" width={70} height={60} />
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* Leaderboard */}
        <Tooltip title="Leaderboard">
          <Link href="/leaderboard">
            <TrophyOutlined
              style={{ fontSize: "24px", color: "#fff", cursor: "pointer" }}
              aria-label="Leaderboard"
            />
          </Link>
        </Tooltip>

        {/* Dropdown Trigger */}
        <Dropdown
          dropdownRender={() => dropdownContent}
          trigger={["click"]}
          placement="bottomRight"
          arrow={false}
          open={dropdownOpen}
          onOpenChange={(open) => setDropdownOpen(open)}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: "transparent",
              padding: "8px 12px",
              borderRadius: 10,
              color: "#fff",
              minWidth: 200,
              cursor: "pointer",
            }}
          >
            <Avatar src={avatar || "/avatar_1.png"} size="large" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", fontSize: 14, marginBottom: 4 }}>{username || "Guest"}</div>
              <div style={{ position: "relative", width: "100%", marginBottom: 4 }}>
                <div
                  style={{
                    backgroundColor: "#333",
                    borderRadius: 100,
                    height: 16,
                    width: "100%",
                    overflow: "hidden",
                    boxShadow: "inset 0 0 4px rgba(0,0,0,0.5)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(barPercent, 100)}%`,
                      background: barColor,
                      transition: "width 0.3s ease-in-out",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      zIndex: 1,
                    }}
                  />
                  <div
                    style={{
                      position: "relative",
                      zIndex: 2,
                      color: "#fff",
                      textAlign: "center",
                      fontSize: 10,
                      lineHeight: "16px",
                      fontWeight: 600,
                    }}
                  >
                    {xp} / {title === "MapMaster" ? xp : title === "MapExpert" ? "10000" : "5000"}
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: 4,
                  padding: "4px 12px",
                  backgroundColor:
                    xp >= 10000 ? "#d4af37" :
                      xp >= 5000 ? "#40a9ff" :
                        "#73d13d",
                  color: "#000",
                  fontWeight: "bold",
                  borderRadius: "999px",
                  fontSize: "12px",
                  textAlign: "center",
                  display: "inline-block",
                  boxShadow: "0 0 6px rgba(0,0,0,0.2)",
                }}
              >
                {title}
              </div>

            </div>
          </div>
        </Dropdown>
      </div>
    </nav>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  backgroundColor: "transparent",
  padding: "10px 12px",
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  color: "#fff",
  textDecoration: "none",
  transition: "all 0.2s",
};
