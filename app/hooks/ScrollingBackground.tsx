"use client";

import { useEffect, useRef } from "react";

export default function ScrollingBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.opacity = "0.15";
    }
  }, []);

  return (
    <div id="scrolling-bg-wrapper" ref={containerRef}>
      <div className="scrolling-image" />
      <div className="scrolling-image second" />
    </div>
  );
}
