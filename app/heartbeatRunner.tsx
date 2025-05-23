"use client";

import { useHeartbeatManager } from "./hooks/useHeartbeatManager";

export default function HeartbeatRunner() {
  useHeartbeatManager();
  return null;
}