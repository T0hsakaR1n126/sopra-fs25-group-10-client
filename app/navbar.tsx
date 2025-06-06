"use client";

import Link from "next/link";
import { useSelector } from "react-redux"; // Import Redux hooks
import { UserOutlined, HistoryOutlined, TrophyOutlined, LogoutOutlined, BookOutlined, HomeOutlined } from "@ant-design/icons";
import { useLogout } from "@/utils/useLogout"; // Import the logout function
import { Avatar, Dropdown, Tooltip } from "antd";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId);
  const username = useSelector((state: { user: { username: string } }) => state.user.username);
  const avatar = useSelector((state: { user: { avatar: string } }) => state.user.avatar);
  const level = useSelector((state: { user: { level: string } }) => state.user.level);
  const logout = useLogout();

  const xp = (Number(level) || 0) * 100;
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
          href={`/users/${userId}/profile`}
          onClick={async (e) => {
            if (pathname !== `/users/${userId}/profile`) {
              e.preventDefault();
              setDropdownOpen(false);
              if (pathname === "/game") {
                window.dispatchEvent(new Event("dashboardExit"));
                await new Promise((res) => setTimeout(res, 1200));
              } else {
                window.dispatchEvent(new Event("otherExit"));
                await new Promise((res) => setTimeout(res, 300));
              }
              router.push(`/users/${userId}/profile`);
            }
          }}
          style={{ ...menuItemStyle, backgroundColor: hovered === "profile" ? "#014b7d" : "transparent" }}
          onMouseEnter={() => setHovered("profile")}
          onMouseLeave={() => setHovered(null)}
        >
          <UserOutlined /> Profile
        </Link>
        <Link
          href="/history"
          onClick={async (e) => {
            if (pathname !== "/history") {
              e.preventDefault();
              setDropdownOpen(false);
              if (pathname === "/game") {
                window.dispatchEvent(new Event("dashboardExit"));
                await new Promise((res) => setTimeout(res, 1200));
              } else {
                window.dispatchEvent(new Event("otherExit"));
                await new Promise((res) => setTimeout(res, 300));
              }
              router.push("/history");
            }
          }}
          style={{ ...menuItemStyle, backgroundColor: hovered === "history" ? "#014b7d" : "transparent" }}
          onMouseEnter={() => setHovered("history")}
          onMouseLeave={() => setHovered(null)}
        >
          <HistoryOutlined /> Game History
        </Link>
        <Link
          href="/statistics"
          onClick={async (e) => {
            if (pathname !== "/statistics") {
              e.preventDefault();
              setDropdownOpen(false);
              if (pathname === "/game") {
                window.dispatchEvent(new Event("dashboardExit"));
                await new Promise((res) => setTimeout(res, 1200));
              } else {
                window.dispatchEvent(new Event("otherExit"));
                await new Promise((res) => setTimeout(res, 300));
              }
              router.push("/statistics");
            }
          }}
          style={{ ...menuItemStyle, backgroundColor: hovered === "statistics" ? "#014b7d" : "transparent" }}
          onMouseEnter={() => setHovered("statistics")}
          onMouseLeave={() => setHovered(null)}
        >
          <BookOutlined /> Statistics
        </Link>
        <div
          onClick={async () => {
            setDropdownOpen(false);
            if (pathname === "/game") {
              window.dispatchEvent(new Event("dashboardExit"));
              await new Promise((res) => setTimeout(res, 1200));
            } else {
              window.dispatchEvent(new Event("otherExit"));
              await new Promise((res) => setTimeout(res, 300));
            }
            logout();
          }}
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
      <Tooltip title="Home">
        <Link
          href="/game"
          onClick={async (e) => {
            e.preventDefault();
            setDropdownOpen(false);
            // if (pathname === "/game") {
            //   window.dispatchEvent(new Event("dashboardExit"));
            //   await new Promise((res) => setTimeout(res, 1500));
            // } else {
            window.dispatchEvent(new Event("otherExit"));
            await new Promise((res) => setTimeout(res, 200));
            // }
            router.push("/game");
          }}
        >
          <HomeOutlined
            style={{ fontSize: "24px", color: "#fff", cursor: "pointer", marginLeft: "8px" }}
            aria-label="Home"
          />
        </Link>
      </Tooltip>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* Leaderboard */}
        <Tooltip title="Leaderboard">
          <Link
            href="/leaderboard"
            onClick={async (e) => {
              if (pathname !== "/leaderboard") {
                e.preventDefault();
                setDropdownOpen(false);
                if (pathname === "/game") {
                  window.dispatchEvent(new Event("dashboardExit"));
                  await new Promise((res) => setTimeout(res, 1200));
                } else {
                  window.dispatchEvent(new Event("otherExit"));
                  await new Promise((res) => setTimeout(res, 300));
                }
                router.push("/leaderboard");
              }
            }}
          >
            <TrophyOutlined
              style={{ fontSize: "24px", color: "#fff", cursor: "pointer" }}
              aria-label="Leaderboard"
            />
          </Link>
        </Tooltip>

        {/* Dropdown Trigger */}
        <Dropdown
          dropdownRender={() => dropdownContent}
          trigger={["hover"]}
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
                    {Math.round(xp)} / {title === "MapMaster" ? xp : title === "MapExpert" ? "10000" : "5000"}
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
