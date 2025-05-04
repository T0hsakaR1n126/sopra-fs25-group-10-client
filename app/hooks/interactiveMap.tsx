"use client";

import { useEffect, useRef } from "react";
import { useApi } from "./useApi";
import { useDispatch, useSelector } from "react-redux";
import { hintUpdate, hintUsageClear } from "@/gameSlice";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const InteractiveMap: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const scaleRef = useRef(1);
  const movedRef = useRef(false);
  const translateRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const apiService = useApi();
  const dispatch = useDispatch(); // Set up dispatch for Redux actions
  const gameId = useSelector((state: { game: { gameId: string } }) => state.game.gameId);
  const hintUsingNumber = useSelector((state: { game: { hintUsage: number } }) => state.game.hintUsage);
  const hintUsageRef = useRef(hintUsingNumber);
  const userId = useSelector((state: { user: { userId: string } }) => state.user.userId);

  interface submitResponse {
    judgement: boolean;
    hints: Map<string, string>[];
  }

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
            svgElement.style.cursor = "grab";

            const countries = svgElement.querySelectorAll("path");
            countries.forEach(country => {
              if (country.getAttribute("data-type") === "Indeterminate") return;

              const countryName = country.getAttribute("data-name_en") || "unknown";
              const countryId = country.getAttribute("id") || "";

              country.addEventListener("mouseover", () => {
                country.setAttribute("data-original-fill", "#fff6d5");
                country.style.fill = "blue";
                country.style.cursor = "pointer"; 
                const infoBox = document.getElementById("info-box");
                if (infoBox) {
                  infoBox.innerText = `Country Info: ${countryName}`;
                }
              });

              country.addEventListener("mouseout", () => {
                const originalColor = country.getAttribute("data-original-fill") || "none";
                country.style.fill = originalColor;
                const infoBox = document.getElementById("info-box");
                if (infoBox) {
                  infoBox.innerText = "Country Info";
                }
              });

              country.addEventListener("click", (event) => {
                event.stopPropagation();
                if (movedRef.current) {
                  return;
                }
                try {
                  console.log(gameId, countryId, hintUsageRef.current)
                  apiService.put<submitResponse>(`/submit/${userId}`, { gameId: gameId, submitAnswer: countryId, hintUsingNumber: hintUsageRef.current })
                    .then((response) => {
                      console.log(response)
                      if (response.judgement) {
                        alert("Your answer is correct!");
                      } else {
                        alert("Your answer is wrong!");
                      }
                      dispatch(hintUpdate(response.hints));
                      dispatch(hintUsageClear());
                    })
                    .catch(error => {
                      console.error("Error submitting answer:", error);
                    });
                  dispatch(hintUsageClear());
                } catch (error) {
                  console.error("Error fetching country data:", error);
                }
              });
            });

            const updateTransform = () => {
              if (!svgRef.current) return;
              svgRef.current.style.transform = `translate(${translateRef.current.x}px, ${translateRef.current.y}px) scale(${scaleRef.current})`;
            };

            // svgElement.addEventListener("click", (event) => {
            //   if (!svgRef.current) return;

            //   const svgRect = svgRef.current.getBoundingClientRect();
            //   const clickX = event.clientX - svgRect.left;
            //   const clickY = event.clientY - svgRect.top;

            //   if (isZoomedRef.current) {
            //     svgElement.style.transform = "scale(1)";
            //     svgElement.style.transformOrigin = "center";
            //     isZoomedRef.current = false;
            //   } else {
            //     svgElement.style.transform = "scale(5)";
            //     svgElement.style.transformOrigin = `${clickX}px ${clickY}px`;
            //     isZoomedRef.current = true;
            //   }
            // }, false);
            svgElement.addEventListener("wheel", (event) => {
              event.preventDefault();
              if (!svgRef.current) return;

              const zoomSpeed = 0.0015;
              let newScale = scaleRef.current - event.deltaY * zoomSpeed;
              newScale = clamp(newScale, 1, 5); // scope

              const container = document.getElementById("svg-container");
              if (container) {
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;
                const maxOffsetX = (newScale - 1) * containerWidth / 2;
                const maxOffsetY = (newScale - 1) * containerHeight / 2;

                translateRef.current.x = clamp(translateRef.current.x, -maxOffsetX, maxOffsetX);
                translateRef.current.y = clamp(translateRef.current.y, -maxOffsetY, maxOffsetY);
              }

              scaleRef.current = newScale;
              updateTransform();
            }, { passive: false });

            svgElement.addEventListener("mousedown", (event) => {
              isDraggingRef.current = true;
              movedRef.current = false;
              dragStartRef.current = { x: event.clientX, y: event.clientY };
              svgElement.style.cursor = "grabbing";
            });

            window.addEventListener("mousemove", (event) => {
              if (!isDraggingRef.current || !svgRef.current) return;

              const dx = event.clientX - dragStartRef.current.x;
              const dy = event.clientY - dragStartRef.current.y;

              if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                movedRef.current = true;
              }
              
              translateRef.current.x += dx;
              translateRef.current.y += dy;
              dragStartRef.current = { x: event.clientX, y: event.clientY };

              const container = document.getElementById("svg-container");
              if (container) {
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;
                const maxOffsetX = (scaleRef.current - 1) * containerWidth / 2;
                const maxOffsetY = (scaleRef.current - 1) * containerHeight / 2;

                translateRef.current.x = clamp(translateRef.current.x, -maxOffsetX, maxOffsetX);
                translateRef.current.y = clamp(translateRef.current.y, -maxOffsetY, maxOffsetY);
              }

              updateTransform();
            });

            window.addEventListener("mouseup", () => {
              isDraggingRef.current = false;
              if (svgRef.current) svgRef.current.style.cursor = "grab";
            });

            window.addEventListener("mouseleave", () => {
              isDraggingRef.current = false;
              if (svgRef.current) svgRef.current.style.cursor = "grab";
            });
          }
        }
      })
      .catch(error => console.error("Load failed: ", error));
  }, [apiService, dispatch, gameId, userId]);

  useEffect(() => {
    hintUsageRef.current = hintUsingNumber;
  }, [hintUsingNumber]);

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
