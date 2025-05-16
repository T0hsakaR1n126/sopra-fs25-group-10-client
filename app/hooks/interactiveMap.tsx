"use client";

import { useEffect, useRef } from "react";
import { useApi } from "./useApi";
import { useDispatch, useSelector } from "react-redux";
import { answerUpdate, hintUpdate, hintUsageClear } from "@/gameSlice";
import { toast, ToastContainer } from "react-toastify";

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
  const modeType = useSelector((state: { game: { modeType: string } }) => state.game.modeType);

  const answer = useSelector((state: { game: { answer: string } }) => state.game.answer);
  const answerRef = useRef(answer);

  const submitLocked = useRef(false);

  interface submitResponse {
    judgement: boolean;
    hints: Map<string, string>[];
    answer: string;
  }

  function flashElement(el: SVGPathElement) {
    const originalStyle = el.getAttribute("style") || "";
    const originalFill = "#fff6d5";

    let count = 0;
    const interval = setInterval(() => {
      const isEven = count % 2 === 0;
      const color = isEven ? "blue" : originalFill;

      const newStyle = originalStyle.replace(/fill:([^;]+);?/, `fill:${color};`);
      el.setAttribute("style", newStyle);

      count++;
      if (count >= 6) {
        clearInterval(interval);
      }
    }, 200);
  }

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

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
            svgElement.style.height = "120%";
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
                  infoBox.innerText = `Country: ${countryName}`;
                }
              });

              country.addEventListener("mouseout", () => {
                const originalColor = country.getAttribute("data-original-fill") || "none";
                country.style.fill = originalColor;
                const infoBox = document.getElementById("info-box");
                if (infoBox) {
                  infoBox.innerText = "Country";
                }
              });

              country.addEventListener("click", (event) => {
                event.stopPropagation();
                if (movedRef.current) {
                  return;
                }
                if (submitLocked.current) { return; }
                submitLocked.current = true;
                apiService.put<submitResponse>(`/submit/${userId}`, { gameId: gameId, submitAnswer: countryId, hintUsingNumber: hintUsageRef.current })
                  .then((response) => {

                    if (response.judgement) {
                      toast.success('Your answer is correct!', {
                        position: "top-center",
                        autoClose: 1000,
                        style: {
                          width: '300px',
                          padding: '30px',
                          fontSize: '20px',
                          marginTop: '50px',
                          marginBottom: '10px',
                        },
                      });
                    } else {
                      toast.error('Your answer is wrong!', {
                        position: "top-center",
                        autoClose: 1000,
                        style: {
                          width: '300px',
                          padding: '30px',
                          fontSize: '20px',
                          marginTop: '50px',
                          marginBottom: '10px',
                        },
                      });
                    }

                    const currentAnswer = answerRef.current;
                    const ansCountryElement = svgElement.querySelector(`path[id="${currentAnswer}"]`) as SVGPathElement | null;
                    // let targetEl: SVGPathElement | null = null;
                    // if (ansCountryElement.length > 0) {
                    //   targetEl = Array.from(ansCountryElement).find(el => !el.id.startsWith("path")) as SVGPathElement || ansCountryElement[0] as SVGPathElement;
                    // }
                    // if (targetEl) {
                    if (ansCountryElement && !ansCountryElement.id.startsWith("path")) {
                      flashElement(ansCountryElement);
                    } else {
                      console.warn("No matching SVG element found for", ansCountryElement);
                    }

                    if (modeType !== "exercise") {
                      dispatch(hintUpdate(response.hints));
                      dispatch(hintUsageClear());
                      dispatch(answerUpdate(response.answer));
                    }
                  })
                  .catch(error => {
                    console.error("Error submitting answer:", error);
                  }).finally(() => {
                    setTimeout(() => submitLocked.current = false, 1000);
                  });
                dispatch(hintUsageClear());
              });
            });

            const updateTransform = () => {
              if (!svgRef.current) return;
              svgRef.current.style.transform = `translate(${translateRef.current.x}px, ${translateRef.current.y}px) scale(${scaleRef.current})`;
            };

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
        Country
      </div>
      <div id="svg-container" style={{
        width: "100%",
        height: "100%",
        overflow: "hidden"
      }} />
      <ToastContainer />
    </div>
  );
};

export default InteractiveMap;
