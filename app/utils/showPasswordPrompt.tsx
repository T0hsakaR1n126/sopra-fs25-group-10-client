import { toast } from "react-toastify";
import React, { useState, useEffect, useRef } from "react";

export const showPasswordPrompt = (): Promise<string | null> => {
  return new Promise((resolve) => {
    let toastId: string | number;

    const ToastContent = () => {
      const [password, setPassword] = useState("");
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
          if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
            toast.dismiss(toastId);
            resolve(null);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }, []);

      const handleSubmit = () => {
        toast.dismiss(toastId);
        resolve(password.trim() === "" ? null : password);
      };

      const handleCancel = () => {
        toast.dismiss(toastId);
        resolve(null);
      };

      return (
        <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
          <div style={{ fontWeight: "bold", fontSize: "16px", color: "#fff" }}>
            Enter Game Password
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              color: "#fff",
              fontSize: "15px",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button onClick={handleCancel} style={{
              background: "transparent",
              color: "#ccc",
              border: "none",
              fontSize: "14px",
              cursor: "pointer"
            }}>Cancel</button>
            <button onClick={handleSubmit} style={{
              backgroundColor: "#2ecc71",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "14px",
              cursor: "pointer"
            }}>Join</button>
          </div>
        </div>
      );
    };

    toastId = toast(<ToastContent />, {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
      draggable: false,
      style: {
        width: "320px",
        padding: "20px 25px",
        fontSize: "16px",
        fontWeight: "bold",
        color: "#fff",
        background: "rgba(46, 204, 113, 0.25)",
        border: "1px solid rgba(46, 204, 113, 0.5)",
        backdropFilter: "blur(8px)",
        borderRadius: "12px",
        boxShadow: "0 6px 20px rgba(46, 204, 113, 0.4)",
        textAlign: "center",
      },
    });
  });
};
