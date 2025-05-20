"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useApi } from "./useApi";
import { useDispatch, useSelector } from "react-redux";
import { answerUpdate, hintUpdate, hintUsageClear, incrementCorrectCount, incrementQuestionCount } from "@/gameSlice";
import { toast } from "react-toastify";
import { countryIdMap } from "@/utils/idToCountryName";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";
import { countryCodeMap } from "@/utils/countryCodeMap";
import { showSuccessToast } from "@/utils/showSuccessToast";
import { showErrorToast } from "@/utils/showErrorToast";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const InteractiveMap = () => {
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
    const computed = window.getComputedStyle(el);
    const originalStroke = computed.stroke;
    const originalStrokeWidth = computed.strokeWidth;

    let count = 0;
    const interval = setInterval(() => {
      const isEven = count % 2 === 0;

      if (isEven) {
        el.style.fill = "#6fff6f";
        el.style.stroke = "#33cc33";
        el.style.strokeWidth = "2";
        el.setAttribute("filter", "url(#glow-green)");
      } else {
        el.style.removeProperty("fill");
        el.style.stroke = originalStroke;
        el.style.strokeWidth = originalStrokeWidth;
      }

      count++;
      if (count >= 6) {
        clearInterval(interval);
        el.style.removeProperty("fill");
        el.style.stroke = originalStroke;
        el.style.strokeWidth = originalStrokeWidth;
        el.removeAttribute("filter");
      }
    }, 200);

    if (svgRef.current) {
      const bbox = el.getBBox();
      const area = bbox.width * bbox.height;

      if (area < 200) {
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;
        const ctm = el.getScreenCTM();
        const svg = svgRef.current;
        if (!svg || !ctm) return;

        const point = svg.createSVGPoint();
        point.x = cx;
        point.y = cy;
        const transformed = point.matrixTransform(ctm);

        const marker = document.createElement("img");
        marker.src = "/magnifier.png";
        marker.style.position = "fixed";
        marker.style.left = `${transformed.x}px`;
        marker.style.top = `${transformed.y}px`;
        marker.style.width = "200px";
        marker.style.height = "200px";
        marker.style.transform = "translate(-45%, -42%)";
        marker.style.pointerEvents = "none";
        marker.style.zIndex = "30";
        document.body.appendChild(marker);

        setTimeout(() => marker.remove(), 2000);
      }
    }
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

          const styleElement = document.createElementNS("http://www.w3.org/2000/svg", "style");
          styleElement.textContent = `
           .country {
              fill: #fff6d5;
              stroke: #888;
              stroke-width: 0.6;
              transition: fill 0.2s ease;
            }

            .country.hovered {
              fill: #ffeb99;
              stroke: #444;
              stroke-width: 1;
              cursor: pointer;
            }
          `;
          svgElement?.insertBefore(styleElement, svgElement.firstChild);
          const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
          defs.innerHTML = `
            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#00ff88" flood-opacity="0.8"/>
            </filter>
          `;
          svgElement?.appendChild(defs);

          if (svgElement) {
            svgRef.current = svgElement;
            svgElement.style.width = "100%";
            svgElement.style.height = "120%";
            svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
            svgElement.style.cursor = "grab";

            const countries = svgElement.querySelectorAll("path");
            countries.forEach(country => {
              if (country.getAttribute("data-type") === "Indeterminate") return;
              const inlineStyle = country.getAttribute("style");
              if (inlineStyle?.includes("fill:")) {
                country.style.removeProperty("fill");
              }

              const countryName = country.getAttribute("data-name_en") || "unknown";
              const countryId = country.getAttribute("id") || "";
              country.classList.add("country");

              country.addEventListener("mouseenter", () => {
                country.classList.add("hovered");
              });

              country.addEventListener("mouseleave", () => {
                country.classList.remove("hovered");
              });

              country.addEventListener("mouseover", (event) => {
                // if (!country.hasAttribute("data-original-fill")) {
                //   const computedStyle = window.getComputedStyle(country);
                //   country.setAttribute("data-original-fill", computedStyle.fill || "#ffeb99");
                // }
                country.classList.add("hovered");
                country.style.cursor = "pointer";

                const infoBox = document.getElementById("info-box");
                if (infoBox) {
                  infoBox.innerText = `Country: ${countryName}`;
                }

                const hoverBox = document.getElementById("hover-info-box");
                if (hoverBox) {
                  hoverBox.innerHTML = `
                    <img src="/flag/${countryCodeMap[countryName]}.svg" style="width: 20px; height: 14px; margin-right: 6px; vertical-align: middle;" />
                    ${countryName}
                  `;
                  hoverBox.style.display = "block";
                  hoverBox.style.opacity = "1";
                  hoverBox.style.transform = "scale(1)";

                  // Position near mouse pointer
                  const offset = 15;
                  const boxWidth = hoverBox.offsetWidth;
                  const boxHeight = hoverBox.offsetHeight;
                  const pageWidth = window.innerWidth;
                  const pageHeight = window.innerHeight;

                  let left = event.clientX + offset;
                  let top = event.clientY + offset;

                  if (left + boxWidth > pageWidth) {
                    left = event.clientX - boxWidth - offset;
                  }
                  if (top + boxHeight > pageHeight) {
                    top = event.clientY - boxHeight - offset;
                  }

                  hoverBox.style.left = `${Math.max(0, left)}px`;
                  hoverBox.style.top = `${Math.max(0, top)}px`;
                }
              });

              country.addEventListener("mousemove", (event) => {
                const hoverBox = document.getElementById("hover-info-box");
                if (hoverBox) {
                  const offset = 15;
                  const boxWidth = hoverBox.offsetWidth;
                  const boxHeight = hoverBox.offsetHeight;
                  const pageWidth = window.innerWidth;
                  const pageHeight = window.innerHeight;

                  let left = event.clientX + offset;
                  let top = event.clientY + offset;

                  if (left + boxWidth > pageWidth) {
                    left = event.clientX - boxWidth - offset;
                  }
                  if (top + boxHeight > pageHeight) {
                    top = event.clientY - boxHeight - offset;
                  }

                  hoverBox.style.left = `${Math.max(0, left)}px`;
                  hoverBox.style.top = `${Math.max(0, top)}px`;
                }
              });

              country.addEventListener("mouseout", () => {
                country.style.removeProperty("fill");

                const infoBox = document.getElementById("info-box");
                if (infoBox) {
                  infoBox.innerText = "Country";
                }

                const hoverBox = document.getElementById("hover-info-box");
                if (hoverBox) {
                  hoverBox.style.opacity = "0";
                  hoverBox.style.transform = "scale(0.98)";
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
                    dispatch(incrementQuestionCount());
                    if (response.judgement) {
                      dispatch(incrementCorrectCount());
                      // toast.success(`Your answer is correct! The answer is: ${countryIdMap[answerRef.current]}`, {
                      //   position: "top-center",
                      //   autoClose: 1000,
                      //   style: {
                      //     width: '300px',
                      //     padding: '30px',
                      //     fontSize: '20px',
                      //     marginTop: '50px',
                      //     marginBottom: '10px',
                      //   },
                      // });
                      showSuccessToast(`Your answer is correct! The answer is: ${countryIdMap[answerRef.current]}`);
                    } else {
                      // toast.error(`Your answer is wrong! The answer is: ${countryIdMap[answerRef.current]}`, {
                      //   position: "top-center",
                      //   autoClose: 1000,
                      //   style: {
                      //     width: '300px',
                      //     padding: '30px',
                      //     fontSize: '20px',
                      //     marginTop: '50px',
                      //     marginBottom: '10px',
                      //   },
                      // });
                      showErrorToast(`Your answer is wrong! The answer is: ${countryIdMap[answerRef.current]}`);
                    }

                    const currentAnswer = answerRef.current;
                    const ansCountryElement = svgElement.querySelector(`path[id="${currentAnswer}"]`) as SVGPathElement | null;
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

              // Move hover info box position while dragging
              const hoverBox = document.getElementById("hover-info-box");
              if (hoverBox) {
                hoverBox.style.left = `${event.clientX + 15}px`
                hoverBox.style.top = `${event.clientY + 15}px`;
              }

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
    <div style={{ width: "100%", height: "100%", position: "relative", background: "linear-gradient(to bottom, #1a3d66 0%, #194b75 50%, #0a1f33 100%)" }}>
      <Particles
        id="tsparticles"
        init={useCallback(async (engine: Engine) => {
          await loadSlim(engine);
        }, [])}
        options={{
          fullScreen: { enable: false },
          // background: { color: "linear-gradient(to bottom, #063357, #021d36)" },
          fpsLimit: 60,
          particles: {
            number: { value: 60 },
            color: { value: "#ffffff" },
            opacity: { value: 0.4 },
            size: { value: 2 },
            move: { enable: true, speed: 0.4 },
            links: {
              enable: true,
              distance: 100,
              color: "#ffffff",
              opacity: 0.2,
              width: 0.5,
            }
          },
          interactivity: {
            events: {
              onHover: { enable: false },
              onClick: { enable: false }
            }
          }
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
          width: "100%",
          height: "100%",
        }}
      />


      {/* Comment info box */}
      {/* <div id="info-box" style={{
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
    </div> */}

      <div id="svg-container" style={{
        width: "100%",
        height: "100%",
        position: "relative",
        background: "transparent",
        // #40e0d0
        //Light Ocean Blue:rgb(49, 114, 158)
        // Deep Ocean Blue:rgb(6, 46, 85)
        borderRadius: "20px",
        overflow: "hidden",
        zIndex: 1,
      }} />
      <div
        id="hover-info-box"
        style={{
          position: "fixed",
          pointerEvents: "none",
          padding: "10px 14px",
          background: "rgba(0, 0, 0, 0.75)",
          color: "#fff",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: 600,
          minWidth: "80px",
          maxWidth: "500px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(3px)",
          zIndex: 20,
          display: "none",
          // transform: "translate(-50%, -100%)",
          transition: "opacity 0.2s ease, transform 0.2s ease",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      />
    </div>
  );
};

export default InteractiveMap;