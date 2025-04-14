"use client";

import { useEffect, useRef } from "react";

const InteractiveMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isZoomedRef = useRef(false);

  useEffect(() => {
    fetch("/world_map.svg")
      .then(response => response.text())
      .then(svgContent => {
        const container = document.getElementById("svg-container");
        if (container) {
          container.innerHTML = svgContent;
          const svgElement = container.querySelector("svg");

          if (svgElement) {
            svgRef.current = svgElement;
            svgElement.style.width = "100%";
            svgElement.style.height = "100%";
            svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");

            const countries = svgElement.querySelectorAll("path");
            countries.forEach(country => {
              const countryName = country.getAttribute("data-name_en") || "unknown";

              country.addEventListener("mouseover", () => {
                country.setAttribute("data-original-fill", "#fff6d5");
                country.style.fill = "blue";
                const infoBox = document.getElementById("info-box");
                if (infoBox) {
                  infoBox.innerText = `Country: ${countryName}`;
                }
              });

              country.addEventListener("mouseout", () => {
                const originalColor = country.getAttribute("data-original-fill") || "none";
                country.style.fill = originalColor;
                const infoBox = document.getElementById("info-box");
                if (infoBox) {
                  infoBox.innerText = "";
                }
              });

              country.addEventListener("click", (event) => {
                event.stopPropagation();
                alert(`You clicked on ${countryName}!`);
              });
            });

            svgElement.addEventListener("click", (event) => {
              if (!svgRef.current) return;

              const svgRect = svgRef.current.getBoundingClientRect();
              const clickX = event.clientX - svgRect.left;
              const clickY = event.clientY - svgRect.top;

              if (isZoomedRef.current) {
                svgElement.style.transform = "scale(1)";
                svgElement.style.transformOrigin = "center";
                isZoomedRef.current = false;
              } else {
                svgElement.style.transform = "scale(5)";
                svgElement.style.transformOrigin = `${clickX}px ${clickY}px`;
                isZoomedRef.current = true;
              }
            }, false);
          }
        }
      })
      .catch(error => console.error("Load failed: ", error));
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div id="info-box" style={{
        color: "black",
        position: "absolute",
        top: "10px",
        left: "10px",
        padding: "8px 12px",
        border: "1px solid #000",
        backgroundColor: "white",
        zIndex: 10,
        pointerEvents: "none",
      }}>
        Country Info
      </div>
      <div id="svg-container" style={{
        width: "100%",
        height: "100%",
        overflow: "hidden"
      }} />
    </div>
  );
};

export default InteractiveMap;
