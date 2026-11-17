import React, { useState, useEffect, useRef } from "react";
import { CURSORS_COLLECTION } from "./cursorsData";
import { parseCursorFile } from "./cursorParser";
import { parseAiJsonResponse } from "./aiJsonParser.mjs";
import "./App.css";

function resolvePublicAssetUrl(assetPath) {
  if (
    typeof assetPath !== "string" ||
    !assetPath ||
    /^(?:[a-z][a-z\d+.-]*:|\/)/i.test(assetPath)
  ) {
    return assetPath;
  }
  return `${import.meta.env.BASE_URL}${assetPath}`;
}

// Smooth Zero-Lag Animated Multi-Frame Cursor Preview Component
function CursorFramePlayer({
  frames,
  fallback,
  interval = 150,
  isPlaying = true,
  alt = "Cursor preview",
  className = "cursor-gif",
  style = {}
}) {
  const [frameIdx, setFrameIdx] = useState(0);

  useEffect(() => {
    if (!isPlaying || !frames || frames.length <= 1) {
      setFrameIdx(0);
      return;
    }
    const timer = setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % frames.length);
    }, Math.max(60, interval));
    return () => clearInterval(timer);
  }, [frames, interval, isPlaying]);

  const currentSrc = (frames && frames.length > 0 && frames[frameIdx]) ? frames[frameIdx] : fallback;

  return (
    <img
      className={className}
      src={resolvePublicAssetUrl(currentSrc)}
      alt={alt}
      loading="lazy"
      style={style}
    />
  );
}

// Vector shape path utility for mouse cursor silhouettes
export function shapePathVector(g, shape, sp) {
  g.beginPath();
  if (sp && Array.isArray(sp.customPoints) && sp.customPoints.length >= 3) {
    sp.customPoints.forEach((p, i) => {
      const x = Math.max(-30, Math.min(100, +p[0] || 0));
      const y = Math.max(-20, Math.min(100, +p[1] || 0));
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    });
    g.closePath();
    return;
  }
  if (shape === "hand") {
    g.roundRect(14, 0, 17, 52, 8.5);
    g.roundRect(6, 36, 66, 54, 15);
    g.roundRect(31, 28, 15, 34, 7.5);
    g.roundRect(46, 33, 15, 32, 7.5);
    g.roundRect(58, 40, 14, 30, 7);
    g.roundRect(-2, 46, 22, 26, 11);
  } else if (shape === "pointer-hand") {
    g.moveTo(28, 7);
    g.quadraticCurveTo(28, 1, 34, 1);
    g.quadraticCurveTo(40, 1, 40, 8);
    g.lineTo(40, 43);
    g.lineTo(44, 38);
    g.quadraticCurveTo(49, 34, 53, 39);
    g.quadraticCurveTo(58, 35, 62, 41);
    g.quadraticCurveTo(68, 38, 71, 44);
    g.lineTo(73, 62);
    g.quadraticCurveTo(74, 84, 57, 87);
    g.lineTo(40, 89);
    g.quadraticCurveTo(31, 89, 26, 82);
    g.lineTo(8, 58);
    g.quadraticCurveTo(4, 52, 9, 48);
    g.quadraticCurveTo(14, 44, 19, 49);
    g.lineTo(28, 57);
    g.closePath();
  } else if (shape === "system-arrow") {
    [[0, 0], [1, 78], [17, 62], [29, 88], [39, 84], [28, 57], [54, 57]].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.closePath();
  } else if (shape === "flame-arrow") {
    [[0, 0], [58, 49], [39, 49], [51, 63], [46, 68], [34, 58], [34, 78], [27, 88], [21, 76], [23, 58], [12, 68], [5, 59], [15, 49]].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.closePath();
  } else if (shape === "outline-arrow") {
    [[0, 0], [0, 79], [17, 63], [29, 89], [38, 85], [27, 58], [53, 57]].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.closePath();
  } else if (shape === "arrow-slim") {
    [[0, 0], [25, 23], [16, 25], [28, 48], [20, 52], [10, 30], [2, 39]].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.closePath();
  } else if (shape === "arrow-wide") {
    [[0, 0], [0, 82], [23, 60], [38, 94], [55, 87], [39, 54], [69, 53]].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.closePath();
  } else if (shape === "arrow-curved") {
    g.moveTo(0, 0);
    g.quadraticCurveTo(22, 17, 40, 33);
    g.lineTo(27, 35);
    g.quadraticCurveTo(34, 54, 49, 78);
    g.quadraticCurveTo(47, 84, 40, 87);
    g.quadraticCurveTo(35, 89, 31, 82);
    g.lineTo(16, 54);
    g.lineTo(4, 64);
    g.quadraticCurveTo(3, 29, 0, 0);
    g.closePath();
  } else if (shape === "spear") {
    [[0, 0], [20, 27], [14, 26], [29, 74], [22, 79], [8, 34], [2, 43]].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.closePath();
  } else if (shape === "blade") {
    [[0, 0], [22, 16], [18, 44], [10, 50], [12, 82], [4, 88], [2, 54], [-6, 46], [-8, 16]].forEach((p, i) => (i ? g.lineTo(p[0] + 10, p[1]) : g.moveTo(p[0] + 10, p[1])));
    g.closePath();
  } else if (shape === "aero" || shape === "car") {
    [[0, 0], [6, 32], [20, 56], [32, 88], [48, 80], [34, 48], [58, 44], [36, 20]].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.closePath();
  } else if (shape === "crystal" || shape === "diamond") {
    [[0, 0], [24, 20], [48, 44], [36, 80], [18, 62], [0, 76], [6, 42]].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.closePath();
  } else if (shape === "stealth") {
    [[0, 0], [12, 68], [24, 52], [36, 82], [48, 74], [36, 44], [64, 44]].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.closePath();
  } else {
    // Classic standard arrow
    [[0, 0], [0, 76], [18, 60], [31, 90], [46, 83], [33, 54], [58, 54]].forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
    g.closePath();
  }
}

// Master rendering function: strictly masks media into cursor silhouette with standard proportions & transparent empty canvas
export function drawCursorSilhouetteWithMedia(targetCanvas, mediaEl, opts = {}) {
  if (!targetCanvas) return;
  const H = targetCanvas.width || 256;
  const SC = (H * 0.72) / 90;
  const OX = H * 0.14;
  const OY = H * 0.12;
  const shape = opts.shape || "arrow";
  const tip = shape === "hand" ? [22.5, 0] : shape === "pointer-hand" ? [34, 1] : [0, 0];
  const g = targetCanvas.getContext("2d");

  g.clearRect(0, 0, H, H);
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";

  // Cursor coordinate transform
  g.save();
  g.translate(OX + tip[0] * SC, OY + tip[1] * SC);
  g.translate(-tip[0] * SC, -tip[1] * SC);
  g.scale(SC, SC);

  // 1. Clip strictly to cursor outline silhouette
  g.save();
  shapePathVector(g, shape, opts.sp);
  g.clip();

  // Dark base fill
  g.fillStyle = opts.baseColor || "#090614";
  g.fillRect(-50, -50, 200, 200);

  // Draw media fitted, zoomed, and panned inside cursor silhouette
  if (mediaEl) {
    const userScale = (opts.scale !== undefined ? opts.scale : 100) / 100;
    const userPanX = opts.panX || 0;
    const userPanY = opts.panY || 0;
    const mw = mediaEl.videoWidth || mediaEl.naturalWidth || mediaEl.width || 100;
    const mh = mediaEl.videoHeight || mediaEl.naturalHeight || mediaEl.height || 100;
    const aspect = (mw && mh) ? (mw / mh) : 1;

    let dw = 75 * userScale;
    let dh = (75 / aspect) * userScale;
    if (dh < 95 * userScale) {
      dh = 95 * userScale;
      dw = 95 * aspect * userScale;
    }
    const dx = (28 - dw / 2) + userPanX;
    const dy = (45 - dh / 2) + userPanY;

    try {
      g.drawImage(mediaEl, dx, dy, dw, dh);
    } catch (_) {}
  }

  // 2. Gloss & Inner 3D Shading
  const gloss = g.createLinearGradient(0, 0, 60, 90);
  gloss.addColorStop(0, "rgba(255, 255, 255, 0.3)");
  gloss.addColorStop(0.4, "rgba(255, 255, 255, 0.0)");
  gloss.addColorStop(0.85, "rgba(0, 0, 0, 0.2)");
  gloss.addColorStop(1, "rgba(0, 0, 0, 0.45)");
  g.fillStyle = gloss;
  g.fill();
  g.restore(); // end clip

  // 3. Sharp Cursor Outline on top
  shapePathVector(g, shape, opts.sp);
  g.lineWidth = (opts.outlineWidth || 3) * 2;
  g.strokeStyle = opts.outlineColor || "#000000";
  g.stroke();

  // 4. Glow / Accent Outer Stroke
  if (opts.glowAmt && opts.glowAmt > 0) {
    g.save();
    g.shadowColor = opts.glowColor || "#00d4ff";
    g.shadowBlur = H * 0.08 * opts.glowAmt;
    shapePathVector(g, shape, opts.sp);
    g.lineWidth = (opts.outlineWidth || 3) * 1.3;
    g.strokeStyle = opts.glowColor || "#00d4ff";
    g.stroke();
    g.restore();
  }

  g.restore(); // end cursor coordinate transform
}

// Frame Handling Modern Cut Component
function ModernCutModal({ mediaFile, mediaUrl, isVideo, onClose, onApplyToast }) {
  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const f1CanvasRef = useRef(null);
  const f2CanvasRef = useRef(null);
  const f3CanvasRef = useRef(null);

  const [duration, setDuration] = useState(3.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // 3 frame timestamps (seconds)
  const [f1Time, setF1Time] = useState(0.2);
  const [f2Time, setF2Time] = useState(0.8);
  const [f3Time, setF3Time] = useState(1.4);

  // Fit & Styling
  const [scale, setScale] = useState(100);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [cursorShape, setCursorShape] = useState("arrow");
  const [outlineColor, setOutlineColor] = useState("#000000");
  const [outlineWidth, setOutlineWidth] = useState(3);
  const [glowColor, setGlowColor] = useState("#00d4ff");
  const [glowAmt, setGlowAmt] = useState(0.4);

  // Preview Mode: 'live' or 'loop'
  const [previewMode, setPreviewMode] = useState("live");
  const [loopFrameIdx, setLoopFrameIdx] = useState(0);
  const [isApplying, setIsApplying] = useState(false);

  // Video metadata
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = Math.max(0.5, videoRef.current.duration || 1);
      setDuration(dur);
      setF1Time(+(dur * 0.15).toFixed(2));
      setF2Time(+(dur * 0.50).toFixed(2));
      setF3Time(+(dur * 0.85).toFixed(2));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && isPlaying) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (videoRef.current) {
      videoRef.current.currentTime = t;
    }
  };

  const stepTime = (delta) => {
    const nt = Math.max(0, Math.min(duration, currentTime + delta));
    setCurrentTime(nt);
    if (videoRef.current) {
      videoRef.current.currentTime = nt;
    }
  };

  const captureCurrentTo = (frameNum) => {
    if (frameNum === 1) setF1Time(+currentTime.toFixed(2));
    else if (frameNum === 2) setF2Time(+currentTime.toFixed(2));
    else if (frameNum === 3) setF3Time(+currentTime.toFixed(2));
  };

  const autoSpread = () => {
    setF1Time(+(duration * 0.15).toFixed(2));
    setF2Time(+(duration * 0.50).toFixed(2));
    setF3Time(+(duration * 0.85).toFixed(2));
  };

  // Helper to format time
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 100);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  // Live Canvas Rendering in RequestAnimationFrame
  useEffect(() => {
    let animId;
    const renderLoop = () => {
      if (previewMode === "live") {
        const mediaSource = isVideo ? videoRef.current : imageRef.current;
        if (previewCanvasRef.current && mediaSource) {
          drawCursorSilhouetteWithMedia(previewCanvasRef.current, mediaSource, {
            scale,
            panX,
            panY,
            shape: cursorShape,
            outlineColor,
            outlineWidth,
            glowColor,
            glowAmt
          });
        }
      }
      animId = requestAnimationFrame(renderLoop);
    };
    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [previewMode, scale, panX, panY, cursorShape, outlineColor, outlineWidth, glowColor, glowAmt, currentTime, isVideo]);

  // Live 3-Frame Animated Loop Mode
  useEffect(() => {
    if (previewMode !== "loop") return;
    const interval = setInterval(() => {
      setLoopFrameIdx((prev) => (prev + 1) % 3);
    }, 120);
    return () => clearInterval(interval);
  }, [previewMode]);

  useEffect(() => {
    if (previewMode === "loop" && previewCanvasRef.current) {
      const srcCanvas = loopFrameIdx === 0 ? f1CanvasRef.current : loopFrameIdx === 1 ? f2CanvasRef.current : f3CanvasRef.current;
      if (srcCanvas) {
        const ctx = previewCanvasRef.current.getContext("2d");
        ctx.clearRect(0, 0, 256, 256);
        ctx.drawImage(srcCanvas, 0, 0, 256, 256);
      }
    }
  }, [previewMode, loopFrameIdx]);

  // Update F1, F2, F3 Mini Canvases
  const updateFrameCard = async (targetCanvas, timestampSec) => {
    if (!targetCanvas) return;
    if (isVideo) {
      const offVid = document.createElement("video");
      offVid.src = mediaUrl;
      offVid.muted = true;
      offVid.playsInline = true;
      offVid.currentTime = Math.max(0, Math.min(duration, timestampSec));
      await new Promise((res) => {
        const onSeek = () => {
          offVid.removeEventListener("seeked", onSeek);
          res();
        };
        offVid.addEventListener("seeked", onSeek);
        setTimeout(res, 400);
      });
      drawCursorSilhouetteWithMedia(targetCanvas, offVid, {
        scale,
        panX,
        panY,
        shape: cursorShape,
        outlineColor,
        outlineWidth,
        glowColor,
        glowAmt
      });
    } else {
      drawCursorSilhouetteWithMedia(targetCanvas, imageRef.current, {
        scale,
        panX,
        panY,
        shape: cursorShape,
        outlineColor,
        outlineWidth,
        glowColor,
        glowAmt
      });
    }
  };

  useEffect(() => {
    updateFrameCard(f1CanvasRef.current, f1Time);
  }, [f1Time, scale, panX, panY, cursorShape, outlineColor, outlineWidth, glowColor, glowAmt, duration]);

  useEffect(() => {
    updateFrameCard(f2CanvasRef.current, f2Time);
  }, [f2Time, scale, panX, panY, cursorShape, outlineColor, outlineWidth, glowColor, glowAmt, duration]);

  useEffect(() => {
    updateFrameCard(f3CanvasRef.current, f3Time);
  }, [f3Time, scale, panX, panY, cursorShape, outlineColor, outlineWidth, glowColor, glowAmt, duration]);

  // Apply 3 Frames to Studio
  const handleApply = async () => {
    if (isApplying) return;
    setIsApplying(true);
    try {
      const times = [f1Time, f2Time, f3Time];
      const curCanvases = [];
      const ptrCanvases = [];

      for (let i = 0; i < 3; i++) {
        let mediaSrc = imageRef.current;
        if (isVideo) {
          const offVid = document.createElement("video");
          offVid.src = mediaUrl;
          offVid.muted = true;
          offVid.playsInline = true;
          offVid.currentTime = Math.max(0, Math.min(duration, times[i]));
          await new Promise((res) => {
            const onSeek = () => {
              offVid.removeEventListener("seeked", onSeek);
              res();
            };
            offVid.addEventListener("seeked", onSeek);
            setTimeout(res, 500);
          });
          mediaSrc = offVid;
        }

        // Render Cursor Frame
        const cCur = document.createElement("canvas");
        cCur.width = cCur.height = 256;
        drawCursorSilhouetteWithMedia(cCur, mediaSrc, {
          scale,
          panX,
          panY,
          shape: cursorShape,
          outlineColor,
          outlineWidth,
          glowColor,
          glowAmt
        });
        curCanvases.push(cCur);

        // Render Pointer Frame (Hand Silhouette)
        const cPtr = document.createElement("canvas");
        cPtr.width = cPtr.height = 256;
        drawCursorSilhouetteWithMedia(cPtr, mediaSrc, {
          scale,
          panX,
          panY,
          shape: "hand",
          outlineColor,
          outlineWidth,
          glowColor,
          glowAmt
        });
        ptrCanvases.push(cPtr);
      }

      if (window._applyModernCutFrames) {
        window._applyModernCutFrames(curCanvases, {
          pointerFrames: ptrCanvases,
          shape: cursorShape,
          outlineColor,
          glowColor,
          glowAmt
        });
      }
      if (onApplyToast) onApplyToast("Applied 3 media frames under cursor outline!");
      onClose();
    } catch (err) {
      console.error(err);
      if (onApplyToast) onApplyToast("Error applying frames: " + err.message);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="modern-cut-overlay" onClick={onClose}>
      <div className="modern-cut-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modern-cut-header">
          <div className="modern-cut-title-group">
            <span className="modern-cut-badge">Frame Handling Modern Cut</span>
            <h2 className="modern-cut-title">Trim &amp; Fit 3 Frames to Mouse Cursor</h2>
            <span className="modern-cut-filename">{mediaFile?.name || "Media"}</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modern-cut-body">
          {/* Left Column: Player, Scrubber, Frame Selectors & Fit Controls */}
          <div className="modern-cut-col">
            <div className="modern-player-card">
              <div className="modern-video-wrap">
                {isVideo ? (
                  <video
                    ref={videoRef}
                    src={mediaUrl}
                    playsInline
                    muted
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                  />
                ) : (
                  <img ref={imageRef} src={mediaUrl} alt="Media source" />
                )}
              </div>

              {isVideo && (
                <div className="modern-player-controls">
                  <div className="scrubber-row">
                    <input
                      type="range"
                      className="modern-scrubber"
                      min="0"
                      max={duration || 1}
                      step="0.01"
                      value={currentTime}
                      onChange={handleSeek}
                    />
                    <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
                  </div>

                  <div className="playback-btn-row">
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button type="button" className="btn sm pri" onClick={togglePlay}>
                        {isPlaying ? "Pause" : "Play"}
                      </button>
                      <button type="button" className="btn sm" onClick={autoSpread} title="Evenly distribute 3 frames across video">
                        Auto Spread
                      </button>
                    </div>
                    <div className="step-btns-group">
                      <button type="button" className="btn sm btn-step" onClick={() => stepTime(-1)}>-1s</button>
                      <button type="button" className="btn sm btn-step" onClick={() => stepTime(-0.1)}>-0.1s</button>
                      <button type="button" className="btn sm btn-step" onClick={() => stepTime(0.1)}>+0.1s</button>
                      <button type="button" className="btn sm btn-step" onClick={() => stepTime(1)}>+1s</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3 Frame Selection Cards */}
            <div className="frames-cut-grid">
              {/* Frame 1 */}
              <div className="frame-cut-card active">
                <div className="frame-cut-title">
                  <span>Frame 1</span>
                  <span className="frame-timestamp-badge">{isVideo ? f1Time.toFixed(2) + "s" : "Base"}</span>
                </div>
                <canvas ref={f1CanvasRef} className="frame-mini-canvas" width="256" height="256" />
                {isVideo ? (
                  <>
                    <button type="button" className="btn sm btn-capture-frame" onClick={() => captureCurrentTo(1)}>
                      Capture at {currentTime.toFixed(2)}s
                    </button>
                    <input
                      type="range"
                      min="0"
                      max={duration || 1}
                      step="0.01"
                      value={f1Time}
                      onChange={(e) => setF1Time(parseFloat(e.target.value))}
                      style={{ width: "100%", height: "4px" }}
                    />
                  </>
                ) : (
                  <span style={{ fontSize: "10px", color: "var(--mu)" }}>Initial Frame</span>
                )}
              </div>

              {/* Frame 2 */}
              <div className="frame-cut-card active">
                <div className="frame-cut-title">
                  <span>Frame 2</span>
                  <span className="frame-timestamp-badge">{isVideo ? f2Time.toFixed(2) + "s" : "+Pulse"}</span>
                </div>
                <canvas ref={f2CanvasRef} className="frame-mini-canvas" width="256" height="256" />
                {isVideo ? (
                  <>
                    <button type="button" className="btn sm btn-capture-frame" onClick={() => captureCurrentTo(2)}>
                      Capture at {currentTime.toFixed(2)}s
                    </button>
                    <input
                      type="range"
                      min="0"
                      max={duration || 1}
                      step="0.01"
                      value={f2Time}
                      onChange={(e) => setF2Time(parseFloat(e.target.value))}
                      style={{ width: "100%", height: "4px" }}
                    />
                  </>
                ) : (
                  <span style={{ fontSize: "10px", color: "var(--mu)" }}>Motion Frame</span>
                )}
              </div>

              {/* Frame 3 */}
              <div className="frame-cut-card active">
                <div className="frame-cut-title">
                  <span>Frame 3</span>
                  <span className="frame-timestamp-badge">{isVideo ? f3Time.toFixed(2) + "s" : "+Finish"}</span>
                </div>
                <canvas ref={f3CanvasRef} className="frame-mini-canvas" width="256" height="256" />
                {isVideo ? (
                  <>
                    <button type="button" className="btn sm btn-capture-frame" onClick={() => captureCurrentTo(3)}>
                      Capture at {currentTime.toFixed(2)}s
                    </button>
                    <input
                      type="range"
                      min="0"
                      max={duration || 1}
                      step="0.01"
                      value={f3Time}
                      onChange={(e) => setF3Time(parseFloat(e.target.value))}
                      style={{ width: "100%", height: "4px" }}
                    />
                  </>
                ) : (
                  <span style={{ fontSize: "10px", color: "var(--mu)" }}>Loop Frame</span>
                )}
              </div>
            </div>

            {/* Cursor Fit & Shape Styling Controls */}
            <div className="cut-controls-card">
              <div className="control-row">
                <span className="control-label">Cursor Shape</span>
                <div className="shape-btn-group">
                  {[
                    { id: "arrow", label: "Arrow" },
                    { id: "hand", label: "Hand" },
                    { id: "blade", label: "Blade" },
                    { id: "diamond", label: "Diamond" },
                    { id: "aero", label: "Aero" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`shape-opt-btn ${cursorShape === s.id ? "active" : ""}`}
                      onClick={() => setCursorShape(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-row">
                <span className="control-label">Zoom Scale</span>
                <div className="control-slider-wrap">
                  <input
                    type="range"
                    className="control-slider"
                    min="50"
                    max="260"
                    value={scale}
                    onChange={(e) => setScale(parseInt(e.target.value, 10))}
                  />
                  <span className="control-val">{scale}%</span>
                </div>
              </div>

              <div className="control-row">
                <span className="control-label">Pan Offset X</span>
                <div className="control-slider-wrap">
                  <input
                    type="range"
                    className="control-slider"
                    min="-60"
                    max="60"
                    value={panX}
                    onChange={(e) => setPanX(parseInt(e.target.value, 10))}
                  />
                  <span className="control-val">{panX}px</span>
                </div>
              </div>

              <div className="control-row">
                <span className="control-label">Pan Offset Y</span>
                <div className="control-slider-wrap">
                  <input
                    type="range"
                    className="control-slider"
                    min="-60"
                    max="60"
                    value={panY}
                    onChange={(e) => setPanY(parseInt(e.target.value, 10))}
                  />
                  <span className="control-val">{panY}px</span>
                </div>
              </div>

              <div className="control-row">
                <span className="control-label">Outline Border</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                  <input
                    type="color"
                    value={outlineColor}
                    onChange={(e) => setOutlineColor(e.target.value)}
                    style={{ width: "28px", height: "24px", border: 0, padding: 0, background: "transparent", cursor: "pointer" }}
                  />
                  <input
                    type="range"
                    className="control-slider"
                    min="1"
                    max="6"
                    step="0.5"
                    value={outlineWidth}
                    onChange={(e) => setOutlineWidth(parseFloat(e.target.value))}
                  />
                  <span className="control-val">{outlineWidth}px</span>
                </div>
              </div>

              <div className="control-row">
                <span className="control-label">Neon Glow</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                  <input
                    type="color"
                    value={glowColor}
                    onChange={(e) => setGlowColor(e.target.value)}
                    style={{ width: "28px", height: "24px", border: 0, padding: 0, background: "transparent", cursor: "pointer" }}
                  />
                  <input
                    type="range"
                    className="control-slider"
                    min="0"
                    max="1"
                    step="0.05"
                    value={glowAmt}
                    onChange={(e) => setGlowAmt(parseFloat(e.target.value))}
                  />
                  <span className="control-val">{Math.round(glowAmt * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Cursor Silhouette Canvas & Preview Modes */}
          <div className="modern-cut-col">
            <div className="preview-stage-card">
              <div className="preview-mode-bar">
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>Live Cursor Silhouette</span>
                <div className="preview-mode-tabs">
                  <button
                    type="button"
                    className={`preview-mode-tab ${previewMode === "live" ? "active" : ""}`}
                    onClick={() => setPreviewMode("live")}
                  >
                    Scrub Preview
                  </button>
                  <button
                    type="button"
                    className={`preview-mode-tab ${previewMode === "loop" ? "active" : ""}`}
                    onClick={() => setPreviewMode("loop")}
                  >
                    3-Frame Loop (120ms)
                  </button>
                </div>
              </div>

              <div className="silhouette-canvas-box">
                <canvas ref={previewCanvasRef} width="256" height="256" />
              </div>

              <div className="silhouette-hint-badge">
                Masked strictly to cursor outline with 100% transparent background pixels outside the shape.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modern-cut-footer">
          <button type="button" className="btn sm" onClick={onClose} disabled={isApplying}>
            Cancel
          </button>
          <button
            type="button"
            className="btn sm pri"
            onClick={handleApply}
            disabled={isApplying}
            style={{ padding: "8px 20px", fontWeight: 700 }}
          >
            {isApplying ? "Processing 3 Frames..." : "Apply 3 Frames to Cursor (.ANI)"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("cursors");
  const [backgroundTheme, setBackgroundTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("cursors_u_background_theme");
      return savedTheme === "dark" || savedTheme === "dark-video" ? "dark" : "blur";
    } catch (error) {
      console.warn("Could not read the background theme preference:", error);
      return "blur";
    }
  });
  const [galleryTab, setGalleryTab] = useState("all");
  const [savedCursors, setSavedCursors] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cursors_u_saved_sets") || "[]");
    } catch (e) {
      return [];
    }
  });

  const [testingItem, setTestingItem] = useState(null);
  const testingItemRef = useRef(null);
  const [selectedCursor, setSelectedCursor] = useState(null);
  const cursorBannerRef = useRef(null);
  const cursorSceneFrameRef = useRef(null);

  // AI Generations History State (saved across sessions)
  const [aiHistory, setAiHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cursors_u_ai_generations") || "[]");
    } catch {
      return [];
    }
  });
  const [aiHistoryPage, setAiHistoryPage] = useState(0);
  const aiHistoryPageSize = 2;
  const aiHistoryPageCount = Math.max(1, Math.ceil(aiHistory.length / aiHistoryPageSize));
  const currentAiHistoryPage = Math.min(aiHistoryPage, aiHistoryPageCount - 1);

  const recordAiGen = (item) => {
    setAiHistory((prev) => {
      const updated = [item, ...prev.filter((x) => x.id !== item.id)].slice(0, 40);
      try {
        localStorage.setItem("cursors_u_ai_generations", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const deleteAiGen = (id) => {
    setAiHistory((prev) => {
      const updated = prev.filter((x) => x.id !== id);
      try {
        localStorage.setItem("cursors_u_ai_generations", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast("Deleted cursor from AI history");
  };

  const loadAiGen = (item) => {
    if (window._loadAiGenItem) {
      window._loadAiGenItem(item);
    }
  };

  const sendAiGenToAnimated = (item) => {
    if (window._sendAiGenToAnimated) {
      window._sendAiGenToAnimated(item);
    }
    setActiveTab("animated");
  };

  const handleEditSavedCursor = (item) => {
    const targetTab = item.is_animated ? "animated" : "draw";
    setActiveTab(targetTab);
    setTimeout(() => {
      if (window._loadSavedIntoStudio) {
        window._loadSavedIntoStudio(item, targetTab);
      }
    }, 60);
    showToast(`Loaded "${item.title}" into ${targetTab} studio!`);
  };

  const handleDownloadSavedZip = (item) => {
    if (window._downloadSavedZip) {
      window._downloadSavedZip(item);
    }
  };

  window._recordAiGen = recordAiGen;

  // Startup Intro Splash State
  const [showIntro, setShowIntro] = useState(true);
  const [introFading, setIntroFading] = useState(false);

  // Available Models List from API
  const [availableModels, setAvailableModels] = useState([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [hoveredCursorId, setHoveredCursorId] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  window._openSettingsModal = () => setShowSettingsModal(true);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const galleryItems = galleryTab === "all" ? CURSORS_COLLECTION : savedCursors;

  // Frame Handling Modern Cut Modal State
  const [showModernCutModal, setShowModernCutModal] = useState(false);
  const [cutMedia, setCutMedia] = useState(null);
  const mediaFileInputRef = useRef(null);

  const handleMediaFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|ogg)$/i.test(file.name);
    const url = URL.createObjectURL(file);
    setCutMedia({ file, url, isVideo, name: file.name });
    setShowModernCutModal(true);
    e.target.value = "";
  };

  window._openModernCutWithFile = (file) => {
    if (!file) return;
    const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|ogg)$/i.test(file.name);
    const url = URL.createObjectURL(file);
    setCutMedia({ file, url, isVideo, name: file.name });
    setShowModernCutModal(true);
  };

  // AI & Model Settings State
  const [aiProvider, setAiProvider] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem("cursormaker2") || "{}");
      return cfg.prov || "gemini";
    } catch (e) {
      return "gemini";
    }
  });

  const [aiKey, setAiKey] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem("cursormaker2") || "{}");
      const p = cfg.prov || "gemini";
      return (cfg[p] || {}).key || "";
    } catch (e) {
      return "";
    }
  });

  const [aiModel, setAiModel] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem("cursormaker2") || "{}");
      const p = cfg.prov || "gemini";
      const m = (cfg[p] || {}).model;
      if (m) return m;
      return p === "gemini" ? "gemini-2.0-flash" : p === "claude" ? "claude-3-5-sonnet-20241022" : "gpt-4o-mini";
    } catch (e) {
      return "gemini-2.0-flash";
    }
  });

  const [aiBase, setAiBase] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem("cursormaker2") || "{}");
      const p = cfg.prov || "gemini";
      return (cfg[p] || {}).base || (p === "openai" ? "https://api.openai.com/v1" : "http://localhost:11434/v1");
    } catch (e) {
      return "https://api.openai.com/v1";
    }
  });

  const [testStatus, setTestStatus] = useState(null);
  const [isTestingApi, setIsTestingApi] = useState(false);

  const saveAiSettings = (p, k, m, b) => {
    try {
      const stored = JSON.parse(localStorage.getItem("cursormaker2") || "{}");
      stored.prov = p;
      if (!stored[p]) stored[p] = {};
      stored[p].key = k ? k.trim() : "";
      stored[p].model = m ? m.trim() : "";
      stored[p].base = b ? b.trim() : "";
      localStorage.setItem("cursormaker2", JSON.stringify(stored));
      if (window._updateStudioConfig) window._updateStudioConfig(stored);
    } catch (e) {}
  };

  const handleProviderSelect = (p) => {
    setAiProvider(p);
    setTestStatus(null);
    try {
      const cfg = JSON.parse(localStorage.getItem("cursormaker2") || "{}");
      const provData = cfg[p] || {};
      const defM = p === "gemini" ? "gemini-2.0-flash" : p === "claude" ? "claude-3-5-sonnet-20241022" : "gpt-4o-mini";
      const m = provData.model || defM;
      const k = provData.key || "";
      const b = provData.base || (p === "openai" ? "https://api.openai.com/v1" : "");
      setAiModel(m);
      setAiKey(k);
      setAiBase(b);
      saveAiSettings(p, k, m, b);
    } catch (e) {}
  };

  const handleKeyChange = (val) => {
    setAiKey(val);
    setTestStatus(null);
    const trimmed = val.trim();
    let detectedProv = aiProvider;
    if (trimmed.startsWith("AIzaSy")) {
      detectedProv = "gemini";
    } else if (trimmed.startsWith("sk-ant")) {
      detectedProv = "claude";
    } else if (trimmed.startsWith("sk-") && !trimmed.startsWith("sk-ant")) {
      detectedProv = "openai";
    }
    if (detectedProv !== aiProvider) {
      setAiProvider(detectedProv);
      const defM = detectedProv === "gemini" ? "gemini-2.0-flash" : detectedProv === "claude" ? "claude-3-5-sonnet-20241022" : "gpt-4o-mini";
      setAiModel(defM);
      saveAiSettings(detectedProv, trimmed, defM, detectedProv === "openai" ? "https://api.openai.com/v1" : aiBase);
    } else {
      saveAiSettings(aiProvider, trimmed, aiModel, aiBase);
    }
  };

  const testApiConnection = async () => {
    setIsTestingApi(true);
    setTestStatus({ loading: true, msg: "Testing API connection..." });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const key = aiKey.trim();
      const p = aiProvider;
      if (p !== "openai" && !key) {
        throw new Error(`Please enter your ${p === "gemini" ? "Gemini" : "Claude"} API key first.`);
      }
      const ensureSuccess = async (res) => {
        if (res.ok) return;
        const text = await res.text();
        let message = text;
        try {
          const error = JSON.parse(text);
          if (error.error?.message) message = error.error.message;
        } catch (_) {}
        throw new Error(message || `Request failed (HTTP ${res.status})`);
      };
      if (p === "gemini") {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?pageSize=1&key=${encodeURIComponent(key)}`;
        const res = await fetch(url, { signal: controller.signal });
        await ensureSuccess(res);
        setTestStatus({ success: true, msg: "Gemini API connection verified." });
      } else if (p === "claude") {
        const res = await fetch("https://api.anthropic.com/v1/models?limit=1", {
          headers: {
            "content-type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true"
          },
          signal: controller.signal
        });
        await ensureSuccess(res);
        setTestStatus({ success: true, msg: "Claude API connection verified." });
      } else {
        const base = (aiBase.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
        const h = { "content-type": "application/json" };
        if (key) h.authorization = `Bearer ${key}`;
        const res = await fetch(`${base}/models`, { headers: h, signal: controller.signal });
        await ensureSuccess(res);
        setTestStatus({ success: true, msg: `API connection verified: ${base}` });
      }
    } catch (err) {
      setTestStatus({
        success: false,
        msg: err.name === "AbortError" ? "Connection timed out after 8 seconds." : err.message
      });
    } finally {
      clearTimeout(timeoutId);
      setIsTestingApi(false);
    }
  };

  // Fetch all accessible models from API provider
  const fetchAvailableModels = async (prov = aiProvider, key = aiKey, base = aiBase) => {
    setIsFetchingModels(true);
    setTestStatus({ loading: true, msg: "Retrieving available models list..." });
    try {
      if (prov === "gemini") {
        const k = key.trim();
        if (!k) throw new Error("Please enter your Gemini API key first.");
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${encodeURIComponent(k)}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `Failed to fetch Gemini models (HTTP ${res.status})`);
        }
        const data = await res.json();
        const list = (data.models || [])
          .filter((m) => !m.supportedGenerationMethods || m.supportedGenerationMethods.includes("generateContent"))
          .map((m) => m.name.replace(/^models\//, ""))
          .sort();
        if (list.length > 0) {
          setAvailableModels(list);
          if (!list.includes(aiModel)) {
            setAiModel(list[0]);
            saveAiSettings(prov, k, list[0], base);
          }
          setTestStatus({ success: true, msg: `Retrieved ${list.length} Gemini models!` });
        } else {
          const fallback = ["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro", "gemini-1.5-flash"];
          setAvailableModels(fallback);
          setTestStatus({ success: true, msg: "Loaded standard Gemini models." });
        }
      } else if (prov === "claude") {
        const k = key.trim();
        if (!k) throw new Error("Please enter your Claude API key first.");
        try {
          const res = await fetch("https://api.anthropic.com/v1/models?limit=100", {
            headers: {
              "content-type": "application/json",
              "x-api-key": k,
              "anthropic-version": "2023-06-01",
              "anthropic-dangerous-direct-browser-access": "true"
            }
          });
          if (res.ok) {
            const data = await res.json();
            const list = (data.data || []).map((m) => m.id).sort();
            if (list.length > 0) {
              setAvailableModels(list);
              if (!list.includes(aiModel)) {
                setAiModel(list[0]);
                saveAiSettings(prov, k, list[0], base);
              }
              setTestStatus({ success: true, msg: `Retrieved ${list.length} Claude models!` });
              return;
            }
          }
        } catch (_) {}
        const fallback = [
          "claude-3-5-sonnet-20241022",
          "claude-3-5-haiku-20241022",
          "claude-3-opus-20240229",
          "claude-3-sonnet-20240229",
          "claude-3-haiku-20240307"
        ];
        setAvailableModels(fallback);
        setTestStatus({ success: true, msg: "Loaded standard Claude models." });
      } else {
        const hUrl = (base.trim() || "https://api.openai.com/v1").replace(/\/$/, "");
        const k = key.trim();
        const headers = { "content-type": "application/json" };
        if (k) headers.authorization = `Bearer ${k}`;
        const res = await fetch(`${hUrl}/models`, { headers });
        if (!res.ok) {
          throw new Error(`Failed to fetch models from ${hUrl} (HTTP ${res.status})`);
        }
        const data = await res.json();
        const list = (data.data || []).map((m) => m.id).sort();
        if (list.length > 0) {
          setAvailableModels(list);
          if (!list.includes(aiModel)) {
            setAiModel(list[0]);
            saveAiSettings(prov, k, list[0], base);
          }
          setTestStatus({ success: true, msg: `Retrieved ${list.length} models from endpoint!` });
        } else {
          const fallback = ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "llama3.1"];
          setAvailableModels(fallback);
          setTestStatus({ success: true, msg: "Loaded default models list." });
        }
      }
    } catch (err) {
      setTestStatus({ success: false, msg: err.message });
      if (prov === "gemini") {
        setAvailableModels(["gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro", "gemini-1.5-flash"]);
      } else if (prov === "claude") {
        setAvailableModels(["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"]);
      } else {
        setAvailableModels(["gpt-4o", "gpt-4o-mini", "llama3.1"]);
      }
    } finally {
      setIsFetchingModels(false);
    }
  };

  // Startup Intro timer: smooth fade out
  useEffect(() => {
    const t1 = setTimeout(() => setIntroFading(true), 2400);
    const t2 = setTimeout(() => setShowIntro(false), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const startupAudioRef = useRef(null);
  const studioInitRef = useRef(false);

  useEffect(() => {
    const audio = startupAudioRef.current;
    if (!audio) return undefined;
    audio.volume = 0.7;

    const removeGestureListeners = () => {
      document.removeEventListener("pointerdown", playAfterGesture);
      document.removeEventListener("keydown", playAfterGesture);
    };
    const playAfterGesture = () => {
      removeGestureListeners();
      const playback = audio.play();
      if (playback && typeof playback.catch === "function") {
        playback.catch((error) => {
          if (error.name !== "NotAllowedError") {
            console.error("Startup sound failed to play:", error);
          }
        });
      }
    };
    const playback = audio.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch((error) => {
        if (error.name === "NotAllowedError") {
          document.addEventListener("pointerdown", playAfterGesture, { once: true });
          document.addEventListener("keydown", playAfterGesture, { once: true });
        } else {
          console.error("Startup sound failed to play:", error);
        }
      });
    }

    return removeGestureListeners;
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cursors_u_background_theme", backgroundTheme);
    } catch (error) {
      console.warn("Could not save the background theme preference:", error);
    }

    window._refreshStudioTheme?.();
  }, [backgroundTheme]);

  // Sync saved cursors globally
  useEffect(() => {
    window._refreshSavedCursors = (list) => {
      setSavedCursors([...list]);
    };
  }, []);

  // Show Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? "" : prev));
    }, 2000);
  };

  // Window Controls for Electron
  const handleMinimize = () => window.goitWindow?.minimize();
  const handleMaximize = () => window.goitWindow?.maximize();
  const handleClose = () => window.goitWindow?.close();

  const applyCursorToScene = async (item) => {
    const arrowUrl = item?.is_animated && item?.ani
      ? item.ani
      : item?.cur || item?.png || item?.gif;
    const arrowFallbackUrl = item?.png || item?.gif;
    const pointerUrl = item?.pointer_cur || item?.pointer_png || arrowFallbackUrl;
    const pointerFallbackUrl = item?.pointer_png || arrowFallbackUrl;
    if (!arrowUrl && !pointerUrl) return;
    const arrowImagePath = item?.is_animated
      ? item.gif || item.png || item.pointer_png || item.frames?.[0]
      : item?.png || item?.gif || item?.pointer_png || item?.frames?.[0];
    const pointerImagePath =
      item?.pointer_png || item?.pointer_gif || item?.png || item?.gif || item?.frames?.[0];
    const resolvePreviewSource = (assetPath) => {
      if (
        typeof window.goitWindow?.getCursorPreview === "function" &&
        typeof assetPath === "string" &&
        !/^(?:[a-z][a-z\d+.-]*:|\/)/i.test(assetPath)
      ) {
        return window.goitWindow.getCursorPreview(assetPath);
      }
      return Promise.resolve(resolvePublicAssetUrl(assetPath));
    };

    try {
      const [arrowImageUrl, pointerImageUrl] = await Promise.all([
        resolvePreviewSource(arrowImagePath),
        resolvePreviewSource(pointerImagePath),
      ]);
      if (testingItemRef.current?.id !== item.id) return;
      const scene = cursorSceneFrameRef.current?.contentWindow;
      if (!scene) return;

      scene.postMessage(
        {
          type: "cursor-test",
          action: "apply",
          arrowUrl: resolvePublicAssetUrl(arrowUrl),
          arrowFallbackUrl: resolvePublicAssetUrl(arrowFallbackUrl),
          arrowImageUrl,
          arrowHotspotX: Number.isFinite(item.hotspotX) ? item.hotspotX : 0,
          arrowHotspotY: Number.isFinite(item.hotspotY) ? item.hotspotY : 0,
          pointerUrl: resolvePublicAssetUrl(pointerUrl),
          pointerFallbackUrl: resolvePublicAssetUrl(pointerFallbackUrl),
          pointerImageUrl,
          pointerHotspotX: Number.isFinite(item.pointerHotspotX) ? item.pointerHotspotX : 0,
          pointerHotspotY: Number.isFinite(item.pointerHotspotY) ? item.pointerHotspotY : 0,
        },
        "*"
      );
    } catch (error) {
      console.error("Could not load the cursor preview assets:", error);
      showToast("Could not load cursor preview assets. Reinstall the app and try again.");
    }
  };

  // Keep the selected cursor active in the Explorer scene until the user stops it.
  const stopTry = () => {
    testingItemRef.current = null;
    cursorSceneFrameRef.current?.contentWindow?.postMessage(
      { type: "cursor-test", action: "clear" },
      "*"
    );
    setTestingItem(null);
  };

  const closeCursorBanner = () => {
    if (testingItemRef.current) stopTry();
    setOpenDropdownId(null);
    setSelectedCursor(null);
  };

  const openCursorBanner = (item) => {
    setOpenDropdownId(null);
    setSelectedCursor(item);
  };

  const toggleTry = (item) => {
    if (testingItemRef.current?.id === item.id) {
      stopTry();
      return;
    }
    if (
      !item.gif &&
      !item.png &&
      !item.pointer_png &&
      !item.pointer_gif &&
      !(item.frames && item.frames.length > 0)
    ) {
      showToast("This cursor has no preview image to test.");
      return;
    }

    testingItemRef.current = item;
    setTestingItem(item);
    applyCursorToScene(item);
  };

  useEffect(() => {
    if (selectedCursor) cursorBannerRef.current?.focus();
  }, [selectedCursor]);

  // Delete from Saved
  const deleteSavedCursor = (id) => {
    const updated = savedCursors.filter((c) => c.id !== id);
    setSavedCursors(updated);
    try {
      localStorage.setItem("cursors_u_saved_sets", JSON.stringify(updated));
    } catch (e) {}
    showToast("Cursor removed from Saved");
  };

  // Studio Initialization & Tab Router
  useEffect(() => {
    window._reactSetActiveTab = setActiveTab;
    if (activeTab === "cursors") return;
    if (studioInitRef.current) {
      if (window._setStudioTab) window._setStudioTab(activeTab.toLowerCase());
      return;
    }
    studioInitRef.current = true;
    initStudio(activeTab.toLowerCase(), showToast);
  }, [activeTab]);

  return (
    <div
      className="app-shell"
      data-background-theme={backgroundTheme}
      data-active-tab={activeTab}
      data-intro-active={showIntro ? "true" : "false"}
    >
      <video
        className="background-video"
        src={resolvePublicAssetUrl(backgroundTheme === "dark" ? "dark.mp4" : "loop.mp4")}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        onError={(event) => console.error("Background video failed to load:", event.currentTarget.error)}
      />
      <audio
        ref={startupAudioRef}
        src="./startup.mp3"
        preload="auto"
        aria-hidden="true"
        onError={(event) => console.error("Startup sound failed to load:", event.currentTarget.error)}
      />

      {/* Startup Intro Splash Screen */}
      {showIntro && (
        <div
          className={`app-intro-overlay ${introFading ? "fade-out" : ""}`}
          onClick={() => setShowIntro(false)}
        >
          <div className="intro-pure-container" onClick={(e) => e.stopPropagation()}>
            <div className="intro-banner-brand">
              <img src={resolvePublicAssetUrl("icon.svg")} alt="" className="intro-banner-icon" />
              <div className="intro-banner-copy">
                <span className="intro-banner-eyebrow">CURSOR DESIGN STUDIO</span>
                <h1 className="intro-pure-title">cursors U</h1>
                <p className="intro-pure-subtitle">Create, animate, and customize your cursor.</p>
              </div>
            </div>
            <div className="intro-banner-footer">
              <a
                href="https://github.com/YASSER-27"
                target="_blank"
                rel="noopener noreferrer"
                className="intro-pure-author"
              >
                Yasser-27
              </a>
              <span className="intro-banner-status">READY TO CREATE</span>
            </div>
          </div>
        </div>
      )}

      {/* Frameless Window Bar */}
      <header className="window-bar">
        <div className="window-title-group">
          <img src={resolvePublicAssetUrl("icon.svg")} alt="cursors U" className="window-app-icon" />
          <span className="window-title">cursors U</span>
        </div>

        <div className="window-drag-area" />

        <div className="window-actions-area">
          <a
            href="https://github.com/YASSER-27"
            target="_blank"
            rel="noopener noreferrer"
            className="header-author-pill"
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>Yasser-27</span>
          </a>

          <div className="background-theme-switch" role="group" aria-label="Background theme">
            <button
              type="button"
              className={`background-theme-option ${backgroundTheme === "blur" ? "active" : ""}`}
              aria-pressed={backgroundTheme === "blur"}
              onClick={() => setBackgroundTheme("blur")}
              title="Blurred video background (motion on)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h16M6 7h12M6 17h12" />
                <circle cx="8" cy="12" r="2" />
              </svg>
              <span>Blur</span>
            </button>
            <button
              type="button"
              className={`background-theme-option ${backgroundTheme === "dark" ? "active" : ""}`}
              aria-pressed={backgroundTheme === "dark"}
              onClick={() => setBackgroundTheme("dark")}
              title="Dark theme with dark.mp4 background"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.2 15.3A8.8 8.8 0 0 1 8.7 3.8 8.9 8.9 0 1 0 20.2 15.3Z" />
              </svg>
              <span>Dark</span>
            </button>
          </div>

          <div className="window-controls">
            <button
              type="button"
              className="window-control"
              onClick={handleMinimize}
              title="Minimize"
              aria-label="Minimize"
            >
              <svg viewBox="0 0 12 12"><path d="M2 6h8" /></svg>
            </button>
            <button
              type="button"
              className="window-control"
              onClick={handleMaximize}
              title="Maximize"
              aria-label="Maximize"
            >
              <svg viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" rx="1" /></svg>
            </button>
            <button
              type="button"
              className="window-control close"
              onClick={handleClose}
              title="Close"
              aria-label="Close"
            >
              <svg viewBox="0 0 12 12"><path d="m3 3 6 6M9 3 3 9" /></svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Scrollable View */}
      <main className="main-scroll-view" onClick={() => setOpenDropdownId(null)}>
        {/* VIEW 1: CURSORS 3D GALLERY (ALL SETS & SAVED) */}
        {activeTab === "cursors" && (
          <section className="gallery-section">
            <div className="gallery-tabs-header">
              <div className="gallery-mode-switch">
                <button
                  type="button"
                  className={`gallery-mode-pill ${galleryTab === "all" ? "active" : ""}`}
                  onClick={() => setGalleryTab("all")}
                >
                  <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>
                  <span>All Sets</span>
                  <span className="count-chip">{CURSORS_COLLECTION.length}</span>
                </button>
                <button
                  type="button"
                  className={`gallery-mode-pill ${galleryTab === "saved" ? "active" : ""}`}
                  onClick={() => setGalleryTab("saved")}
                >
                  <svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  <span>Saved</span>
                  <span className="count-chip">{savedCursors.length}</span>
                </button>
              </div>
            </div>

            {/* Empty state for Saved */}
            {galleryTab === "saved" && savedCursors.length === 0 && (
              <div className="saved-empty-card">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <h3>No Saved Cursors Yet</h3>
                <p>Design your custom cursor in <b>draw</b> or <b>Animated</b> and click <b>Save It</b> to add it to your personal library.</p>
                <button type="button" className="btn pri sm" onClick={() => setActiveTab("draw")}>
                  Open Draw Studio
                </button>
              </div>
            )}

            {/* 3D Grid (BORDERLESS) */}
            <div className="grid-3d-5x3">
              {galleryItems.map((c) => {
                return (
                  <div
                    key={c.id}
                    className="cursor-card-3d"
                    role="button"
                    tabIndex={0}
                    aria-haspopup="dialog"
                    aria-label={`Open ${c.title} cursor details`}
                    onClick={() => openCursorBanner(c)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openCursorBanner(c);
                      }
                    }}
                    onPointerEnter={() => setHoveredCursorId(c.id)}
                    onPointerLeave={() => setHoveredCursorId(null)}
                  >
                    <div className="card-header-meta">
                      <span className="card-cat-badge">{c.category || "Custom"}</span>
                      <span className={`card-type-badge ${c.is_animated ? "ani" : ""}`}>
                        {c.is_animated ? "ANI" : "CUR"}
                      </span>
                    </div>

                    <div className="cursor-preview-stage dual-grid-preview">
                      <div className="preview-slot-box">
                        <div className="pedestal-ring" />
                        <CursorFramePlayer
                          frames={c.frames}
                          fallback={hoveredCursorId === c.id ? c.gif || c.png : c.png || c.gif}
                          isPlaying={hoveredCursorId === c.id}
                          interval={c.dur || 150}
                          alt={`${c.title} Arrow`}
                          className="cursor-gif"
                        />
                        <span className="preview-slot-label">Arrow</span>
                      </div>
                      {(c.pointer_png || (c.pointer_frames && c.pointer_frames.length > 0)) && (
                        <div className="preview-slot-box">
                          <div className="pedestal-ring" />
                          <CursorFramePlayer
                            frames={c.pointer_frames}
                            fallback={hoveredCursorId === c.id ? c.pointer_gif || c.gif || c.pointer_png || c.png : c.pointer_png || c.png || c.pointer_gif || c.gif}
                            isPlaying={hoveredCursorId === c.id}
                            interval={c.dur || 150}
                            alt={`${c.title} Pointer`}
                            className="cursor-gif"
                          />
                          <span className="preview-slot-label">Pointer</span>
                        </div>
                      )}
                    </div>

                    <div className="cursor-card-info">
                      <h3 className="cursor-card-title" title={c.title}>{c.title}</h3>
                      <p className="cursor-card-desc">{c.description || "Custom cursor design"}</p>
                    </div>

                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* VIEW 2: ERGONOMIC STUDIO (DRAW / ANIMATED / GENERATE) */}
        <section
          className="studio-section"
          data-studio-tab={activeTab}
          style={{ display: activeTab === "cursors" ? "none" : "flex" }}
        >
          <div className="studio-grid">
            {/* Left actions and canvas stage */}
            <div className="col stage-col">
              <div className="canvas-stage-flex">
                <div className="canvas-actions-stack">
                <aside className="canvas-vertical-toolbar" aria-label="Import and export actions">
                  <div className="toolbar-action-group">
                    <span className="vert-toolbar-label">Import</span>
                    <div className="toolbar-action-buttons">
                      <label className="btn-vert-action btn-import-frame" aria-label="Import PNG" title="Import PNG">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <input type="file" id="import-png-input" accept="image/png,image/gif,image/webp,image/jpeg" aria-label="Import PNG" style={{ display: "none" }} />
                      </label>
                      <label className="btn-vert-action btn-import-cursor" aria-label="Import .ANI, .CUR, or .ICO" title="Import .ANI, .CUR, or .ICO">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8-4-4m0 0L8 8m4-4v12"/></svg>
                        <input type="file" id="import-cursor-input" accept=".ani,.cur,.ico" aria-label="Import .ANI, .CUR, or .ICO" style={{ display: "none" }} />
                      </label>
                    </div>
                  </div>
                  <div className="toolbar-action-group">
                    <span className="vert-toolbar-label">Media</span>
                    <div className="toolbar-action-buttons">
                      <button
                        type="button"
                        className="btn-vert-action btn-vert-media"
                        onClick={() => mediaFileInputRef.current?.click()}
                        aria-label="Add media"
                        title="Add media"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                      </button>
                      {cutMedia && (
                    <button
                      type="button"
                      className="btn-vert-action"
                      onClick={() => setShowModernCutModal(true)}
                      aria-label="Open Modern Cut Trimmer"
                      title="Open Modern Cut Trimmer"
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 5h18v14H3z" />
                        <path d="m3 15 5-5 4 4 3-3 6 6" />
                      </svg>
                    </button>
                  )}
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={mediaFileInputRef}
                    accept="video/*,image/*"
                    onChange={handleMediaFileSelect}
                    style={{ display: "none" }}
                  />
                  <div className="toolbar-action-group">
                    <span className="vert-toolbar-label">Export</span>
                    <div className="toolbar-action-buttons">
                      <button type="button" className="btn-vert-action pri" id="xzip" aria-label="Download both cursor grids as a ZIP" title="Download both cursor grids as a ZIP">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </button>
                      <button type="button" className="btn-vert-action" id="xpng" aria-label="Export PNG" title="Export PNG">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 3v12m-5-5 5 5 5-5" />
                          <path d="M5 18v3h14v-3" />
                        </svg>
                      </button>
                      <button type="button" className="btn-vert-action btn-save-vert" id="btn-save-it" aria-label="Save cursor" title="Save cursor">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      </button>
                    </div>
                  </div>
                </aside>

                <div className="p generate-prompt-box design-ai-panel" id="describe-box">
                  <div className="p-header-row">
                    <h2>Describe a cursor</h2>
                  </div>
                  <label htmlFor="prompt">Describe your design</label>
                  <textarea id="prompt" defaultValue="Purple crystal with a green energy core and purple flames drifting off the back" />
                  <div className="generate-btns-row">
                    <button type="button" className="btn pri sm" id="gen">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
                        <path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" />
                      </svg>
                      <span>Generate</span>
                    </button>
                    <button
                      type="button"
                      className="btn sm"
                      id="btn-send-to-anim"
                      title="Send generated frames to Animated Studio for refinement"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h13M13 6l6 6-6 6" />
                      </svg>
                      <span>Send to animated</span>
                    </button>
                  </div>
                  <div id="st"></div>
                </div>
                </div>

                <div className="canvas-with-toolbar">
                  {/* Main Canvas Editor */}
                  <div className="p canvas-editor-box">
                <div className="p-header-row">
                  <div className="row">
                      <span className="canvas-size-label">Size</span>
                    <button type="button" className="btn sm" data-size="32">32</button>
                    <button type="button" className="btn sm on" data-size="48">48</button>
                    <button type="button" className="btn sm" data-size="64">64</button>
                  </div>
                  <div className="row">
                    <button
                      type="button"
                      className="btn sm"
                      id="btn-toggle-play"
                      title="Play/Pause live 3-frame animation loop on canvas"
                    >
                      <svg viewBox="0 0 24 24" width="13" height="13" style={{ marginRight: 4 }}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      <span id="btn-toggle-play-text">Play Loop</span>
                    </button>
                  </div>
                </div>

                <div className="canvas-stage-wrap">
                  {["draw", "animated", "generate"].map((tab) => (
                    <canvas
                      key={tab}
                      id={`ed-${tab}`}
                      className="studio-editor-canvas"
                      data-editor-tab={tab}
                      width="512"
                      height="512"
                    />
                  ))}
                </div>

                {/* Frames Strip + Import Options + Live Animation Loop Preview */}
                <div id="thW">
                  <div className="frames-strip-header">
                    <span className="frames-title">Frames &amp; Live Loop</span>
                  </div>
                  <div className="frames-flex-row">
                    <div id="th" />
                    <div id="live-anim-box" className="live-anim-box" title="Real-time 3-frame animated loop">
                      <canvas id="live-anim-cv" width="64" height="64" />
                    </div>
                  </div>
                </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Context Views (Draw / Animated / Generate) */}
            <div className="col control-col">
              {/* Generate View: Design & Styling on Right, Settings SVG icon at top */}
              <section className="view" id="v-generate">
                <div className="p generate-controls-panel">
                  <div className="p-header-row">
                    <h2>Design and styling</h2>
                    <button
                      type="button"
                      className="btn-icon-svg"
                      onClick={() => setShowSettingsModal(true)}
                      title="API and model settings"
                      aria-label="API and model settings"
                    >
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                    </button>
                  </div>

                  <div className="generate-controls-layout">
                    <div className="generate-controls-column preset-style-column">
                      <div className="p-header-row preset-style-header">
                        <h2>Presets</h2>
                        <button
                          type="button"
                          className="btn-icon-svg"
                          onClick={() => setShowSettingsModal(true)}
                          title="API and model settings"
                          aria-label="API and model settings"
                        >
                          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                        </button>
                      </div>
                      <div className="row" id="presets" />
                      <label>Style</label>
                      <div className="style-buttons-grid">
                        <button type="button" className="btn sm" data-style="smooth">Smooth</button>
                        <button type="button" className="btn sm" data-style="pixel">Pixel</button>
                        <button type="button" className="btn sm" data-style="neon">Neon</button>
                        <button type="button" className="btn sm" data-style="metallic">Metallic</button>
                        <button type="button" className="btn sm" data-style="outline">Outline</button>
                        <button type="button" className="btn sm" data-style="retro">Retro</button>
                        <button type="button" className="btn sm" data-style="cyberpunk">Cyberpunk</button>
                        <button type="button" className="btn sm" data-style="tv">TV static</button>
                        <button type="button" className="btn sm" data-style="lego">Lego</button>
                        <button type="button" className="btn sm" data-style="disco">Disco</button>
                        <button type="button" className="btn sm" data-style="mirror">Mirror sphere</button>
                        <button type="button" className="btn sm" data-style="cross">Cross</button>
                        <button type="button" className="btn sm" data-style="crosshatch">Crosshatch</button>
                        <button type="button" className="btn sm" data-style="mixed">Mixed</button>
                        <button type="button" className="btn sm" data-style="glyph">Multi-glyph art</button>
                        <button type="button" className="btn sm" data-style="aurora">Aurora</button>
                        <button type="button" className="btn sm" data-style="hologram">Hologram</button>
                        <button type="button" className="btn sm" data-style="glass">Glass</button>
                        <button type="button" className="btn sm" data-style="prism">Prism</button>
                      </div>
                    </div>
                    <div className="generate-controls-column color-shape-column">
                      <section className="generate-color-panel">
                        <h2>Colors</h2>
                        <div className="row" id="cols" />
                        <div className="test-pad-panel horizontal-test-pad">
                          <div className="p-header-row">
                            <h2>Test pad</h2>
                          </div>
                          <div id="test" className="cursor-test-pad">
                            Test arrow
                            <div className="lnk">Test hand</div>
                            <canvas id="fk" className="cursor-test-preview" />
                          </div>
                        </div>
                            <section className="generate-shape-panel">
                              <h2>Shape and glow</h2>
                              <label>Pointer shape</label>
                              <div className="shape-buttons-grid" id="shapeC" />
                              <div className="knobs">
                                <div id="kOw" data-linear="true" />
                                <div id="kGa" data-linear="true" />
                              </div>
                              <div className="shape-effect-actions">
                                <button type="button" className="btn sm" id="btn-remove-glow">Remove glow</button>
                                <button type="button" className="btn sm" id="btn-remove-outline">Remove outline</button>
                              </div>
                              <label>Detail layers</label>
                              <div className="row" id="partsC" />
                              <label className="sw2">
                                <input type="checkbox" className="sw" id="link" />Apply to arrow and hand
                              </label>
                            </section>
                          </section>
                    </div>
                  </div>
                </div>

                {/* AI Generations History Grid in Generate Tab */}
                <div className="p ai-history-section">
                  <div className="p-header-row">
                    <h2>Saved cursors</h2>
                    <div className="history-page-controls">
                      <span className="live-indicator">{aiHistory.length} Saved</span>
                      {aiHistory.length > aiHistoryPageSize && (
                        <>
                          <button
                            type="button"
                            className="btn sm"
                            onClick={() => setAiHistoryPage(Math.max(0, currentAiHistoryPage - 1))}
                            disabled={currentAiHistoryPage === 0}
                            aria-label="Previous generated cursors"
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            className="btn sm"
                            onClick={() => setAiHistoryPage(Math.min(aiHistoryPageCount - 1, currentAiHistoryPage + 1))}
                            disabled={currentAiHistoryPage >= aiHistoryPageCount - 1}
                            aria-label="Next generated cursors"
                          >
                            ›
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {aiHistory.length === 0 ? (
                    <div className="hint" style={{ textAlign: "center", padding: "14px 0" }}>
                      No saved cursors yet. Describe a design above and select Generate.
                    </div>
                  ) : (
                    <div className="ai-history-grid">
                      {aiHistory.slice(
                        currentAiHistoryPage * aiHistoryPageSize,
                        (currentAiHistoryPage + 1) * aiHistoryPageSize
                      ).map((item) => (
                        <div key={item.id} className="ai-history-card">
                          <div className="ai-history-thumb-wrap">
                            <img src={item.thumb} alt={item.title} />
                          </div>
                          <div className="ai-history-meta">
                            <span className="ai-history-title" title={item.title}>{item.title}</span>
                          </div>
                          <div className="ai-history-actions">
                            <button
                              type="button"
                              className="btn sm"
                              onClick={() => loadAiGen(item)}
                              title="Load into Generate canvas"
                            >
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M12 16V4m-5 5 5-5 5 5" />
                                <path d="M5 14v5h14v-5" />
                              </svg>
                              Load
                            </button>
                            <button
                              type="button"
                              className="btn sm pri"
                              onClick={() => sendAiGenToAnimated(item)}
                              title="Send frames to Animated Studio"
                            >
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12h13M13 6l6 6-6 6" />
                              </svg>
                              Send
                            </button>
                            <button
                              type="button"
                              className="btn sm btn-delete-ai"
                              onClick={() => deleteAiGen(item.id)}
                              title="Delete from history"
                            >
                              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Draw View */}
              <section className="view" id="v-draw">
                <div className="p">
                  <div className="p-header-row">
                    <h2>Drawing Tools</h2>
                    <div className="row">
                      <button type="button" className="btn sm" id="undo" data-drawing-action="undo">Undo</button>
                      <button type="button" className="btn sm" id="redo" data-drawing-action="redo">Redo</button>
                    </div>
                  </div>

                  <div className="row">
                    <button type="button" className="btn on" data-tool="pen">Pen<kbd>B</kbd></button>
                    <button type="button" className="btn" data-tool="erase">Eraser<kbd>E</kbd></button>
                    <button type="button" className="btn" data-tool="fill">Fill<kbd>G</kbd></button>
                    <button type="button" className="btn" data-tool="pick">Picker<kbd>I</kbd></button>
                    <button type="button" className="btn" data-tool="hot">Hotspot<kbd>H</kbd></button>
                  </div>

                  <div className="sws" />

                  <div className="row" style={{ marginTop: 14 }}>
                    <span style={{ color: "var(--mu)", fontSize: 13 }}>Brush Size</span>
                    <button type="button" className="btn sm" id="bm" data-brush-delta="-1">-</button>
                    <b id="bv" data-brush-value="true" style={{ minWidth: 18, textAlign: "center" }}>1</b>
                    <button type="button" className="btn sm" id="bp" data-brush-delta="1">+</button>
                  </div>
                  <div className="draw-gradient-tools">
                    <label>Color Gradient</label>
                    <div className="draw-gradient-colors">
                      <label className="draw-gradient-color">Start <input type="color" id="draw-grad-start" defaultValue="#00e5ff" /></label>
                      <label className="draw-gradient-color">End <input type="color" id="draw-grad-end" defaultValue="#ff7a18" /></label>
                      <button type="button" className="btn sm pri" id="apply-draw-gradient">Apply to painted pixels</button>
                    </div>
                    <div className="draw-gradient-presets" aria-label="Gradient templates">
                      <button type="button" className="btn sm" data-gradient-start="#00e5ff" data-gradient-end="#7c4dff"><span className="draw-gradient-swatch" style={{ background: "linear-gradient(90deg,#00e5ff,#7c4dff)" }} />Aurora</button>
                      <button type="button" className="btn sm" data-gradient-start="#18e08c" data-gradient-end="#ffe14d"><span className="draw-gradient-swatch" style={{ background: "linear-gradient(90deg,#18e08c,#ffe14d)" }} />Emerald</button>
                      <button type="button" className="btn sm" data-gradient-start="#ff3d71" data-gradient-end="#ffb347"><span className="draw-gradient-swatch" style={{ background: "linear-gradient(90deg,#ff3d71,#ffb347)" }} />Sunset</button>
                      <button type="button" className="btn sm" data-gradient-start="#2f6bff" data-gradient-end="#d34bff"><span className="draw-gradient-swatch" style={{ background: "linear-gradient(90deg,#2f6bff,#d34bff)" }} />Neon</button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Animated View: Motion Effects, Color Palette & Pointer Link */}
              <section className="view" id="v-animated">
                <div className="p">
                  <div className="animated-intro">
                    <h2>Animation Dynamics</h2>
                    <label className="sw2">
                      <input type="checkbox" className="sw" id="animSw" />Animated Cursor (3 frames, exports .ani)
                    </label>
                    <div className="hint">Turn off to export a standard static .cur cursor.</div>
                  </div>
                  <div className="animated-drawing-test-row">
                    <section className="animated-drawing-tools">
                      <div className="animated-utility-heading">
                        <h3>Color Drawing Tool</h3>
                        <div className="row">
                          <button type="button" className="btn sm" data-drawing-action="undo" aria-label="Undo drawing">Undo</button>
                          <button type="button" className="btn sm" data-drawing-action="redo" aria-label="Redo drawing">Redo</button>
                        </div>
                      </div>
                      <div className="animated-tool-buttons">
                        <button type="button" className="btn sm on" data-tool="pen">Pen</button>
                        <button type="button" className="btn sm" data-tool="erase">Erase</button>
                        <button type="button" className="btn sm" data-tool="fill">Fill</button>
                        <button type="button" className="btn sm" data-tool="pick">Picker</button>
                        <button type="button" className="btn sm" data-tool="hot">Hotspot</button>
                      </div>
                      <div className="animated-drawing-controls">
                        <div className="sws animated-swatch-palette" aria-label="Drawing colors" />
                        <div className="animated-brush-size">
                          <span>Brush</span>
                          <button type="button" className="btn sm" data-brush-delta="-1" aria-label="Decrease brush size">-</button>
                          <b data-brush-value="true">1</b>
                          <button type="button" className="btn sm" data-brush-delta="1" aria-label="Increase brush size">+</button>
                        </div>
                      </div>
                    </section>
                    <section className="test-pad-panel animated-test-pad-panel">
                      <div className="animated-utility-heading">
                        <h3>Test pad</h3>
                      </div>
                      <div id="test-ani" className="cursor-test-pad animated-test-pad">
                        Test arrow
                        <div className="lnk">Test hand</div>
                        <canvas className="cursor-test-preview" width="48" height="48" aria-hidden="true" />
                      </div>
                    </section>
                  </div>
                  <div className="animated-settings-grid">
                    <div className="animated-style-column">
                      <label>Style</label>
                      <div className="style-buttons-grid">
                        <button type="button" className="btn sm" data-style="smooth">Smooth</button>
                        <button type="button" className="btn sm" data-style="pixel">Pixel</button>
                        <button type="button" className="btn sm" data-style="neon">Neon</button>
                        <button type="button" className="btn sm" data-style="metallic">Metallic</button>
                        <button type="button" className="btn sm" data-style="outline">Outline</button>
                        <button type="button" className="btn sm" data-style="retro">Retro</button>
                        <button type="button" className="btn sm" data-style="cyberpunk">Cyberpunk</button>
                        <button type="button" className="btn sm" data-style="tv">TV Static</button>
                        <button type="button" className="btn sm" data-style="lego">Lego</button>
                        <button type="button" className="btn sm" data-style="disco">Disco</button>
                        <button type="button" className="btn sm" data-style="mirror">Mirror Sphere</button>
                        <button type="button" className="btn sm" data-style="cross">Cross</button>
                        <button type="button" className="btn sm" data-style="crosshatch">Crosshatch</button>
                        <button type="button" className="btn sm" data-style="mixed">Mixed</button>
                        <button type="button" className="btn sm" data-style="glyph">Multi-Glyph Art</button>
                        <button type="button" className="btn sm" data-style="aurora">Aurora</button>
                        <button type="button" className="btn sm" data-style="hologram">Hologram</button>
                        <button type="button" className="btn sm" data-style="glass">Glass</button>
                        <button type="button" className="btn sm" data-style="prism">Prism</button>
                      </div>
                      <div className="frame-timing-row">
                        <div className="knob-dur-wrap">
                          <div id="kDur" />
                        </div>
                        <div className="live-anim-meta">
                          <span className="live-anim-label">LIVE LOOP</span>
                          <span id="live-anim-rate" className="live-anim-speed">120ms (8 FPS)</span>
                        </div>
                      </div>

                      <label>Color Palette</label>
                      <div className="row" id="cols-ani" />
                      <label className="sw2">
                        <input type="checkbox" className="sw" id="link-ani" />Apply design to cursor and pointer
                      </label>
                    </div>
                    <div className="animated-motion-column">
                      <label>Background Motion Effects (26)</label>
                      <div className="row" id="fxC" />
                      <div className="row">
                        <button type="button" className="btn sm" id="cpPrev">Copy previous frame</button>
                        <button type="button" className="btn sm" id="clr">Clear frame</button>
                      </div>
                      <div className="hint">Play Loop previews all three frames without overwriting your drawing, then returns to the selected frame when stopped. Use Ctrl+C/V to copy drawing, style, effects, and motion between frames.</div>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="app-footer">
          <p>cursors U &bull; Created by <a href="https://github.com/YASSER-27" target="_blank" rel="noopener noreferrer">Yasser-27</a></p>
        </footer>
      </main>

      {/* DOWN BLACK GLASS 3D NAVIGATION BAR */}
      <div className={`bottom-nav-container ${activeTab !== "cursors" ? "with-studio-actions" : ""}`}>
        <div className="window-studio-actions">
          <button
            type="button"
            className="btn sm"
            id="btn-new-project"
            title="Clear canvas and start a fresh project"
          >
            New project
          </button>
          <button
            type="button"
            className="btn sm"
            id="btn-open-templates"
            onClick={() => setShowTemplatesModal(true)}
          >
            Templates
          </button>
          <div id="slots" className="dual-canvas-bar window-slot-switch" aria-label="Cursor selection and download" />
        </div>
        <nav className="nav-black-glass-3d">
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "cursors" ? "active" : ""}`}
            onClick={() => setActiveTab("cursors")}
          >
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /></svg>
            <span>cursors</span>
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "draw" ? "active" : ""}`}
            onClick={() => setActiveTab("draw")}
          >
            <svg viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><circle cx="11" cy="11" r="2" /></svg>
            <span>draw</span>
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "animated" ? "active" : ""}`}
            onClick={() => setActiveTab("animated")}
          >
            <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="4" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /></svg>
            <span>Animated</span>
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === "generate" ? "active" : ""}`}
            onClick={() => setActiveTab("generate")}
          >
            <svg viewBox="0 0 24 24"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" /><circle cx="19" cy="5" r="2" /><circle cx="5" cy="19" r="2" /></svg>
            <span>generate</span>
          </button>
        </nav>
      </div>

      {/* Radial Menu & Subpanels */}
      <div className="rm" id="rm" />
      <div className="pw" id="pw" />
      <div id="toast" className={toastMessage ? "on" : ""}>{toastMessage}</div>

      {selectedCursor && (
        <div
          className="cursor-banner-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeCursorBanner();
          }}
        >
          <section
            ref={cursorBannerRef}
            className="cursor-detail-banner"
            role="dialog"
            aria-modal="true"
            aria-label="Cursor test preview"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key === "Escape") closeCursorBanner();
            }}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={closeCursorBanner}
              aria-label="Close cursor preview"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m18 6-12 12M6 6l12 12" />
              </svg>
            </button>

            <div className="cursor-banner-scene" aria-label="Cursor test area">
              <iframe
                ref={cursorSceneFrameRef}
                title="Cursor test scene"
                src={`${import.meta.env.BASE_URL}cursor-test-scene.html`}
                sandbox="allow-scripts"
                onLoad={() => {
                  if (testingItemRef.current) applyCursorToScene(testingItemRef.current);
                }}
              />
            </div>

            <div className="cursor-banner-actions">
              <button
                type="button"
                className={`btn-card try-it ${testingItem?.id === selectedCursor.id ? "active" : ""}`}
                onClick={() => toggleTry(selectedCursor)}
                title={testingItem?.id === selectedCursor.id ? "Stop testing this cursor" : "Try this cursor in the Explorer window"}
              >
                <svg viewBox="0 0 24 24"><path d="M3 3l7 18 3-7 7-3L3 3z" /></svg>
                <span>{testingItem?.id === selectedCursor.id ? "Stop" : "Try"}</span>
              </button>

              <div className={`download-btn-wrap ${openDropdownId === selectedCursor.id ? "open" : ""}`}>
                <button
                  type="button"
                  className="btn-card download-toggle"
                  aria-expanded={openDropdownId === selectedCursor.id}
                  onClick={() => setOpenDropdownId(openDropdownId === selectedCursor.id ? null : selectedCursor.id)}
                >
                  <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                  <span>Download</span>
                </button>

                <div className="download-dropdown">
                  {selectedCursor.ani && (
                    <a
                      href={selectedCursor.ani}
                      download={galleryTab === "saved" ? `${selectedCursor.title.replace(/\s+/g, "_")}.ani` : undefined}
                    >
                      <span className="label">Animated</span>
                      <span className="ext">.ANI</span>
                    </a>
                  )}
                  {selectedCursor.cur && (
                    <a
                      href={selectedCursor.cur}
                      download={galleryTab === "saved" ? `${selectedCursor.title.replace(/\s+/g, "_")}.cur` : undefined}
                    >
                      <span className="label">Cursor</span>
                      <span className="ext">.CUR</span>
                    </a>
                  )}
                  {galleryTab === "saved" ? (
                    <>
                      <a
                        href={selectedCursor.png || selectedCursor.gif}
                        download={`${selectedCursor.title.replace(/\s+/g, "_")}_preview.png`}
                      >
                        <span className="label">Main Frame</span>
                        <span className="ext">.PNG</span>
                      </a>
                      <button
                        type="button"
                        className="dropdown-item-btn"
                        onClick={() => {
                          setOpenDropdownId(null);
                          handleDownloadSavedZip(selectedCursor);
                        }}
                      >
                        <span className="label">All Frames Pack</span>
                        <span className="ext">.ZIP</span>
                      </button>
                    </>
                  ) : (
                    selectedCursor.pack_zip && (
                      <a href={selectedCursor.pack_zip} download>
                        <span className="label">Full Pack</span>
                        <span className="ext">.ZIP</span>
                      </a>
                    )
                  )}
                </div>
              </div>
            </div>

            {galleryTab === "saved" && (
              <div className="cursor-banner-saved-actions">
                <button
                  type="button"
                  className="btn-card edit-saved"
                  onClick={() => {
                    const item = selectedCursor;
                    closeCursorBanner();
                    handleEditSavedCursor(item);
                  }}
                  title="Open all frames in Studio to edit"
                >
                  Edit in Studio
                </button>
                <button
                  type="button"
                  className="btn-card remove-saved"
                  onClick={() => {
                    const id = selectedCursor.id;
                    closeCursorBanner();
                    deleteSavedCursor(id);
                  }}
                  title="Remove from saved collection"
                  aria-label="Remove from saved collection"
                >
                  <svg viewBox="0 0 24 24" width="15" height="15">
                    <path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5" />
                  </svg>
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* AI & Model Settings Modal */}
      {showSettingsModal && (
        <div className="modal-backdrop" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-glass-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowSettingsModal(false)}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>

            <div className="modal-header">
              <div className="modal-icon-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
              </div>
              <div>
                <h3>Generator &amp; AI Settings</h3>
                <p>Configure model providers, local endpoints, and keys.</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="two">
                <div>
                  <label style={{ marginTop: 0 }}>Provider</label>
                  <select
                    id="prov"
                    value={aiProvider}
                    onChange={(e) => handleProviderSelect(e.target.value)}
                  >
                    <option value="gemini">Gemini (Google)</option>
                    <option value="claude">Claude (Anthropic)</option>
                    <option value="openai">OpenAI / Compatible (ChatGPT, Ollama)</option>
                  </select>
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <label style={{ margin: 0 }}>Model Selection</label>
                    <button
                      type="button"
                      className="btn sm"
                      style={{ fontSize: 11, padding: "2px 8px" }}
                      onClick={() => fetchAvailableModels(aiProvider, aiKey, aiBase)}
                      disabled={isFetchingModels}
                      title="Fetch accessible models list from API"
                    >
                      {isFetchingModels ? "Fetching..." : "Fetch Models"}
                    </button>
                  </div>
                  {availableModels.length > 0 ? (
                    <select
                      value={aiModel}
                      onChange={(e) => {
                        setAiModel(e.target.value);
                        saveAiSettings(aiProvider, aiKey, e.target.value, aiBase);
                      }}
                    >
                      {availableModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id="model"
                      value={aiModel}
                      onChange={(e) => {
                        setAiModel(e.target.value);
                        saveAiSettings(aiProvider, aiKey, e.target.value, aiBase);
                      }}
                      placeholder={aiProvider === "gemini" ? "gemini-2.0-flash" : aiProvider === "claude" ? "claude-3-5-sonnet-20241022" : "gpt-4o-mini"}
                    />
                  )}
                  <div className="hint" style={{ fontSize: 11, marginTop: 4 }}>
                    {availableModels.length > 0 ? "Select a model from the list above." : "Type a model name, or click Fetch Models to discover available ones."}
                  </div>
                </div>
              </div>

              {aiProvider === "openai" && (
                <div id="baseW">
                  <label>Host URL</label>
                  <input
                    id="base"
                    value={aiBase}
                    onChange={(e) => {
                      setAiBase(e.target.value);
                      saveAiSettings(aiProvider, aiKey, aiModel, e.target.value);
                    }}
                    dir="ltr"
                    autoComplete="off"
                    placeholder="https://api.openai.com/v1"
                  />
                </div>
              )}

              <div>
                <label>API Key</label>
                <input
                  id="key"
                  type="password"
                  value={aiKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  dir="ltr"
                  autoComplete="off"
                  placeholder={aiProvider === "gemini" ? "Paste your Gemini API Key (starts with AIzaSy...)" : aiProvider === "claude" ? "Paste your Claude API Key (starts with sk-ant-...)" : "Paste your OpenAI Key (starts with sk-...)"}
                />
                <div className="hint" style={{ color: aiKey ? "var(--cy)" : "var(--mu)", marginTop: 4 }}>
                  {aiKey ? "API Key saved securely in browser storage." : "Enter your API key to generate custom cursor designs."}
                </div>
              </div>

              {testStatus && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    background: testStatus.success ? "rgba(24, 224, 140, 0.15)" : testStatus.loading ? "rgba(0, 212, 255, 0.15)" : "rgba(255, 60, 60, 0.15)",
                    color: testStatus.success ? "#18e08c" : testStatus.loading ? "#00d4ff" : "#ff7070",
                    border: `1px solid ${testStatus.success ? "rgba(24, 224, 140, 0.3)" : testStatus.loading ? "rgba(0, 212, 255, 0.3)" : "rgba(255, 60, 60, 0.3)"}`
                  }}
                >
                  {testStatus.msg}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: 6 }}>
                <button
                  type="button"
                  className="btn sm"
                  style={{ flex: 1 }}
                  onClick={testApiConnection}
                  disabled={isTestingApi}
                >
                  {isTestingApi ? "Testing..." : "Test Connection"}
                </button>
                <button
                  type="button"
                  className="btn pri sm"
                  style={{ flex: 1 }}
                  onClick={() => {
                    saveAiSettings(aiProvider, aiKey, aiModel, aiBase);
                    setShowSettingsModal(false);
                    showToast("AI Settings saved successfully");
                  }}
                >
                  Save &amp; Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Frame Handling Modern Cut Trimmer Modal */}
      {showModernCutModal && cutMedia && (
        <ModernCutModal
          mediaFile={cutMedia.file}
          mediaUrl={cutMedia.url}
          isVideo={cutMedia.isVideo}
          onClose={() => setShowModernCutModal(false)}
          onApplyToast={(msg) => showToast(msg)}
        />
      )}

      {/* Templates Drawer / Modal */}
      {showTemplatesModal && (
        <div className="modal-backdrop" onClick={() => setShowTemplatesModal(false)}>
          <div className="modal-glass-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setShowTemplatesModal(false)}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>

            <div className="modal-header">
              <div className="modal-icon-badge">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" /></svg>
              </div>
              <div>
                <h3>Cursor Starter Templates</h3>
                <p>Pick a classic or pro template to start drawing and customizing immediately.</p>
              </div>
            </div>

            <div className="templates-list-grid">
              {[
                { id: "arrow", name: "Classic Arrow", d: "M4 4l12 12-5 1 4 8-3 2-4-8-4 4z" },
                { id: "hand", name: "Link Hand", d: "M10 2v10h2V6a2 2 0 0 1 4 0v6h1V8a2 2 0 0 1 4 0v8a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6V9a2 2 0 0 1 3-1.7V2z" },
                { id: "crosshair", name: "Crosshair", d: "M12 2v6m0 8v6m-10-8h6m8 0h6m-10 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0" },
                { id: "cyber", name: "Cyber Neon", d: "M2 2l16 8-8 3-3 8z" },
                { id: "sword", name: "Pixel Blade", d: "M19 2l3 3-12 12-3-3zM5 19l-3 3m5-1l-2 2" },
                { id: "diamond", name: "Crystal Diamond", d: "M12 2l8 8-8 12-8-12z" },
                { id: "wand", name: "Magic Wand", d: "M14 4l6 6L6 24 0 18zM19 2l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" },
                { id: "dot", name: "Minimal Dot", d: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  className="template-card-btn"
                  onClick={() => {
                    if (window._loadTemplate) window._loadTemplate(tmpl.id);
                    setShowTemplatesModal(false);
                    showToast(`Loaded ${tmpl.name} Template`);
                  }}
                >
                  <svg viewBox="0 0 24 24"><path d={tmpl.d} /></svg>
                  <span>{tmpl.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ==========================================================================
   STUDIO ENGINE SCRIPT (DRAW, ANIMATED, GENERATE WITH 14 MOTION FX & TEMPLATES)
   ========================================================================== */
function initStudio(initialTab, toast) {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const S = {
    size: 48,
    tab: initialTab || "generate",
    k: "cursor",
    cur: 0,
    tool: "pen",
    color: "#00e5ff",
    brush: 1,
    hov: null,
    link: false,
    dur: 120,
    sel: null,
    selShow: false,
    slots: {},
    playing: false,
    loopStartedAt: null,
    loopStartFrame: 0,
    loopReturnFrame: null,
    loopFrameIdx: 0,
  };

  const PAL = ["#00e5ff", "#2f6bff", "#7c4dff", "#ff7a18", "#ffb347", "#ff3d71", "#ffffff", "#9aa0b8", "#2b2f4a", "#0a0d1f", "#18e08c", "#ffe14d"];
  const PARTS = [["shine", "Shine"], ["facets", "Crystal facets"], ["stripes", "Stripes"], ["core", "Energy core"]];
  const SHAPES = [
    ["arrow", "Classic"],
    ["system-arrow", "System Arrow"],
    ["flame-arrow", "Flame Arrow"],
    ["pointer-hand", "Pointing Hand"],
    ["outline-arrow", "Outline Arrow"],
    ["arrow-slim", "Slim"],
    ["arrow-wide", "Wide"],
    ["arrow-curved", "Curved"],
    ["spear", "Spear"],
    ["blade", "Blade"],
    ["aero", "Aero"],
    ["crystal", "Crystal"],
    ["stealth", "Stealth"],
    ["hand", "Hand"]
  ];
  
  // Background-inspired cursor motion effects
  const FX = [
    ["pulse", "Pulse"],
    ["sparkle", "Sparkles"],
    ["particles", "Particles"],
    ["flame", "Flame"],
    ["shimmer", "Shimmer"],
    ["wobble", "Wobble"],
    ["orbit", "Orbit"],
    ["flow", "Flow"],
    ["electric", "Lightning"],
    ["trail", "Ghost Trail"],
    ["chroma", "Rainbow"],
    ["glitch", "Pixel Glitch"],
    ["vortex", "Vortex"],
    ["float", "Levitate"],
    ["starlight", "Starlight Twinkle"],
    ["meteor", "Meteor Strike"],
    ["warp", "Space Warp"],
    ["ring", "Halo Rings"],
    ["rainbow", "Prism Spectrum"],
    ["breathe", "Deep Breathe"],
    ["aurora", "Aurora Flow"],
    ["nebula", "Nebula Clouds"],
    ["wave", "Prismatic Waves"],
    ["ripple", "Soft Ripples"],
    ["plasma", "Liquid Plasma"],
    ["liquid", "Liquid Ribbons"]
  ];

  const COLS = [["a", "Start"], ["b", "End"], ["outline", "Outline"], ["glow", "Glow"], ["accent", "Accent"]];
  const PRESETS = {
    crystal: ["Crystal", { style: "smooth", a: "#e2b8ff", b: "#7b2cff", outline: "#2a0a5e", glow: "#b25cff", accent: "#b6ff3b", ow: 2.5, glowAmt: 0.9, parts: ["facets", "shine", "core"], fx: ["flame", "pulse", "flow", "electric"] }],
    cartoon: ["Cartoon", { style: "smooth", a: "#c653e6", b: "#7a22c8", outline: "#0d0a6b", glow: "#7a22c8", accent: "#ff9ecb", ow: 4.5, glowAmt: 0.15, parts: ["shine"], fx: ["wobble", "sparkle", "float"] }],
    neon: ["Neon gradient", { style: "smooth", a: "#3aa0ff", b: "#d34bff", outline: "#0a1050", glow: "#3b6bff", accent: "#7fe9ff", ow: 5, glowAmt: 0.8, parts: ["stripes", "shine"], fx: ["pulse", "shimmer", "orbit", "chroma"] }],
    ice: ["Pixel ice", { style: "pixel", a: "#f0faff", b: "#8fd0ff", outline: "#2f7fd0", glow: "#8fd0ff", accent: "#bfeaff", ow: 3.5, glowAmt: 0, parts: ["facets"], fx: ["sparkle", "glitch"] }],
    cyberpunk: ["Cyberpunk", { style: "neon", a: "#00f0ff", b: "#ff0055", outline: "#050518", glow: "#00f0ff", accent: "#ffe600", ow: 3.5, glowAmt: 1.0, parts: ["stripes", "core", "facets"], fx: ["glitch", "electric", "pulse", "trail"] }],
    magma: ["Magma Core", { style: "smooth", a: "#ffcc00", b: "#ff1a00", outline: "#3a0000", glow: "#ff4400", accent: "#ffffff", ow: 3.0, glowAmt: 0.95, parts: ["core", "shine"], fx: ["flame", "pulse", "meteor", "breathe"] }],
    emerald: ["Emerald Shard", { style: "smooth", a: "#50ffaf", b: "#00a86b", outline: "#002a1a", glow: "#00ff88", accent: "#d4ff00", ow: 2.8, glowAmt: 0.85, parts: ["facets", "shine"], fx: ["sparkle", "shimmer", "starlight", "ring"] }],
    obsidian: ["Obsidian Void", { style: "metallic", a: "#2c2d35", b: "#0f1016", outline: "#7000ff", glow: "#9933ff", accent: "#ff0077", ow: 4.0, glowAmt: 0.9, parts: ["core", "facets"], fx: ["vortex", "warp", "orbit"] }],
    synthwave: ["Synthwave 80s", { style: "outline", a: "#ff71ce", b: "#01cdfe", outline: "#050014", glow: "#b967ff", accent: "#fffb96", ow: 3.8, glowAmt: 1.0, parts: ["stripes", "shine"], fx: ["rainbow", "pulse", "flow", "shimmer"] }],
    phantom: ["Phantom Ghost", { style: "smooth", a: "#d8b4fe", b: "#6366f1", outline: "#1e1b4b", glow: "#a855f7", accent: "#38bdf8", ow: 2.5, glowAmt: 0.9, parts: ["shine", "core"], fx: ["float", "trail", "shimmer", "breathe"] }],
    solar: ["Solar Flare", { style: "smooth", a: "#fde047", b: "#ea580c", outline: "#451a03", glow: "#f97316", accent: "#ffffff", ow: 3.2, glowAmt: 1.0, parts: ["core", "shine"], fx: ["flame", "orbit", "starlight", "ring"] }],
    quantum: ["Quantum Matrix", { style: "pixel", a: "#00ffcc", b: "#0066ff", outline: "#001133", glow: "#00ffcc", accent: "#ffffff", ow: 3.0, glowAmt: 0.8, parts: ["facets", "stripes"], fx: ["glitch", "electric", "warp", "particles"] }],
  };
  const PIDS = PARTS.map((x) => x[0]);
  const FIDS = FX.map((x) => x[0]);
  const SLOTS = { cursor: "Windows Cursor (Arrow)", pointer: "Windows Pointer (Hand)" };
  const downloadIconSvg = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 18v3h14v-3"/></svg>';

  const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const rgb2hex = (a) => "#" + a.slice(0, 3).map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const mix = (c1, c2, t) => {
    const a = hex2rgb(c1), b = hex2rgb(c2);
    return rgb2hex(a.map((v, i) => v + (b[i] - v) * t));
  };
  const rng = (s) => () => {
    s |= 0;
    s = s + 0x6d2b79f5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  function blank() {
    const c = document.createElement("canvas");
    c.width = c.height = S.size;
    c.getContext("2d", { willReadFrequently: true });
    return c;
  }

  function shapePath(g, shape, sp) {
    shapePathVector(g, shape, sp);
  }

  const H = 256, SC = (H * 0.72) / 90, OX = H * 0.14, OY = H * 0.12;
  const tipOf = (sp) => (sp.shape === "hand" ? [22.5, 0] : sp.shape === "pointer-hand" ? [34, 1] : [0, 0]);
  const hotOf = (sp) => {
    const t = tipOf(sp);
    return [
      Math.max(0, Math.min(S.size - 1, Math.floor(((OX + t[0] * SC) / H) * S.size))),
      Math.max(0, Math.min(S.size - 1, Math.floor(((OY + t[1] * SC) / H) * S.size))),
    ];
  };

  function star(g, x, y, r, col, pix) {
    g.save();
    if (!pix) {
      g.shadowColor = col;
      g.shadowBlur = r * 1.6;
    }
    g.fillStyle = "#fff";
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 - Math.PI / 2, rr = i % 2 ? r * 0.28 : r;
      g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    g.closePath();
    g.fill();
    g.globalAlpha = 0.5;
    g.fillStyle = col;
    g.beginPath();
    g.arc(x, y, r * 0.35, 0, 6.283);
    g.fill();
    g.restore();
  }

  function drawFlagPattern(g, flag) {
    if (flag === "flag_morocco") {
      g.fillStyle = "#c1272d";
      g.fillRect(0, 0, 75, 90);
      g.strokeStyle = "#006233";
      g.lineWidth = 3;
      g.lineJoin = "round";
      g.beginPath();
      for (let i = 0; i < 5; i++) {
        const point = (i * 2) % 5;
        const angle = -Math.PI / 2 + (point * Math.PI * 2) / 5;
        const x = 26 + Math.cos(angle) * 12;
        const y = 42 + Math.sin(angle) * 12;
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.closePath();
      g.stroke();
    } else if (flag === "flag_france") {
      g.fillStyle = "#0055a4";
      g.fillRect(0, 0, 25, 90);
      g.fillStyle = "#ffffff";
      g.fillRect(25, 0, 25, 90);
      g.fillStyle = "#ef4135";
      g.fillRect(50, 0, 25, 90);
    } else if (flag === "flag_usa") {
      g.fillStyle = "#b22234";
      g.fillRect(0, 0, 75, 90);
      g.fillStyle = "#ffffff";
      for (let stripe = 1; stripe < 13; stripe += 2) {
        g.fillRect(0, (stripe * 90) / 13, 75, 90 / 13);
      }
      g.fillStyle = "#3c3b6e";
      g.fillRect(0, 0, 36, 44);
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 5; col++) {
          star(g, 3.5 + col * 6.5, 3.5 + row * 7, 1.8, "#ffffff", true);
        }
      }
    }
  }

  // Advanced Procedural Renderer with 14 Motion Effects
  function render(sp, t) {
    const hi = document.createElement("canvas");
    hi.width = hi.height = H;
    const g = hi.getContext("2d");
    const pix = sp.style === "pixel", ow = pix ? Math.max(sp.ow, 3.5) : sp.ow, tip = tipOf(sp), fx = new Set(sp.fx), pt = new Set(sp.parts), ph = 2 * Math.PI * t;
    
    // Dynamic motion values
    const pulse = fx.has("pulse") ? 0.55 + 0.45 * Math.sin(ph + 1.2) : 1;
    const rot = fx.has("wobble") ? 0.1 * Math.sin(ph) : 0;
    const floatY = fx.has("float") ? Math.sin(ph) * 10 : 0;
    const breathe = fx.has("breathe") ? 1 + 0.08 * Math.sin(ph) : 1;
    const warpX = fx.has("warp") ? Math.sin(ph * 2) * 5 : 0;
    const R = rng(sp.seed || 7);
    const hand = sp.shape === "hand" || sp.shape === "pointer-hand";

    const P = () => shapePath(g, sp.shape, sp);
    const poly = (...a) => {
      g.beginPath();
      a.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])));
      g.closePath();
      g.fill();
    };
    const U = (x, y) => [OX + x * SC, OY + y * SC];

    g.save();
    // Ghost trail motion effect
    if (fx.has("trail")) {
      g.save();
      g.translate(OX + tip[0] * SC - 8, OY + tip[1] * SC + 8);
      g.scale(SC * 0.96 * breathe, SC * 0.96 * breathe);
      g.globalAlpha = 0.25;
      P();
      g.fillStyle = sp.glow;
      g.fill();
      g.restore();
    }

    g.translate(OX + tip[0] * SC + warpX, OY + tip[1] * SC + floatY);
    g.rotate(rot);
    g.translate(-tip[0] * SC, -tip[1] * SC);
    g.scale(SC * breathe, SC * breathe);

    // Chroma Rainbow or Prism hue rotation
    let mainA = sp.a, mainB = sp.b, glowCol = sp.glow;
    if (fx.has("chroma") || fx.has("rainbow")) {
      const hueShift = Math.floor(t * 360);
      g.filter = `hue-rotate(${hueShift}deg)`;
    }

    // Glow
    g.lineJoin = "round";
    g.lineCap = "round";
    if (!pix && sp.glowAmt > 0) {
      g.save();
      g.shadowColor = glowCol;
      const glowMult = sp.style === "neon" ? 1.7 : 1.0;
      g.shadowBlur = H * 0.16 * sp.glowAmt * pulse * glowMult;
      const strokePasses = sp.style === "neon" ? 3 : 2;
      for (let i = 0; i < strokePasses; i++) {
        P();
        g.lineWidth = ow * 2 + 1;
        g.strokeStyle = sp.style === "neon" ? sp.accent : sp.outline;
        g.stroke();
      }
      g.restore();
    }

    // Outline & Fill
    P();
    g.lineWidth = ow * 2;
    g.strokeStyle = sp.outline;
    g.stroke();

    const gr = g.createLinearGradient(0, 0, 62, 90);
    if (sp.style === "metallic") {
      gr.addColorStop(0, mainA);
      gr.addColorStop(0.32, "#ffffff");
      gr.addColorStop(0.5, mix(mainA, mainB, 0.5));
      gr.addColorStop(0.75, "#ffffff");
      gr.addColorStop(1, mainB);
    } else {
      gr.addColorStop(0, mainA);
      gr.addColorStop(0.5, mix(mainA, mainB, 0.5));
      gr.addColorStop(1, mainB);
    }
    P();
    g.fillStyle = sp.style === "outline" ? "rgba(10, 6, 20, 0.35)" : gr;
    g.fill();

    // Extended style overlays (applied after base fill via clip)
    if (sp.style === "retro") {
      g.save(); P(); g.clip();
      for (let ri = 0; ri < 90; ri += 4) {
        g.fillStyle = "rgba(0,0,0,0.18)";
        g.fillRect(-10, ri, 100, 2);
      }
      g.globalAlpha = 0.55;
      const retGr = g.createLinearGradient(0, 0, 60, 0);
      retGr.addColorStop(0, "rgba(255,160,30,0.4)");
      retGr.addColorStop(0.5, "rgba(255,80,80,0.1)");
      retGr.addColorStop(1, "rgba(255,160,30,0.4)");
      g.fillStyle = retGr;
      P(); g.fill();
      g.globalAlpha = 1; g.restore();
    } else if (sp.style === "cyberpunk") {
      g.save(); P(); g.clip();
      g.strokeStyle = sp.accent || "#ff003c";
      g.lineWidth = 1; g.globalAlpha = 0.65;
      for (let ci = 0; ci < 90; ci += 10) { g.beginPath(); g.moveTo(-10, ci); g.lineTo(80, ci); g.stroke(); }
      for (let ci = 0; ci < 80; ci += 10) { g.beginPath(); g.moveTo(ci, -10); g.lineTo(ci, 100); g.stroke(); }
      g.globalAlpha = 1; g.restore();
      P(); g.lineWidth = ow * 2 + 2; g.strokeStyle = sp.accent || "#ff003c";
      g.shadowColor = sp.accent || "#ff003c"; g.shadowBlur = H * 0.12; g.stroke(); g.shadowBlur = 0;
    } else if (sp.style === "tv") {
      g.save(); P(); g.clip();
      const rng2 = (seed) => { let x = Math.sin(seed++) * 10000; return x - Math.floor(x); };
      for (let si = 0; si < 500; si++) {
        const rx = rng2(si * 7 + 1 + Math.floor(t * 30)) * 75;
        const ry = rng2(si * 13 + 3 + Math.floor(t * 30)) * 90;
        const rg = (rng2(si * 11 + 5) * 255) | 0;
        g.fillStyle = `rgba(${rg},${rg},${rg},0.28)`;
        g.fillRect(rx, ry, 2, 2);
      }
      g.restore();
    } else if (sp.style === "lego") {
      g.save(); P(); g.clip();
      for (let lx = 2; lx < 75; lx += 10) {
        for (let ly = 2; ly < 90; ly += 10) {
          g.beginPath(); g.arc(lx + 4, ly + 4, 3.5, 0, Math.PI * 2);
          g.fillStyle = mix(mainA, "#ffffff", 0.4); g.fill();
          g.strokeStyle = "rgba(0,0,0,0.3)"; g.lineWidth = 0.8; g.stroke();
        }
      }
      g.restore();
    } else if (sp.style === "disco") {
      g.save(); P(); g.clip();
      const hueD = ((t * 180) | 0) % 360;
      for (let di = 0; di < 8; di++) {
        g.fillStyle = `hsla(${(hueD + di * 45) % 360}, 100%, 65%, 0.38)`;
        g.beginPath();
        g.moveTo(di * 10 - 5, 0); g.lineTo(di * 10 + 5, 0);
        g.lineTo(di * 10 + 15, 90); g.lineTo(di * 10 + 5, 90);
        g.closePath(); g.fill();
      }
      g.restore();
    } else if (sp.style === "mirror") {
      g.save(); P(); g.clip();
      const mirGr = g.createRadialGradient(20, 20, 2, 32, 46, 52);
      mirGr.addColorStop(0, "#ffffff");
      mirGr.addColorStop(0.28, mix(mainA, "#ffffff", 0.6));
      mirGr.addColorStop(0.65, mainA);
      mirGr.addColorStop(1, mix(mainA, "#000000", 0.45));
      g.fillStyle = mirGr; P(); g.fill();
      const refGr2 = g.createLinearGradient(0, 0, 50, 50);
      refGr2.addColorStop(0, "rgba(255,255,255,0.52)");
      refGr2.addColorStop(0.5, "rgba(255,255,255,0.0)");
      g.fillStyle = refGr2; P(); g.fill();
      g.restore();
    } else if (sp.style === "crosshatch") {
      g.save(); P(); g.clip();
      g.strokeStyle = mainA; g.lineWidth = 1.1; g.globalAlpha = 0.6;
      for (let ch = -20; ch < 100; ch += 7) { g.beginPath(); g.moveTo(ch, -10); g.lineTo(ch + 30, 100); g.stroke(); }
      for (let ch = -20; ch < 100; ch += 7) { g.beginPath(); g.moveTo(ch, 100); g.lineTo(ch + 30, -10); g.stroke(); }
      g.globalAlpha = 1; g.restore();
    } else if (sp.style === "cross") {
      g.save(); P(); g.clip();
      g.strokeStyle = mix(mainA, "#ffffff", 0.72);
      g.lineWidth = 2.2;
      for (let x = 14; x < 70; x += 20) {
        for (let y = 16; y < 88; y += 22) {
          g.beginPath();
          g.moveTo(x - 4, y);
          g.lineTo(x + 4, y);
          g.moveTo(x, y - 4);
          g.lineTo(x, y + 4);
          g.stroke();
        }
      }
      g.restore();
    } else if (sp.style === "mixed") {
      g.save(); P(); g.clip();
      const mixedGradient = g.createLinearGradient(0, 0, 70, 90);
      mixedGradient.addColorStop(0, `${mainA}cc`);
      mixedGradient.addColorStop(0.5, `${glowCol}88`);
      mixedGradient.addColorStop(1, `${mainB}cc`);
      g.fillStyle = mixedGradient;
      P(); g.fill();
      g.globalAlpha = 0.62;
      g.strokeStyle = mix(sp.accent, "#ffffff", 0.4);
      g.lineWidth = 1.6;
      for (let x = -20; x < 90; x += 14) {
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x + 30, 90);
        g.stroke();
      }
      for (let y = 14; y < 90; y += 22) {
        g.fillStyle = `hsla(${(y * 4 + t * 80) % 360}, 90%, 65%, 0.42)`;
        g.fillRect(0, y, 75, 4);
      }
      g.globalAlpha = 1;
      g.restore();
    } else if (sp.style === "glyph") {
      g.save(); P(); g.clip();
      g.font = "9px monospace"; g.globalAlpha = 0.72;
      const glyphs = ["*", "+", "X", "O", "#", "@", "$", "=", "~", "&"];
      const seed2 = sp.seed || 7;
      for (let gx = 2; gx < 75; gx += 11) {
        for (let gy = 10; gy < 95; gy += 11) {
          const gc = glyphs[(gx * 7 + gy * 3 + seed2) % glyphs.length];
          const h2 = (gx * 17 + gy * 11 + seed2 * 37) % 360;
          g.fillStyle = `hsl(${h2}, 90%, 65%)`;
          g.fillText(gc, gx, gy);
        }
      }
      g.globalAlpha = 1; g.restore();
    } else if (sp.style === "aurora") {
      g.save(); P(); g.clip();
      const aurora = g.createLinearGradient(0, 0, 58, 90);
      aurora.addColorStop(0, `${mainA}e8`);
      aurora.addColorStop(0.45, `${sp.glow}c8`);
      aurora.addColorStop(1, `${mainB}e8`);
      g.fillStyle = aurora; P(); g.fill();
      g.globalCompositeOperation = "screen";
      for (let band = 0; band < 4; band++) {
        g.strokeStyle = band % 2 ? sp.accent : sp.glow;
        g.globalAlpha = 0.62;
        g.lineWidth = 2.5;
        g.beginPath();
        g.moveTo(-8, 14 + band * 18);
        g.bezierCurveTo(22, 2 + band * 18, 38, 28 + band * 18, 82, 12 + band * 18);
        g.stroke();
      }
      g.globalAlpha = 1; g.restore();
    } else if (sp.style === "hologram") {
      g.save(); P(); g.clip();
      g.globalCompositeOperation = "screen";
      for (let band = 0; band < 5; band++) {
        const hue = (t * 150 + band * 68) % 360;
        g.fillStyle = `hsla(${hue}, 95%, 66%, 0.28)`;
        g.fillRect(-8, band * 20 + Math.sin(t * 3 + band) * 4, 90, 11);
      }
      g.fillStyle = "rgba(255,255,255,0.2)";
      for (let y = 2; y < 96; y += 5) g.fillRect(0, y, 80, 1);
      g.globalAlpha = 1; g.restore();
    } else if (sp.style === "glass") {
      g.save(); P(); g.clip();
      const glass = g.createLinearGradient(0, 0, 70, 90);
      glass.addColorStop(0, "rgba(255,255,255,0.72)");
      glass.addColorStop(0.22, `${mainA}90`);
      glass.addColorStop(0.58, `${mainB}72`);
      glass.addColorStop(1, "rgba(255,255,255,0.12)");
      g.fillStyle = glass; P(); g.fill();
      g.fillStyle = "rgba(255,255,255,0.52)";
      g.beginPath();
      g.ellipse(17, 18, 8, 16, -0.5, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 0.58;
      g.strokeStyle = "#ffffff";
      g.lineWidth = 1.4;
      P(); g.stroke();
      g.globalAlpha = 1; g.restore();
    } else if (sp.style === "prism") {
      g.save(); P(); g.clip();
      const prism = g.createLinearGradient(0, 0, 70, 90);
      for (let stop = 0; stop <= 6; stop++) {
        prism.addColorStop(stop / 6, `hsl(${(t * 110 + stop * 58) % 360}, 96%, ${stop % 2 ? 56 : 68}%)`);
      }
      g.globalAlpha = 0.72;
      g.fillStyle = prism; P(); g.fill();
      g.globalAlpha = 0.65;
      g.strokeStyle = "rgba(255,255,255,0.82)";
      g.lineWidth = 1;
      for (let line = -40; line < 100; line += 9) {
        g.beginPath(); g.moveTo(line, 0); g.lineTo(line + 38, 100); g.stroke();
      }
      g.globalAlpha = 1; g.restore();
    }

    // Clipped Details
    g.save();
    P();
    g.clip();
    if (pt.has("facets")) {
      if (hand) {
        for (let k = 0; k < 6; k++) {
          g.fillStyle = k % 2 ? "rgba(255,255,255,.22)" : "rgba(0,0,0,.08)";
          poly([k * 24 - 30, 0], [k * 24 - 10, 0], [k * 24 + 50, 100], [k * 24 + 30, 100]);
        }
      } else {
        g.fillStyle = "rgba(255,255,255,.3)";
        poly([0, 0], [0, 76], [30, 44]);
        g.fillStyle = "rgba(255,255,255,.16)";
        poly([0, 0], [58, 54], [30, 44]);
        g.fillStyle = "rgba(0,0,0,.18)";
        poly([0, 76], [18, 60], [30, 44]);
        poly([58, 54], [33, 54], [30, 44]);
        g.fillStyle = "rgba(0,0,0,.24)";
        poly([31, 90], [46, 83], [36, 60]);
      }
    }
    if (pt.has("stripes")) {
      g.strokeStyle = sp.outline;
      g.globalAlpha = 0.55;
      g.lineWidth = 5;
      (hand
        ? [[[14, 66], [64, 66]], [[14, 78], [64, 78]]]
        : [[[16, 42], [48, 53]], [[13, 55], [36, 62]], [[26, 32], [52, 48]]]
      ).forEach((l) => {
        g.beginPath();
        g.moveTo(...l[0]);
        g.lineTo(...l[1]);
        g.stroke();
      });
      g.globalAlpha = 1;
    }
    if (pt.has("core")) {
      g.shadowColor = sp.accent;
      g.shadowBlur = H * 0.05;
      g.lineCap = "round";
      for (const [w, col, al] of [[4.2, sp.accent, 1], [1.4, "#ffffff", 0.85]]) {
        g.globalAlpha = al;
        g.beginPath();
        if (hand) {
          g.moveTo(22.5, 6);
          g.lineTo(22.5, 46);
          g.quadraticCurveTo(22.5, 70, 42, 80);
        } else {
          g.moveTo(5, 8);
          g.quadraticCurveTo(22, 32, 38, 80);
        }
        g.lineWidth = w;
        g.strokeStyle = col;
        if (fx.has("flow")) {
          g.setLineDash([14, 10]);
          g.lineDashOffset = -t * 24;
        }
        g.stroke();
        g.setLineDash([]);
      }
      g.globalAlpha = 1;
      g.shadowBlur = 0;
    }
    if (fx.has("shimmer")) {
      g.save();
      g.translate(30, 45);
      g.rotate(0.6);
      const u = (t + 0.4) % 1, x = -55 + 110 * u, sh = g.createLinearGradient(x, 0, x + 26, 0);
      sh.addColorStop(0, "rgba(255,255,255,0)");
      sh.addColorStop(0.5, "rgba(255,255,255,.7)");
      sh.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = sh;
      g.fillRect(x, -120, 26, 240);
      g.restore();
    }
    g.restore();

    if (pt.has("shine")) {
      g.fillStyle = "rgba(255,255,255,.88)";
      const d = hand ? [[20, 12], [20, 19]] : [[11, 14], [17, 19]];
      g.beginPath();
      g.arc(d[0][0], d[0][1], 2.6, 0, 6.283);
      g.fill();
      g.beginPath();
      g.arc(d[1][0], d[1][1], 1.4, 0, 6.283);
      g.fill();
    }

    // Render Custom Themed Emblems & Motifs
    if (sp.emblem) {
      const emb = String(sp.emblem).toLowerCase();
      g.save();
      if (emb === "flag_morocco" || emb === "flag_france" || emb === "flag_usa") {
        g.save();
        P();
        g.clip();
        drawFlagPattern(g, emb);
        g.restore();
      } else if (emb.includes("sharingan") || emb.includes("naruto") || emb.includes("anime")) {
        const ecx = 22, ecy = 44, er = 13;
        // Outer iris ring
        g.beginPath();
        g.arc(ecx, ecy, er, 0, Math.PI * 2);
        g.fillStyle = "#ff1744";
        g.shadowColor = "#ff1744";
        g.shadowBlur = 12 * pulse;
        g.fill();
        g.lineWidth = 1.8;
        g.strokeStyle = "#1a0005";
        g.stroke();
        // Inner pupil
        g.beginPath();
        g.arc(ecx, ecy, 3.2, 0, Math.PI * 2);
        g.fillStyle = "#0a0002";
        g.fill();
        // 3 Tomoe spinning
        const tomoeAngle = ph * 1.5;
        for (let k = 0; k < 3; k++) {
          const ang = tomoeAngle + (k * Math.PI * 2) / 3;
          const tx = ecx + Math.cos(ang) * 7.5;
          const ty = ecy + Math.sin(ang) * 7.5;
          g.beginPath();
          g.arc(tx, ty, 2.5, 0, Math.PI * 2);
          g.fillStyle = "#000000";
          g.fill();
          // Tomoe tail
          g.beginPath();
          g.moveTo(tx, ty);
          g.quadraticCurveTo(tx + Math.cos(ang + 0.8) * 3.5, ty + Math.sin(ang + 0.8) * 3.5, tx + Math.cos(ang + 1.5) * 5.5, ty + Math.sin(ang + 1.5) * 5.5);
          g.lineWidth = 1.6;
          g.strokeStyle = "#000000";
          g.stroke();
        }
      } else if (emb.includes("ball") || emb.includes("football") || emb.includes("cr7") || emb.includes("soccer")) {
        const ecx = 24, ecy = 46, er = 13;
        g.beginPath();
        g.arc(ecx, ecy, er, 0, Math.PI * 2);
        const bGrad = g.createRadialGradient(ecx - 3, ecy - 3, 2, ecx, ecy, er);
        bGrad.addColorStop(0, "#ffffff");
        bGrad.addColorStop(0.7, "#dbe2ef");
        bGrad.addColorStop(1, "#8a96a8");
        g.fillStyle = bGrad;
        g.fill();
        g.lineWidth = 1.6;
        g.strokeStyle = "#1b202e";
        g.stroke();
        const rotB = ph * 1.2;
        g.fillStyle = "#1b202e";
        g.beginPath();
        g.arc(ecx + Math.cos(rotB) * 2, ecy + Math.sin(rotB) * 2, 3.8, 0, Math.PI * 2);
        g.fill();
        for (let p = 0; p < 4; p++) {
          const pa = rotB + (p * Math.PI) / 2;
          g.beginPath();
          g.arc(ecx + Math.cos(pa) * 8, ecy + Math.sin(pa) * 8, 2.4, 0, Math.PI * 2);
          g.fill();
        }
      } else if (emb.includes("car") || emb.includes("racing") || emb.includes("speed")) {
        const ecx = 22, ecy = 42;
        // Headlights
        g.fillStyle = "#00e5ff";
        g.shadowColor = "#00e5ff";
        g.shadowBlur = 8 * pulse;
        g.fillRect(ecx - 8, ecy - 12, 4, 3);
        g.fillRect(ecx + 6, ecy - 12, 4, 3);
        // Twin animated nitrous exhaust flames
        const fLen = 7 + 5 * Math.sin(ph * 4);
        g.fillStyle = "#ff7a18";
        g.shadowColor = "#ff3d71";
        g.shadowBlur = 10;
        g.fillRect(ecx - 7, ecy + 22, 3, fLen);
        g.fillRect(ecx + 5, ecy + 22, 3, fLen);
      } else if (emb.includes("flame") || emb.includes("fire")) {
        const ecx = 24, ecy = 46;
        g.shadowColor = "#ff3d71";
        g.shadowBlur = 12 * pulse;
        g.fillStyle = "#ff1744";
        g.beginPath();
        g.arc(ecx, ecy, 9 + 2 * Math.sin(ph * 2), 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#ff9100";
        g.beginPath();
        g.arc(ecx - 1, ecy - 2, 5.5 + 2 * Math.sin(ph * 3), 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#ffff00";
        g.beginPath();
        g.arc(ecx, ecy - 4, 2.8 + Math.sin(ph * 4), 0, Math.PI * 2);
        g.fill();
      } else if (emb.includes("lightning") || emb.includes("electric")) {
        const ecx = 22, ecy = 38;
        g.shadowColor = "#00e5ff";
        g.shadowBlur = 14 * pulse;
        g.fillStyle = "#00e5ff";
        g.beginPath();
        g.moveTo(ecx + 3, ecy - 10);
        g.lineTo(ecx - 5, ecy + 2);
        g.lineTo(ecx + 2, ecy + 2);
        g.lineTo(ecx - 3, ecy + 14);
        g.lineTo(ecx + 7, ecy);
        g.lineTo(ecx, ecy);
        g.closePath();
        g.fill();
        g.fillStyle = "#ffffff";
        g.fill();
      } else if (emb.includes("dragon")) {
        const ecx = 24, ecy = 44;
        g.shadowColor = "#00e676";
        g.shadowBlur = 12 * pulse;
        g.fillStyle = "#ffea00";
        g.beginPath();
        g.ellipse(ecx, ecy, 11, 6.5, Math.PI / 4, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#000000";
        g.beginPath();
        g.ellipse(ecx, ecy, 2, 7.5 + Math.sin(ph) * 1.5, Math.PI / 4, 0, Math.PI * 2);
        g.fill();
      } else if (emb.includes("skull")) {
        const ecx = 22, ecy = 42;
        g.fillStyle = "#ffffff";
        g.beginPath();
        g.arc(ecx, ecy - 2, 7.5, 0, Math.PI * 2);
        g.fill();
        g.fillRect(ecx - 4, ecy + 3, 8, 4.5);
        g.fillStyle = "#00e5ff";
        g.shadowColor = "#00e5ff";
        g.shadowBlur = 6;
        g.fillRect(ecx - 4.5, ecy - 3, 2.8, 2.8);
        g.fillRect(ecx + 2, ecy - 3, 2.8, 2.8);
      }
      g.restore();
    }

    // Reset filter
    g.filter = "none";
    g.restore();

    // Motion effects in pixel space
    const cx = hand ? 36 : 30;

    // Electric Lightning Bolts
    if (fx.has("electric")) {
      g.save();
      g.strokeStyle = "#ffffff";
      g.shadowColor = sp.accent;
      g.shadowBlur = 12;
      g.lineWidth = 2.2;
      for (let b = 0; b < 3; b++) {
        g.beginPath();
        let lx = OX + (R() * 40), ly = OY + (R() * 50);
        g.moveTo(lx, ly);
        for (let s = 0; s < 4; s++) {
          lx += (R() - 0.5) * 24;
          ly += (R() - 0.5) * 24;
          g.lineTo(lx, ly);
        }
        g.stroke();
      }
      g.restore();
    }

    // Vortex Swirl
    if (fx.has("vortex")) {
      const [vx, vy] = U(30, 48);
      for (let i = 0; i < 8; i++) {
        const u = (t + i / 8) % 1;
        const rad = 50 * (1 - u);
        const ang = ph * 2 + i * 0.8;
        const x = vx + Math.cos(ang) * rad;
        const y = vy + Math.sin(ang) * rad;
        g.fillStyle = sp.accent;
        g.globalAlpha = u;
        g.beginPath();
        g.arc(x, y, 2.5 * u + 0.8, 0, 6.283);
        g.fill();
      }
      g.globalAlpha = 1;
    }

    if (fx.has("sparkle")) {
      for (let i = 0; i < 5; i++) {
        const a = R() * 6.283, r = 38 + R() * 24, u = (t + i / 5) % 1, s = Math.sin(Math.PI * u);
        if (s < 0.05) continue;
        const [x, y] = U(cx + Math.cos(a) * r * 0.8, 45 + Math.sin(a) * r);
        star(g, x, y, H * 0.05 * s + H * 0.012, sp.accent, pix);
      }
    }
    if (fx.has("particles") || fx.has("flame")) {
      const fl = fx.has("flame"), N = fl ? 16 : 12;
      for (let i = 0; i < N; i++) {
        const bx = R() * 55 + 8, by = R() * 70 + 15, ang = fl ? -0.4 - R() * 1.0 : R() * 6.283, dist = (fl ? 0.2 : 0.14) * H * (0.6 + R() * 0.8), u = (t + R()) % 1;
        const [px, py] = U(bx, by), x = px + Math.cos(ang) * dist * u + (fl ? Math.sin(u * 6 + i) * 4 : 0), y = py + Math.sin(ang) * dist * u, sz = (fl ? 0.024 : 0.017) * H * (1 - u * 0.7) + 1.2;
        g.globalAlpha = 1 - u;
        g.fillStyle = fl ? mix(sp.accent, sp.glow, i / N) : (i % 2 ? sp.accent : sp.glow);
        if (pix) g.fillRect(x, y, sz, sz);
        else {
          g.beginPath();
          g.ellipse(x, y, fl ? sz * 1.8 : sz, fl ? sz * 0.8 : sz, ang, 0, 6.283);
          g.fill();
        }
      }
      g.globalAlpha = 1;
    }
    if (fx.has("orbit")) {
      const [ox, oy] = U(30, 48);
      for (let i = 0; i < 3; i++) {
        for (let k = 0; k < 3; k++) {
          const a = ph + i * 2.094 - k * 0.28;
          g.save();
          g.globalAlpha = 1 - k * 0.35;
          g.shadowColor = sp.accent;
          g.shadowBlur = pix ? 0 : H * 0.04;
          g.fillStyle = k ? sp.accent : "#fff";
          g.beginPath();
          g.arc(ox + Math.cos(a) * H * 0.3, oy + Math.sin(a) * H * 0.26, H * (0.022 - k * 0.005), 0, 6.283);
          g.fill();
          g.restore();
        }
      }
    }

    // Starlight Twinkle
    if (fx.has("starlight")) {
      for (let i = 0; i < 4; i++) {
        const u = (t + i * 0.25) % 1;
        const s = Math.sin(Math.PI * u);
        if (s > 0.08) {
          const sx = OX + (i === 0 ? 8 : i === 1 ? 42 : i === 2 ? 18 : 52);
          const sy = OY + (i === 0 ? 8 : i === 1 ? 42 : i === 2 ? 68 : 22);
          star(g, sx, sy, (H * 0.04) * s + 2, sp.accent, pix);
        }
      }
    }

    // Meteor Strike
    if (fx.has("meteor")) {
      const u = (t * 1.4) % 1;
      const mx = OX + u * 90 - 20;
      const my = OY + u * 110 - 20;
      g.save();
      g.strokeStyle = sp.accent;
      g.lineWidth = 2.4;
      g.shadowColor = sp.glow;
      g.shadowBlur = 10;
      g.beginPath();
      g.moveTo(mx - 22, my - 26);
      g.lineTo(mx, my);
      g.stroke();
      g.restore();
    }

    // Halo Rings
    if (fx.has("ring")) {
      for (let r = 0; r < 2; r++) {
        const rProg = (t + r * 0.5) % 1;
        const rRad = rProg * 55;
        g.save();
        g.strokeStyle = sp.accent;
        g.globalAlpha = (1 - rProg) * 0.75;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(OX + tip[0] * SC, OY + tip[1] * SC, rRad, 0, 6.283);
        g.stroke();
        g.restore();
      }
    }

    if (fx.has("aurora")) {
      g.save();
      g.globalCompositeOperation = "screen";
      for (let layer = 0; layer < 3; layer++) {
        const phase = ph + layer * 1.7;
        const yBase = OY + (26 + layer * 18) * SC;
        const grad = g.createLinearGradient(0, yBase - 24 * SC, 0, yBase + 32 * SC);
        grad.addColorStop(0, `${sp.glow}00`);
        grad.addColorStop(0.5, `${layer === 1 ? sp.accent : sp.glow}88`);
        grad.addColorStop(1, `${sp.glow}00`);
        g.fillStyle = grad;
        g.globalAlpha = 0.42;
        g.beginPath();
        g.moveTo(OX - 18 * SC, yBase);
        for (let step = 0; step <= 8; step++) {
          const x = OX - 18 * SC + step * 14 * SC;
          const y = yBase + Math.sin(phase + step * 0.72) * 13 * SC;
          g.lineTo(x, y);
        }
        g.lineTo(OX + 94 * SC, yBase + 30 * SC);
        g.lineTo(OX - 18 * SC, yBase + 30 * SC);
        g.closePath();
        g.fill();
      }
      g.restore();
    }

    if (fx.has("nebula")) {
      g.save();
      g.globalCompositeOperation = "screen";
      const nebulaColors = [sp.glow, sp.accent, sp.b];
      for (let cloud = 0; cloud < 7; cloud++) {
        const x = OX + 10 * SC + ((cloud * 31 + 18) % 64) * SC + Math.sin(ph + cloud) * 8 * SC;
        const y = OY + 10 * SC + ((cloud * 19 + 27) % 76) * SC + Math.cos(ph * 0.7 + cloud) * 6 * SC;
        const radius = (17 + (cloud % 3) * 6) * SC;
        const cloudGlow = g.createRadialGradient(x, y, 0, x, y, radius);
        cloudGlow.addColorStop(0, `${nebulaColors[cloud % nebulaColors.length]}bb`);
        cloudGlow.addColorStop(1, `${nebulaColors[cloud % nebulaColors.length]}00`);
        g.globalAlpha = 0.48;
        g.fillStyle = cloudGlow;
        g.beginPath();
        g.arc(x, y, radius, 0, 6.283);
        g.fill();
      }
      g.restore();
    }

    if (fx.has("wave")) {
      g.save();
      g.globalCompositeOperation = "screen";
      for (let line = 0; line < 4; line++) {
        const baseY = OY + (14 + line * 20) * SC;
        const grad = g.createLinearGradient(OX, baseY, OX + 80 * SC, baseY);
        grad.addColorStop(0, `${sp.glow}00`);
        grad.addColorStop(0.45, sp.glow);
        grad.addColorStop(1, `${sp.accent}00`);
        g.strokeStyle = grad;
        g.globalAlpha = 0.72;
        g.lineWidth = (2 + (line % 2)) * SC;
        g.beginPath();
        for (let step = 0; step <= 12; step++) {
          const x = OX + step * 7 * SC;
          const y = baseY + Math.sin(step * 0.64 + ph + line) * 8 * SC;
          if (step === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
      }
      g.restore();
    }

    if (fx.has("ripple")) {
      const [rx, ry] = U(tip[0], tip[1]);
      for (let wave = 0; wave < 3; wave++) {
        const progress = (t + wave / 3) % 1;
        g.save();
        g.globalCompositeOperation = "screen";
        g.globalAlpha = (1 - progress) * 0.72;
        g.strokeStyle = wave % 2 ? sp.accent : sp.glow;
        g.lineWidth = Math.max(1, 2.4 * SC * (1 - progress * 0.5));
        g.shadowColor = sp.glow;
        g.shadowBlur = 8 * SC;
        g.beginPath();
        g.ellipse(rx, ry, (5 + progress * 48) * SC, (4 + progress * 32) * SC, Math.sin(ph) * 0.12, 0, 6.283);
        g.stroke();
        g.restore();
      }
    }

    if (fx.has("plasma")) {
      g.save();
      g.globalCompositeOperation = "screen";
      const plasmaColors = [sp.a, sp.glow, sp.accent, sp.b];
      for (let orb = 0; orb < 4; orb++) {
        const x = OX + (22 + Math.cos(ph + orb * 1.57) * 18) * SC;
        const y = OY + (42 + Math.sin(ph * 0.82 + orb * 1.57) * 25) * SC;
        const radius = 30 * SC;
        const glow = g.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, `${plasmaColors[orb]}aa`);
        glow.addColorStop(1, `${plasmaColors[orb]}00`);
        g.globalAlpha = 0.5;
        g.fillStyle = glow;
        g.beginPath();
        g.arc(x, y, radius, 0, 6.283);
        g.fill();
      }
      g.restore();
    }

    if (fx.has("liquid")) {
      g.save();
      g.globalCompositeOperation = "screen";
      for (let ribbon = 0; ribbon < 3; ribbon++) {
        const y = OY + (22 + ribbon * 24) * SC;
        g.strokeStyle = ribbon % 2 ? sp.accent : sp.glow;
        g.globalAlpha = 0.68;
        g.lineWidth = (4 + ribbon) * SC;
        g.shadowColor = sp.glow;
        g.shadowBlur = 9 * SC;
        g.beginPath();
        g.moveTo(OX - 8 * SC, y);
        g.bezierCurveTo(
          OX + (20 + Math.sin(ph + ribbon) * 12) * SC,
          y - 20 * SC,
          OX + (48 + Math.cos(ph * 0.8 + ribbon) * 12) * SC,
          y + 20 * SC,
          OX + 82 * SC,
          y - Math.sin(ph + ribbon) * 8 * SC
        );
        g.stroke();
      }
      g.restore();
    }

    // Downscale to target pixel size
    let c = hi;
    while (c.width / 2 >= S.size) {
      const n = document.createElement("canvas");
      n.width = n.height = c.width / 2;
      const q = n.getContext("2d");
      q.imageSmoothingQuality = "high";
      q.drawImage(c, 0, 0, n.width, n.width);
      c = n;
    }
    const out = blank(), q = out.getContext("2d");
    q.imageSmoothingQuality = "high";
    q.drawImage(c, 0, 0, S.size, S.size);

    // Glitch effect across scanlines
    if (fx.has("glitch") && t > 0.3) {
      const im = q.getImageData(0, 0, S.size, S.size);
      const shiftY = Math.floor(S.size * 0.4);
      const shiftX = Math.floor((R() - 0.5) * 6);
      q.putImageData(im, shiftX, 0, 0, shiftY, S.size, 6);
    }

    if (pix) {
      const im = q.getImageData(0, 0, S.size, S.size), d = im.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 110) d[i + 3] = 0;
        else {
          d[i + 3] = 255;
          for (let k = 0; k < 3; k++) d[i + k] = Math.min(255, Math.round(d[i + k] / 32) * 32);
        }
      }
      q.putImageData(im, 0, 0);
    }
    return out;
  }

  function curBytes(cv, hot) {
    const w = cv.width, h = cv.height, d = cv.getContext("2d").getImageData(0, 0, w, h).data, mb = ((w + 31) >> 5) << 2, img = 40 + w * h * 4 + mb * h, u = new Uint8Array(22 + img), v = new DataView(u.buffer);
    v.setUint16(2, 2, true);
    v.setUint16(4, 1, true);
    u[6] = w >= 256 ? 0 : w;
    u[7] = h >= 256 ? 0 : h;
    v.setUint16(10, hot[0], true);
    v.setUint16(12, hot[1], true);
    v.setUint32(14, img, true);
    v.setUint32(18, 22, true);
    v.setUint32(22, 40, true);
    v.setInt32(26, w, true);
    v.setInt32(30, h * 2, true);
    v.setUint16(34, 1, true);
    v.setUint16(36, 32, true);
    v.setUint32(42, w * h * 4 + mb * h, true);
    let p = 62;
    for (let y = h - 1; y >= 0; y--) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        u[p++] = d[i + 2];
        u[p++] = d[i + 1];
        u[p++] = d[i];
        u[p++] = d[i + 3];
      }
    }
    return u;
  }

  const cat = (a) => {
    const o = new Uint8Array(a.reduce((s, x) => s + x.length, 0));
    let p = 0;
    a.forEach((x) => {
      o.set(x, p);
      p += x.length;
    });
    return o;
  };
  const u32 = (n) => {
    const a = new Uint8Array(4);
    new DataView(a.buffer).setUint32(0, n, true);
    return a;
  };
  const tag = (s) => new Uint8Array([...s].map((c) => c.charCodeAt(0)));

  function aniBytes(frames, hot, dur) {
    const fr = frames.slice(0, 3).map((c) => curBytes(c, hot)), jif = Math.max(1, Math.round((dur * 60) / 1000)), ah = new Uint8Array(36), av = new DataView(ah.buffer);
    av.setUint32(0, 36, true);
    av.setUint32(4, fr.length, true);
    av.setUint32(8, fr.length, true);
    av.setUint32(28, jif, true);
    av.setUint32(32, 1, true);
    const lb = cat([tag("fram"), ...fr.map((f) => cat([tag("icon"), u32(f.length), f]))]), body = cat([tag("ACON"), tag("anih"), u32(36), ah, tag("LIST"), u32(lb.length), lb]);
    return cat([tag("RIFF"), u32(body.length), body]);
  }

  function crc32(u) {
    const t = crc32.t || (crc32.t = Array.from({ length: 256 }, (_, n) => {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      return c >>> 0;
    }));
    let r = -1;
    for (const b of u) r = t[(r ^ b) & 255] ^ (r >>> 8);
    return (r ^ -1) >>> 0;
  }

  function zip(files) {
    const parts = [], cd = [];
    let off = 0;
    for (const f of files) {
      const nm = new TextEncoder().encode(f.name), crc = crc32(f.data), sz = f.data.length, lh = new Uint8Array(30 + nm.length), v = new DataView(lh.buffer);
      v.setUint32(0, 0x04034b50, true);
      v.setUint16(4, 20, true);
      v.setUint16(6, 0x0800, true);
      v.setUint16(12, 0x21, true);
      v.setUint32(14, crc, true);
      v.setUint32(18, sz, true);
      v.setUint32(22, sz, true);
      v.setUint16(26, nm.length, true);
      lh.set(nm, 30);
      parts.push(lh, f.data);
      const ch = new Uint8Array(46 + nm.length), w = new DataView(ch.buffer);
      w.setUint32(0, 0x02014b50, true);
      w.setUint16(4, 20, true);
      w.setUint16(6, 20, true);
      w.setUint16(8, 0x0800, true);
      w.setUint16(14, 0x21, true);
      w.setUint32(16, crc, true);
      w.setUint32(20, sz, true);
      w.setUint32(24, sz, true);
      w.setUint16(28, nm.length, true);
      w.setUint32(42, off, true);
      ch.set(nm, 46);
      cd.push(ch);
      off += lh.length + sz;
    }
    const cds = cat(cd), e = new Uint8Array(22), x = new DataView(e.buffer);
    x.setUint32(0, 0x06054b50, true);
    x.setUint16(8, files.length, true);
    x.setUint16(10, files.length, true);
    x.setUint32(12, cds.length, true);
    x.setUint32(16, off, true);
    return cat([...parts, cds, e]);
  }

  function mkSlot(shape, animated) {
    const p = PRESETS.neon[1];
    return { shape, animated, isManual: false, spec: { ...p, shape, parts: [...p.parts], fx: [...p.fx], seed: 7 }, frameSpecs: null, frames: [blank(), blank(), blank()], hot: [2, 2] };
  }

  function cloneSpec(spec) {
    return {
      ...spec,
      parts: [...(spec.parts || [])],
      fx: [...(spec.fx || [])],
      ...(Array.isArray(spec.customPoints) ? { customPoints: spec.customPoints.map((point) => [...point]) } : {})
    };
  }

  function ensureFrameSpecs(slot) {
    if (!Array.isArray(slot.frameSpecs) || slot.frameSpecs.length !== 3) {
      slot.frameSpecs = Array.from({ length: 3 }, () => cloneSpec(slot.spec));
    }
    return slot.frameSpecs;
  }

  function mkWorkspaceSlots(tabName) {
    const isAni = tabName === "animated";
    const sCur = mkSlot("arrow", isAni);
    const sPtr = mkSlot("hand", isAni);
    for (let i = 0; i < 3; i++) {
      sCur.frames[i] = render(sCur.spec, i / 3);
      sPtr.frames[i] = render(sPtr.spec, i / 3);
    }
    sCur.hot = hotOf(sCur.spec);
    sPtr.hot = hotOf(sPtr.spec);
    if (isAni) {
      sCur.frameSpecs = Array.from({ length: 3 }, () => cloneSpec(sCur.spec));
      sPtr.frameSpecs = Array.from({ length: 3 }, () => cloneSpec(sPtr.spec));
    }
    return { cursor: sCur, pointer: sPtr };
  }

  const TAB_WORKSPACES = {
    draw: { slots: mkWorkspaceSlots("draw"), cur: 0, k: "cursor" },
    animated: { slots: mkWorkspaceSlots("animated"), cur: 0, k: "cursor" },
    generate: { slots: mkWorkspaceSlots("generate"), cur: 0, k: "cursor" }
  };

  S.slots = TAB_WORKSPACES.generate.slots;
  const K = () => S.slots[S.k];
  const nF = () => S.tab === "draw" || !K().animated ? 1 : 3;
  function loopFrameIndexAt(t) {
    const startTime = Number.isFinite(S.loopStartedAt) ? S.loopStartedAt : t;
    const elapsedFrames = Math.floor(Math.max(0, t - startTime) / Math.max(1, S.dur));
    return (S.loopStartFrame + elapsedFrames) % nF();
  }
  let frameClipboard = null;

  function copyCurrentFrame() {
    if (S.tab !== "animated" || !K().animated) return false;
    const slot = K();
    const spec = Array.isArray(slot.frameSpecs) ? slot.frameSpecs[S.cur] : slot.spec;
    frameClipboard = {
      slotKey: S.k,
      image: slot.frames[S.cur].getContext("2d").getImageData(0, 0, S.size, S.size),
      spec: cloneSpec(spec)
    };
    toast(`Copied Frame ${S.cur + 1} drawing, effects, motion, and style.`);
    return true;
  }

  function pasteCurrentFrame() {
    if (S.tab !== "animated" || !K().animated) return false;
    if (!frameClipboard) {
      toast("Select a frame and press Ctrl+C before pasting.");
      return false;
    }
    if (frameClipboard.slotKey !== S.k) {
      toast("Copy and paste frames within the same cursor or pointer.");
      return false;
    }
    hpush("paste_frame");
    const slot = K();
    slot.frameSpecs = ensureFrameSpecs(slot);
    slot.frameSpecs[S.cur] = cloneSpec(frameClipboard.spec);
    slot.spec = cloneSpec(slot.frameSpecs[S.cur]);
    slot.frames[S.cur].getContext("2d").putImageData(frameClipboard.image, 0, 0);
    sync();
    thumbs();
    draw();
    toast(`Pasted frame into Frame ${S.cur + 1}.`);
    return true;
  }

  function regenSlot(k, keep0) {
    const s = S.slots[k];
    if (s.isManual) return;
    const frameSpecs = S.tab === "animated" && Array.isArray(s.frameSpecs) ? s.frameSpecs : null;
    for (let i = keep0 ? 1 : 0; i < 3; i++) s.frames[i] = render(frameSpecs ? frameSpecs[i] : s.spec, i / 3);
    if (!keep0) s.hot = hotOf(s.spec);
  }

  function regenAll() {
    for (const k in S.slots) {
      S.slots[k].frames = [blank(), blank(), blank()];
      regenSlot(k);
    }
  }

  function snap() {
    const o = { size: S.size, k: S.k, cur: S.cur, slots: {} };
    for (const k in S.slots) {
      const s = S.slots[k];
      o.slots[k] = { animated: s.animated, hot: [...s.hot], spec: cloneSpec(s.spec), frameSpecs: Array.isArray(s.frameSpecs) ? s.frameSpecs.map(cloneSpec) : null, img: s.frames.map((f) => f.getContext("2d").getImageData(0, 0, f.width, f.height)) };
    }
    return o;
  }

  function restore(o) {
    S.size = o.size;
    S.k = o.k;
    S.cur = o.cur;
    for (const k in o.slots) {
      const s = S.slots[k], r = o.slots[k];
      s.animated = r.animated;
      s.hot = [...r.hot];
      s.spec = cloneSpec(r.spec);
      s.frameSpecs = Array.isArray(r.frameSpecs) ? r.frameSpecs.map(cloneSpec) : null;
      s.frames = r.img.map((im) => {
        const c = blank();
        c.getContext("2d").putImageData(im, 0, 0);
        return c;
      });
    }
    sync();
    draw();
  }

  const U = [], Rd = [], Hl = { tag: null, t: 0 };
  function hpush(tag) {
    const n = Date.now();
    if (tag && tag === Hl.tag && n - Hl.t < 900) {
      Hl.t = n;
      return;
    }
    Hl.tag = tag || null;
    Hl.t = n;
    U.push(snap());
    if (U.length > 80) U.shift();
    Rd.length = 0;
  }

  function undo() {
    if (!U.length) return;
    closeMenu();
    Rd.push(snap());
    restore(U.pop());
  }

  function redo() {
    if (!Rd.length) return;
    closeMenu();
    U.push(snap());
    restore(Rd.pop());
  }

  function upd(fn) {
    hpush("spec");
    const k = S.k, s = S.slots[k];
    fn(s.spec);
    if (S.tab === "animated") ensureFrameSpecs(s)[S.cur] = cloneSpec(s.spec);
    regenSlot(k);
    if (S.link) {
      const ok = k === "cursor" ? "pointer" : "cursor", o = S.slots[ok];
      o.spec = { ...s.spec, shape: o.shape, parts: [...s.spec.parts], fx: [...s.spec.fx] };
      if (S.tab === "animated") ensureFrameSpecs(o)[S.cur] = cloneSpec(o.spec);
      regenSlot(ok);
    }
    sync();
    draw();
  }

  // Load Ready-Made Templates
  window._loadTemplate = (templateId) => {
    hpush("template");
    const k = S.k, s = S.slots[k];
    if (templateId === "arrow") {
      s.spec = { style: "smooth", a: "#ffffff", b: "#e0e6ed", outline: "#000000", glow: "#2f6bff", accent: "#00d4ff", ow: 3, glowAmt: 0.2, parts: ["shine"], fx: ["pulse"], seed: 7, shape: "arrow" };
    } else if (templateId === "hand") {
      s.spec = { style: "smooth", a: "#ffffff", b: "#f5f7fa", outline: "#0a0a14", glow: "#2f6bff", accent: "#ff7a18", ow: 3, glowAmt: 0.3, parts: ["shine"], fx: ["pulse"], seed: 7, shape: "hand" };
    } else if (templateId === "crosshair") {
      s.spec = { style: "pixel", a: "#00ff88", b: "#00d4ff", outline: "#041408", glow: "#00ff88", accent: "#ffffff", ow: 2, glowAmt: 0, parts: [], fx: ["sparkle"], seed: 12, shape: "arrow" };
    } else if (templateId === "cyber") {
      s.spec = { style: "smooth", a: "#00f0ff", b: "#ff0077", outline: "#070214", glow: "#00f0ff", accent: "#ffe600", ow: 4, glowAmt: 0.9, parts: ["stripes", "core"], fx: ["chroma", "electric"], seed: 44, shape: "arrow" };
    } else if (templateId === "sword") {
      s.spec = { style: "pixel", a: "#ffd700", b: "#ff7a18", outline: "#2b1400", glow: "#ffd700", accent: "#ffffff", ow: 3.5, glowAmt: 0, parts: ["facets"], fx: ["sparkle", "glitch"], seed: 99, shape: "arrow" };
    } else if (templateId === "diamond") {
      s.spec = { style: "smooth", a: "#e2b8ff", b: "#7b2cff", outline: "#150433", glow: "#b25cff", accent: "#ffffff", ow: 3, glowAmt: 0.8, parts: ["facets", "shine"], fx: ["shimmer", "orbit"], seed: 23, shape: "arrow" };
    } else if (templateId === "wand") {
      s.spec = { style: "smooth", a: "#fff275", b: "#ff8c42", outline: "#210d00", glow: "#ffb347", accent: "#ff3d71", ow: 3.5, glowAmt: 0.85, parts: ["core", "shine"], fx: ["sparkle", "vortex"], seed: 77, shape: "arrow" };
    } else if (templateId === "dot") {
      s.spec = { style: "smooth", a: "#00d4ff", b: "#2f6bff", outline: "#030a1c", glow: "#00d4ff", accent: "#ffffff", ow: 4, glowAmt: 0.95, parts: ["core"], fx: ["pulse", "float"], seed: 5, shape: "arrow" };
    }
    if (S.tab === "animated") ensureFrameSpecs(s)[S.cur] = cloneSpec(s.spec);
    regenSlot(k);
    sync();
    draw();
  };

  // New Project Button
  const btnNewProj = $("#btn-new-project");
  if (btnNewProj) {
    btnNewProj.onclick = () => {
      hpush("new");
      const k = S.k, s = S.slots[k];
      s.frames.forEach((f) => f.getContext("2d").clearRect(0, 0, S.size, S.size));
      s.spec = { style: "smooth", a: "#00e5ff", b: "#2f6bff", outline: "#080c1f", glow: "#00d4ff", accent: "#ff7a18", ow: 4, glowAmt: 0.6, parts: ["shine"], fx: ["pulse"], seed: 7, shape: s.shape };
      if (S.tab === "animated") s.frameSpecs = Array.from({ length: 3 }, () => cloneSpec(s.spec));
      regenSlot(k);
      sync();
      draw();
      toast("Fresh new project initialized");
    };
  }

  // Helper to convert Uint8Array binary cursor to base64 Data URL
  const u8ToDataUrl = (u8, mime = "application/octet-stream") => {
    let binary = "";
    const len = u8.byteLength;
    const chunk = 8192;
    for (let i = 0; i < len; i += chunk) {
      const sub = u8.subarray(i, Math.min(i + chunk, len));
      binary += String.fromCharCode.apply(null, sub);
    }
    return `data:${mime};base64,` + btoa(binary);
  };

  // Save It functionality for Draw, Animated & Generate (PRESERVES ALL FRAMES)
  const handleSaveIt = async () => {
    try {
      const isAni = Boolean(S.slots.cursor.animated && S.slots.cursor.frames.length > 1);
      // Capture ALL frames of cursor and pointer
      const curFrames = S.slots.cursor.frames.map((cv) => cv.toDataURL("image/png"));
      const ptrFrames = S.slots.pointer ? S.slots.pointer.frames.map((cv) => cv.toDataURL("image/png")) : [];
      const previewPng = curFrames[0];
      const pointerPng = ptrFrames[0] || previewPng;

      // Generate binary Windows cursor files (.ani and .cur)
      let aniDataUrl = "";
      let curDataUrl = "";
      try {
        if (isAni) {
          const aniU8 = aniBytes(S.slots.cursor.frames, S.slots.cursor.hot, S.dur || 150);
          aniDataUrl = u8ToDataUrl(aniU8);
        }
        const curU8 = curBytes(S.slots.cursor.frames[0], S.slots.cursor.hot);
        curDataUrl = u8ToDataUrl(curU8);
      } catch (err) {
        console.warn("Could not encode cursor binary:", err);
      }

      let ptrAniDataUrl = "";
      let ptrCurDataUrl = "";
      if (S.slots.pointer) {
        try {
          if (S.slots.pointer.animated) {
            const pAniU8 = aniBytes(S.slots.pointer.frames, S.slots.pointer.hot, S.dur || 150);
            ptrAniDataUrl = u8ToDataUrl(pAniU8);
          }
          const pCurU8 = curBytes(S.slots.pointer.frames[0], S.slots.pointer.hot);
          ptrCurDataUrl = u8ToDataUrl(pCurU8);
        } catch (err) {
          console.warn("Could not encode pointer binary:", err);
        }
      }

      const savedList = JSON.parse(localStorage.getItem("cursors_u_saved_sets") || "[]");
      const id = "saved_" + Date.now();
      const specName = S.slots.cursor.spec?.name;
      const title = specName || ("Custom " + (isAni ? "Animated" : "Static") + " Set " + (savedList.length + 1));

      const newEntry = {
        id,
        title,
        category: "Saved",
        description: `Created in cursors U on ${new Date().toLocaleDateString()} (${isAni ? curFrames.length + " frames" : "1 frame"})`,
        gif: previewPng,
        png: previewPng,
        cur: curDataUrl || previewPng,
        ani: aniDataUrl || "",
        pointer_png: pointerPng,
        pointer_cur: ptrCurDataUrl || pointerPng,
        pointer_ani: ptrAniDataUrl || "",
        is_animated: isAni,
        is_pack: false,
        dur: S.dur || 150,
        hot: [...S.slots.cursor.hot],
        pointer_hot: S.slots.pointer ? [...S.slots.pointer.hot] : [0, 0],
        frames: curFrames, // ALL FRAMES SAVED HERE
        pointer_frames: ptrFrames, // ALL POINTER FRAMES SAVED HERE
        spec: JSON.parse(JSON.stringify(S.slots.cursor.spec || {}))
      };

      savedList.unshift(newEntry);
      localStorage.setItem("cursors_u_saved_sets", JSON.stringify(savedList));
      if (window._refreshSavedCursors) window._refreshSavedCursors(savedList);
      toast(`Saved with all ${curFrames.length} frames! Check 'Saved' tab in cursors.`);
    } catch (err) {
      toast("Error saving cursor: " + err.message);
    }
  };

  const bSaveTop = $("#btn-save-it-top");
  if (bSaveTop) bSaveTop.onclick = handleSaveIt;
  const bSaveAct = $("#btn-save-it");
  if (bSaveAct) bSaveAct.onclick = handleSaveIt;

  // Render media (Image or Video frame) masked inside cursor outline
  function renderMediaIntoSlotFrame(mediaEl, slot, frameIdx, sp, varIdx = 0) {
    const H = 256;
    const SC = (H * 0.72) / 90;
    const OX = H * 0.14;
    const OY = H * 0.12;
    const shape = sp.shape || "arrow";
    const tip = tipOf(sp);

    const c = document.createElement("canvas");
    c.width = c.height = H;
    const g = c.getContext("2d");
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = "high";

    const P = () => shapePath(g, shape, sp);

    g.save();
    g.translate(OX + tip[0] * SC, OY + tip[1] * SC);
    g.translate(-tip[0] * SC, -tip[1] * SC);
    g.scale(SC, SC);

    // 1. Clip to cursor boundary silhouette
    g.save();
    P();
    g.clip();

    // Dark solid base under media
    g.fillStyle = sp.a || "#0b0614";
    g.fillRect(-30, -30, 160, 160);

    // Draw Media scaled to cover the cursor body
    const pulseScale = varIdx === 1 ? 1.07 : varIdx === 2 ? 1.14 : 1.0;
    const mw = mediaEl.videoWidth || mediaEl.naturalWidth || mediaEl.width || 100;
    const mh = mediaEl.videoHeight || mediaEl.naturalHeight || mediaEl.height || 100;
    const aspect = (mw && mh) ? mw / mh : 1;

    let dw = 75 * pulseScale;
    let dh = (75 / aspect) * pulseScale;
    if (dh < 95 * pulseScale) {
      dh = 95 * pulseScale;
      dw = 95 * aspect * pulseScale;
    }
    const dx = (55 - dw) / 2;
    const dy = (80 - dh) / 2;

    g.drawImage(mediaEl, dx, dy, dw, dh);

    // 2. Sleek Gloss & Inner Shadow / Shading
    const gloss = g.createLinearGradient(0, 0, 60, 90);
    gloss.addColorStop(0, "rgba(255, 255, 255, 0.28)");
    gloss.addColorStop(0.4, "rgba(255, 255, 255, 0.0)");
    gloss.addColorStop(0.85, "rgba(0, 0, 0, 0.2)");
    gloss.addColorStop(1, "rgba(0, 0, 0, 0.45)");
    g.fillStyle = gloss;
    g.fill();
    g.restore(); // end clip

    // 3. Sharp Cursor Outline on top (حدود الماوس)
    P();
    g.lineWidth = (sp.ow || 3) * 2;
    g.strokeStyle = sp.outline || "#040208";
    g.stroke();

    // 4. Glow / Accent Outer Stroke
    const glowCol = sp.glow || "#00d4ff";
    g.save();
    g.shadowColor = glowCol;
    g.shadowBlur = H * 0.08 * (sp.glowAmt || 0.5);
    P();
    g.lineWidth = (sp.ow || 3) * 1.4;
    g.strokeStyle = sp.accent || glowCol;
    g.stroke();
    g.restore();

    g.restore(); // end transform

    // Downsample to slot frame canvas (S.size, 32x32)
    const targetCanvas = slot.frames[frameIdx];
    const q = targetCanvas.getContext("2d");
    q.clearRect(0, 0, S.size, S.size);
    q.imageSmoothingEnabled = true;
    q.imageSmoothingQuality = "high";
    q.drawImage(c, 0, 0, S.size, S.size);
  }

  // Apply 3 Frames from Frame Handling Modern Cut
  window._applyModernCutFrames = (framesCanvases, opts = {}) => {
    try {
      hpush("modern_cut_media");
      const slot = S.slots[S.k || "cursor"];
      const ptrSlot = S.link ? S.slots.pointer : null;
      const s = S.size;

      for (let i = 0; i < 3; i++) {
        if (framesCanvases[i]) {
          const q = slot.frames[i].getContext("2d");
          q.clearRect(0, 0, s, s);
          q.imageSmoothingEnabled = true;
          q.imageSmoothingQuality = "high";
          q.drawImage(framesCanvases[i], 0, 0, s, s);

          if (ptrSlot && opts.pointerFrames && opts.pointerFrames[i]) {
            const pq = ptrSlot.frames[i].getContext("2d");
            pq.clearRect(0, 0, s, s);
            pq.imageSmoothingEnabled = true;
            pq.imageSmoothingQuality = "high";
            pq.drawImage(opts.pointerFrames[i], 0, 0, s, s);
          }
        }
      }

      slot.animated = true;
      slot.isManual = true;
      if (ptrSlot) {
        ptrSlot.animated = true;
        ptrSlot.isManual = true;
      }

      if (opts.shape) slot.spec.shape = opts.shape;
      if (opts.outlineColor) slot.spec.outline = opts.outlineColor;
      if (opts.glowColor) slot.spec.glow = opts.glowColor;
      if (opts.glowAmt !== undefined) slot.spec.glowAmt = opts.glowAmt;

      buildTh();
      thumbs();
      draw();
      toast("Applied 3 media frames under cursor outline!");
    } catch (err) {
      console.error("Error applying modern cut frames:", err);
      toast("Error applying frames: " + err.message);
    }
  };

  async function handleMediaUpload(file) {
    if (!file) return;
    if (window._openModernCutWithFile) {
      window._openModernCutWithFile(file);
    }
  }

  // Import PNG Frame File Handler
  const importInput = $("#import-png-input");
  if (importInput) {
    importInput.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          hpush("import_png");
          const targetCanvas = K().frames[S.cur];
          const g = targetCanvas.getContext("2d");
          g.clearRect(0, 0, S.size, S.size);
          g.imageSmoothingEnabled = false;
          g.drawImage(img, 0, 0, S.size, S.size);
          K().isManual = true;
          draw();
          thumbs();
          toast("Imported PNG into Frame " + (S.cur + 1) + " successfully");
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    };
  }

  // Import .ANI / .CUR / .ICO Cursor File Handler
  const importCursorInput = $("#import-cursor-input");
  if (importCursorInput) {
    importCursorInput.onchange = async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        toast("Decoding " + file.name + "...");
        const res = await parseCursorFile(file, S.size);
        hpush("import_cursor");
        const k = K();
        k.animated = res.animated;
        if (res.hot) k.hot = [...res.hot];
        if (res.dur) S.dur = res.dur;
        k.isManual = true;

        if (res.frames && res.frames.length > 0) {
          for (let i = 0; i < 3; i++) {
            const src = res.frames[i] || res.frames[0];
            const dst = k.frames[i];
            const g = dst.getContext("2d");
            g.clearRect(0, 0, S.size, S.size);
            g.imageSmoothingEnabled = false;
            g.drawImage(src, 0, 0, S.size, S.size);
          }
        }
        buildTh();
        thumbs();
        sync();
        draw();
        toast("Loaded " + file.name + " (" + (res.animated ? (res.frames.length + " frames animated") : "static frame") + ") successfully!");
      } catch (err) {
        toast("Error loading cursor: " + err.message);
      } finally {
        e.target.value = "";
      }
    };
  }

  let kid = 0;
  function knob(host, o) {
    if (!host) return { set: () => {} };
    if (o.linear || host.dataset.linear === "true") {
      const id = "kg" + kid++ + "-range";
      let v = o.val;
      host.className = "knob linear-knob";
      host.innerHTML =
        '<div class="linear-knob-label"><label for="' + id + '">' + o.label +
        '</label><b></b></div><input id="' + id + '" type="range" min="' + o.min +
        '" max="' + o.max + '" step="' + o.step + '" value="' + o.val +
        '" aria-label="' + o.label + '">';
      const input = host.querySelector("input");
      const valueLabel = host.querySelector("b");
      const show = () => {
        const progress = ((v - o.min) / (o.max - o.min)) * 100;
        input.value = String(v);
        input.style.setProperty("--range-progress", progress + "%");
        valueLabel.textContent = o.fmt ? o.fmt(v) : v;
        if (o.onDisplay) o.onDisplay(v, progress / 100);
      };
      const setv = (nv) => {
        nv = Math.round((Math.min(o.max, Math.max(o.min, nv)) - o.min) / o.step) * o.step + o.min;
        nv = +nv.toFixed(3);
        if (nv === v) return;
        v = nv;
        show();
        o.onInput(v);
      };
      input.addEventListener("input", () => setv(+input.value));
      show();
      return { set: (x) => { v = x; show(); } };
    }

    const id = "kg" + kid++, A0 = 135, SW = 270, R = 38;
    let v = o.val;
    const P = (a) => [50 + R * Math.cos((a * Math.PI) / 180), 50 + R * Math.sin((a * Math.PI) / 180)];
    const arc = (a0, a1) => {
      const p = P(a0), q = P(a1);
      return "M" + p[0] + " " + p[1] + "A" + R + " " + R + " 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + q[0] + " " + q[1];
    };
    host.className = "knob";
    host.tabIndex = 0;
    host.innerHTML = '<svg viewBox="0 0 100 100"><defs><linearGradient id="' + id + '" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#00d4ff"/><stop offset=".5" stop-color="#2f6bff"/><stop offset="1" stop-color="#ff7a18"/></linearGradient></defs><path class="tr" d="' + arc(A0, A0 + SW - 0.01) + '"/><path class="vl" stroke="url(#' + id + ')"/><circle class="dt" r="5.5"/></svg><b></b><small>' + o.label + '</small>';
    const vl = host.querySelector(".vl"), dt = host.querySelector(".dt"), bb = host.querySelector("b"), sv = host.querySelector("svg");
    const show = () => {
      const f = (v - o.min) / (o.max - o.min), a = A0 + SW * f, p = P(a);
      vl.setAttribute("d", f < 0.003 ? "" : arc(A0, Math.max(A0 + 0.01, a)));
      dt.setAttribute("cx", p[0]);
      dt.setAttribute("cy", p[1]);
      bb.textContent = o.fmt ? o.fmt(v) : v;
    };
    const setv = (nv) => {
      nv = Math.round((Math.min(o.max, Math.max(o.min, nv)) - o.min) / o.step) * o.step + o.min;
      nv = +nv.toFixed(3);
      if (nv === v) return;
      v = nv;
      show();
      o.onInput(v);
    };
    const drag = (e) => {
      const r = sv.getBoundingClientRect();
      let rel = ((Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI - A0 + 720) % 360;
      if (rel > SW) rel = rel - SW < (360 - SW) / 2 ? SW : 0;
      setv(o.min + (rel / SW) * (o.max - o.min));
    };
    host.addEventListener("pointerdown", (e) => {
      host.setPointerCapture(e.pointerId);
      drag(e);
    });
    host.addEventListener("pointermove", (e) => {
      if (host.hasPointerCapture(e.pointerId)) drag(e);
    });
    host.addEventListener("wheel", (e) => {
      e.preventDefault();
      setv(v + (e.deltaY < 0 ? 1 : -1) * o.step);
    }, { passive: false });
    host.addEventListener("keydown", (e) => {
      const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
      if (d) {
        e.preventDefault();
        setv(v + d * o.step);
      }
    });
    show();
    return { set: (x) => { v = x; show(); } };
  }

  const kn = {};
  const editors = {
    draw: $("#ed-draw"),
    animated: $("#ed-animated"),
    generate: $("#ed-generate")
  };
  let ed = editors[S.tab] || editors.generate;
  let ex = ed ? ed.getContext("2d") : null;
  let chk = null, chkS = 0, chkTheme = "";

  function checker() {
    const theme = document.querySelector(".app-shell")?.dataset.backgroundTheme === "dark" ? "dark" : "blur";
    if (chkS === S.size && chkTheme === theme) return chk;
    chkS = S.size;
    chkTheme = theme;
    chk = document.createElement("canvas");
    chk.width = chk.height = 512;
    const g = chk.getContext("2d"), c = 512 / S.size;

    // Keep the editor backdrop neutral in both themes.
    const grad = g.createRadialGradient(256, 256, 20, 256, 256, 340);
    if (theme === "dark") {
      grad.addColorStop(0, "#191a1d");
      grad.addColorStop(0.65, "#101113");
      grad.addColorStop(1, "#08090b");
    } else {
      grad.addColorStop(0, "#292b2f");
      grad.addColorStop(0.65, "#1c1e22");
      grad.addColorStop(1, "#121417");
    }
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 512);

    // Subtle micro-dots at grid cell intersections (clean & non-intrusive)
    g.fillStyle = "rgba(255, 255, 255, 0.08)";
    for (let y = 1; y < S.size; y++) {
      for (let x = 1; x < S.size; x++) {
        g.fillRect(Math.round(x * c) - 0.5, Math.round(y * c) - 0.5, 1, 1);
      }
    }

    // Outer subtle border
    g.strokeStyle = "rgba(255, 255, 255, 0.08)";
    g.lineWidth = 1;
    g.strokeRect(0.5, 0.5, 511, 511);
    return chk;
  }

  function draw(t) {
    if (!ed || !ex) return;
    const s = S.size, c = 512 / s, k = K();
    const n = nF();
    const isLooping = S.playing && k.animated && n > 1;
    const frameIndex = isLooping ? loopFrameIndexAt(Number.isFinite(t) ? t : performance.now()) : S.cur;
    if (isLooping) S.loopFrameIdx = frameIndex;
    ex.clearRect(0, 0, 512, 512);
    ex.drawImage(checker(), 0, 0);
    ex.imageSmoothingEnabled = false;

    if (S.tab === "generate") {
      const stage = ed.closest(".canvas-stage-wrap");
      const glow = stage
        ? Number.parseFloat(getComputedStyle(stage).getPropertyValue("--cursor-preview-glow")) || 0
        : 0;
      ex.save();
      ex.shadowColor = stage
        ? getComputedStyle(stage).getPropertyValue("--cursor-preview-glow-color").trim() || "rgba(139, 108, 255, 0.9)"
        : "rgba(139, 108, 255, 0.9)";
      ex.shadowBlur = glow;
      ex.drawImage(k.frames[frameIndex], 0, 0, 512, 512);
      ex.restore();
      return;
    }

    if (!isLooping && k.animated && S.cur > 0) {
      ex.globalAlpha = 0.25;
      ex.drawImage(k.frames[S.cur - 1], 0, 0, 512, 512);
      ex.globalAlpha = 1;
    }
    ex.drawImage(k.frames[frameIndex], 0, 0, 512, 512);

    ex.strokeStyle = "rgba(255,255,255,.07)";
    ex.lineWidth = 1;
    ex.beginPath();
    for (let i = 0; i <= s; i++) {
      ex.moveTo(i * c + 0.5, 0);
      ex.lineTo(i * c + 0.5, 512);
      ex.moveTo(0, i * c + 0.5);
      ex.lineTo(512, i * c + 0.5);
    }
    ex.stroke();

    ex.strokeStyle = "#ff7a18";
    ex.lineWidth = 2.5;
    ex.strokeRect(k.hot[0] * c + 1, k.hot[1] * c + 1, c - 2, c - 2);

    if (!isLooping && S.sel && S.selShow) {
      ex.fillStyle = "rgba(255,122,24,.22)";
      for (let i = 0; i < s * s; i++) {
        if (S.sel.m[i]) ex.fillRect((i % s) * c, ((i / s) | 0) * c, c, c);
      }
      ex.strokeStyle = "#ffb347";
      ex.lineWidth = 2;
      ex.beginPath();
      S.sel.seg.forEach((q) => {
        ex.moveTo(q[0] * c, q[1] * c);
        ex.lineTo(q[2] * c, q[3] * c);
      });
      ex.stroke();
    }

    if (S.hov && !M) {
      const b = S.brush, h = Math.floor(b / 2);
      ex.strokeStyle = "rgba(0,212,255,.9)";
      ex.lineWidth = 1.5;
      ex.strokeRect((S.hov[0] - h) * c + 1, (S.hov[1] - h) * c + 1, b * c - 2, b * c - 2);
    }
    thumbs();
  }

  let down = false, R_press = null, M = null;
  const pos = (e) => {
    const r = ed.getBoundingClientRect();
    return [
      Math.floor(((e.clientX - r.left) / r.width) * S.size),
      Math.floor(((e.clientY - r.top) / r.height) * S.size),
    ];
  };

  function brushRect(x, y) {
    const b = S.brush, h = Math.floor(b / 2);
    return [x - h, y - h, b, b];
  }

  function act(e) {
    const [x, y] = pos(e), s = S.size;
    if (x < 0 || y < 0 || x >= s || y >= s) return;
    const g = K().frames[S.cur].getContext("2d");
    if (S.tool === "pen") {
      g.fillStyle = S.color;
      g.fillRect(...brushRect(x, y));
    } else if (S.tool === "erase") {
      g.clearRect(...brushRect(x, y));
    } else if (S.tool === "fill") {
      if (e.type === "pointerdown") fill(g, x, y);
    } else if (S.tool === "pick") {
      const d = g.getImageData(x, y, 1, 1).data;
      if (d[3]) setColor(rgb2hex([...d]));
    } else if (S.tool === "hot") {
      K().hot = [x, y];
    }
    draw();
  }

  function eraseCell(c) {
    if (!R_press.pushed) {
      hpush();
      R_press.pushed = true;
    }
    K().frames[S.cur].getContext("2d").clearRect(...brushRect(c[0], c[1]));
    draw();
  }

  function fill(g, x, y) {
    const s = S.size, im = g.getImageData(0, 0, s, s), d = im.data, i0 = (y * s + x) * 4;
    const t = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]], n = hex2rgb(S.color);
    if (t[3] === 255 && t[0] === n[0] && t[1] === n[1] && t[2] === n[2]) return;
    const st = [[x, y]];
    while (st.length) {
      const [a, b] = st.pop();
      if (a < 0 || b < 0 || a >= s || b >= s) continue;
      const i = (b * s + a) * 4;
      if (d[i] !== t[0] || d[i + 1] !== t[1] || d[i + 2] !== t[2] || d[i + 3] !== t[3]) continue;
      d[i] = n[0];
      d[i + 1] = n[1];
      d[i + 2] = n[2];
      d[i + 3] = 255;
      st.push([a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]);
    }
    g.putImageData(im, 0, 0);
  }

  Object.values(editors).forEach((canvas) => {
    if (!canvas) return;
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    canvas.addEventListener("pointerdown", (e) => {
      if (M) {
        closeMenu();
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
      if (e.button === 2) {
        if (S.tab !== "draw" && S.tab !== "animated") return;
        R_press = { x: e.clientX, y: e.clientY, cell: pos(e), moved: false, opened: false, pushed: false };
        R_press.t = setTimeout(() => {
          if (R_press) {
            R_press.opened = openMenu(R_press.x, R_press.y, R_press.cell);
            if (!R_press.opened) toast("Nothing to edit here");
          }
        }, 380);
        return;
      }
      if (e.button === 0) {
        if (S.tab !== "draw" && S.tab !== "animated") return;
        down = true;
        hpush();
        act(e);
      }
    });

    canvas.addEventListener("pointermove", (e) => {
      S.hov = pos(e);
      if (S.tab !== "draw" && S.tab !== "animated") return;
      if (!down && !R_press) return;
      if (R_press) {
        if (R_press.opened) {
          hoverSec(e.clientX, e.clientY);
          return;
        }
        if (!R_press.moved && Math.hypot(e.clientX - R_press.x, e.clientY - R_press.y) > 4) {
          clearTimeout(R_press.t);
          R_press.moved = true;
          eraseCell(R_press.cell);
        }
        if (R_press.moved) eraseCell(S.hov);
        return;
      }
      if (down && S.tool !== "fill" && S.tool !== "pick") {
        act(e);
        thumbs();
      } else {
        draw();
      }
    });

    canvas.addEventListener("pointerup", (e) => {
      down = false;
      thumbs();
      if (!R_press) return;
      clearTimeout(R_press.t);
      if (R_press.opened) {
        const i = secAt(e.clientX, e.clientY);
        if (i >= 0) choose(i);
      } else if (!R_press.moved) eraseCell(R_press.cell);
      R_press = null;
    });

    canvas.addEventListener("pointerleave", () => {
      S.hov = null;
      if (S.tab === "draw" || S.tab === "animated") draw();
    });
  });

  function setTool(m) {
    S.tool = m;
    $$("[data-tool]").forEach((x) => x.classList.toggle("on", x.dataset.tool === m));
  }

  function setBrush(n) {
    S.brush = Math.max(1, Math.min(8, n));
    $$("[data-brush-value]").forEach((value) => { value.textContent = S.brush; });
    draw();
  }

  $$("[data-tool]").forEach((b) => (b.onclick = () => setTool(b.dataset.tool)));
  $$("[data-brush-delta]").forEach((b) => {
    b.onclick = () => setBrush(S.brush + Number(b.dataset.brushDelta));
  });
  $$("[data-drawing-action]").forEach((b) => {
    b.onclick = b.dataset.drawingAction === "undo" ? undo : redo;
  });

  $$(".sws").forEach((sws) => {
    sws.innerHTML = "";
    PAL.forEach((c) => {
      const i = document.createElement("i");
      i.style.background = c;
      i.dataset.c = c;
      i.onclick = () => setColor(c);
      sws.appendChild(i);
    });
    const cp = document.createElement("input");
    cp.type = "color";
    cp.value = S.color;
    cp.oninput = () => setColor(cp.value);
    sws.appendChild(cp);
  });

  function setColor(c) {
    S.color = c;
    $$(".sws input[type=color]").forEach((cp) => { cp.value = c; });
    $$(".sws i").forEach((i) => i.classList.toggle("on", i.dataset.c === c));
  }

  const gradientStart = $("#draw-grad-start");
  const gradientEnd = $("#draw-grad-end");
  $$("[data-gradient-start]").forEach((button) => {
    button.onclick = () => {
      if (gradientStart) gradientStart.value = button.dataset.gradientStart;
      if (gradientEnd) gradientEnd.value = button.dataset.gradientEnd;
    };
  });
  if ($("#apply-draw-gradient")) {
    $("#apply-draw-gradient").onclick = () => {
      const context = K().frames[0].getContext("2d");
      const pixels = context.getImageData(0, 0, S.size, S.size).data;
      let hasPaint = false;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i]) {
          hasPaint = true;
          break;
        }
      }
      if (!hasPaint) {
        toast("Draw a shape first, then apply a gradient to its painted pixels.");
        return;
      }
      hpush("apply_draw_gradient");
      const gradient = context.createLinearGradient(0, S.size, S.size, 0);
      gradient.addColorStop(0, gradientStart?.value || "#00e5ff");
      gradient.addColorStop(1, gradientEnd?.value || "#ff7a18");
      context.globalCompositeOperation = "source-in";
      context.fillStyle = gradient;
      context.fillRect(0, 0, S.size, S.size);
      context.globalCompositeOperation = "source-over";
      thumbs();
      draw();
      toast("Gradient applied to the drawn shape.");
    };
  }

  addEventListener("keydown", (e) => {
    const t = e.target.tagName;
    if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT" || e.target.isContentEditable) return;
    const ctrl = e.ctrlKey || e.metaKey, key = e.key.toLowerCase();
    if (ctrl && !e.shiftKey && !e.altKey && S.tab === "animated" && K().animated && key === "c") {
      e.preventDefault();
      copyCurrentFrame();
    } else if (ctrl && !e.shiftKey && !e.altKey && S.tab === "animated" && K().animated && key === "v") {
      e.preventDefault();
      pasteCurrentFrame();
    } else if (ctrl && key === "z" && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if (ctrl && (key === "y" || (key === "z" && e.shiftKey))) {
      e.preventDefault();
      redo();
    } else if (key === "escape") {
      closeMenu();
    } else if ((S.tab === "draw" || S.tab === "animated") && !ctrl) {
      const m = { b: "pen", e: "erase", g: "fill", i: "pick", h: "hot" }[key];
      if (m) setTool(m);
      if (key === "[") setBrush(S.brush - 1);
      if (key === "]") setBrush(S.brush + 1);
    }
  });

  const rm = $("#rm"), pw = $("#pw");
  const MENU = ["con", "brt", "sat", "blr", "rot", "glow", "col"];
  const MLAB = { con: "CON", brt: "BRT", sat: "SAT", blr: "BLR", rot: "ROT", glow: "GLOW", col: "COLOR" };
  const OPS = {
    con: { t: "Contrast", c: [{ k: "v", l: "Amount", min: -100, max: 100, v: 0 }] },
    brt: { t: "Brightness", c: [{ k: "v", l: "Amount", min: -100, max: 100, v: 0 }] },
    sat: { t: "Saturation", c: [{ k: "v", l: "Amount", min: -100, max: 100, v: 0 }] },
    blr: { t: "Blur", c: [{ k: "v", l: "Radius", min: 0, max: 5, v: 1 }] },
    rot: { t: "Rotate", c: [{ k: "a", l: "Angle", min: -180, max: 180, v: 0 }] },
    glow: { t: "Glow", c: [{ k: "color", l: "Color", type: "color", v: "#00e5ff" }, { k: "size", l: "Size", min: 0, max: 16, v: 6 }, { k: "str", l: "Strength", min: 1, max: 4, v: 2 }] },
    col: { t: "Change color", c: [{ k: "h", l: "Hue shift", min: -180, max: 180, v: 0 }, { k: "tc", l: "Tint color", type: "color", v: "#ff7a18" }, { k: "t", l: "Tint amount", min: 0, max: 100, v: 0 }] },
  };

  if (rm) {
    const sp = (a0, a1, r0, r1) => {
      const p = (a, r) => [Math.cos(a) * r, Math.sin(a) * r], A = p(a0, r1), B = p(a1, r1), C = p(a1, r0), D = p(a0, r0);
      return "M" + A + "A" + r1 + " " + r1 + " 0 0 1 " + B + "L" + C + "A" + r0 + " " + r0 + " 0 0 0 " + D + "Z";
    };
    let h = '<svg viewBox="-105 -105 210 210"><defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f6bff"/><stop offset="1" stop-color="#ff7a18"/></linearGradient></defs><circle r="102" class="bgc"/>';
    const st = (2 * Math.PI) / 7;
    MENU.forEach((o, i) => {
      const a0 = -Math.PI / 2 + i * st + 0.03, a1 = -Math.PI / 2 + (i + 1) * st - 0.03, am = (a0 + a1) / 2;
      h += '<path class="sec" data-i="' + i + '" d="' + sp(a0, a1, 38, 98) + '"/><text class="lb" x="' + Math.cos(am) * 68 + '" y="' + Math.sin(am) * 68 + '">' + MLAB[o] + '</text>';
    });
    h += '<circle class="ctr" r="31" id="rmC"/><text class="lb" y="-3">PART</text><text class="sub" y="9" id="rmS"></text></svg>';
    rm.innerHTML = h;
    rm.querySelectorAll(".sec").forEach((p) => (p.onclick = () => choose(+p.dataset.i)));
    const rmC = $("#rmC");
    if (rmC) rmC.onclick = () => closeMenu();
  }

  function selectPart(cell) {
    const s = K(), z = S.size, d = s.frames[S.cur].getContext("2d").getImageData(0, 0, z, z).data;
    const A = (x, y) => (x >= 0 && y >= 0 && x < z && y < z ? d[(y * z + x) * 4 + 3] : 0);
    let sx = -1, sy = -1;
    for (let r = 0; r <= 3 && sx < 0; r++) {
      for (let dy = -r; dy <= r && sx < 0; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
          if (A(cell[0] + dx, cell[1] + dy) > 8) {
            sx = cell[0] + dx;
            sy = cell[1] + dy;
            break;
          }
        }
      }
    }
    const m = new Uint8Array(z * z);
    let n = 0, whole = false;
    if (sx < 0) {
      whole = true;
      for (let i = 0; i < z * z; i++) {
        if (d[i * 4 + 3] > 8) {
          m[i] = 1;
          n++;
        }
      }
    } else {
      const st = [[sx, sy]];
      m[sy * z + sx] = 1;
      n = 1;
      while (st.length) {
        const [x, y] = st.pop();
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const a = x + dx, b = y + dy;
            if (a < 0 || b < 0 || a >= z || b >= z || m[b * z + a] || d[(b * z + a) * 4 + 3] <= 8) continue;
            m[b * z + a] = 1;
            n++;
            st.push([a, b]);
          }
        }
      }
    }
    if (!n) return false;
    const L = blank(), B = blank(), li = L.getContext("2d").createImageData(z, z), bi = B.getContext("2d").createImageData(z, z), seg = [];
    let x0 = z, x1 = 0, y0 = z, y1 = 0;
    for (let i = 0; i < z * z; i++) {
      const x = i % z, y = (i / z) | 0, t = m[i] ? li : bi;
      for (let c = 0; c < 4; c++) t.data[i * 4 + c] = d[i * 4 + c];
      if (m[i]) {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
        const o = (a, b) => a < 0 || b < 0 || a >= z || b >= z || !m[b * z + a];
        if (o(x - 1, y)) seg.push([x, y, x, y + 1]);
        if (o(x + 1, y)) seg.push([x + 1, y, x + 1, y + 1]);
        if (o(x, y - 1)) seg.push([x, y, x + 1, y]);
        if (o(x, y + 1)) seg.push([x, y + 1, x + 1, y + 1]);
      }
    }
    L.getContext("2d").putImageData(li, 0, 0);
    B.getContext("2d").putImageData(bi, 0, 0);
    S.sel = { m, n, whole, seg };
    M = { k: S.k, idx: S.cur, base: B, layer: L, cx: (x0 + x1 + 1) / 2, cy: (y0 + y1 + 1) / 2, pre: snap() };
    return true;
  }

  function openMenu(x, y, cell) {
    if (!selectPart(cell)) return false;
    S.selShow = true;
    const w = innerWidth, h = innerHeight;
    M.mx = Math.min(w - 110, Math.max(110, x));
    M.my = Math.min(h - 110, Math.max(110, y));
    rm.style.left = M.mx + "px";
    rm.style.top = M.my + "px";
    const rmS = $("#rmS");
    if (rmS) rmS.textContent = S.sel.whole ? "whole drawing" : S.sel.n + " px";
    rm.classList.add("on");
    draw();
    return true;
  }

  function secAt(cx, cy) {
    if (!M) return -1;
    const dx = cx - M.mx, dy = cy - M.my, r = Math.hypot(dx, dy);
    if (r < 34 || r > 104) return -1;
    return Math.floor((((Math.atan2(dy, dx) + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI)) * 7);
  }

  function hoverSec(cx, cy) {
    const i = secAt(cx, cy);
    rm.querySelectorAll(".sec").forEach((p) => p.classList.toggle("hov", +p.dataset.i === i));
  }

  function revert() {
    const g = S.slots[M.k].frames[M.idx].getContext("2d");
    g.clearRect(0, 0, S.size, S.size);
    g.drawImage(M.base, 0, 0);
    g.drawImage(M.layer, 0, 0);
  }

  function closeMenu() {
    if (!M) return;
    if (pw && pw.classList.contains("on")) revert();
    if (rm) rm.classList.remove("on");
    if (pw) pw.classList.remove("on");
    M = null;
    S.sel = null;
    draw();
  }

  function choose(i) {
    if (!M) return;
    rm.classList.remove("on");
    showPanel(MENU[i]);
  }

  function blur(d, z, n) {
    let a = new Float32Array(z * z * 4);
    for (let i = 0; i < z * z; i++) {
      const al = d[i * 4 + 3] / 255;
      a[i * 4] = d[i * 4] * al;
      a[i * 4 + 1] = d[i * 4 + 1] * al;
      a[i * 4 + 2] = d[i * 4 + 2] * al;
      a[i * 4 + 3] = d[i * 4 + 3];
    }
    for (; n > 0; n--) {
      const b = new Float32Array(a.length);
      for (let y = 0; y < z; y++) {
        for (let x = 0; x < z; x++) {
          for (let c = 0; c < 4; c++) {
            let s = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const X = x + dx, Y = y + dy;
                if (X >= 0 && Y >= 0 && X < z && Y < z) s += a[(Y * z + X) * 4 + c];
              }
            }
            b[(y * z + x) * 4 + c] = s / 9;
          }
        }
      }
      a = b;
    }
    for (let i = 0; i < z * z; i++) {
      const al = a[i * 4 + 3];
      if (al < 1) {
        d[i * 4 + 3] = 0;
        continue;
      }
      const k = 255 / al;
      d[i * 4] = Math.min(255, a[i * 4] * k);
      d[i * 4 + 1] = Math.min(255, a[i * 4] * k);
      d[i * 4 + 2] = Math.min(255, a[i * 4] * k);
      d[i * 4 + 3] = al;
    }
  }

  function runOp(op, p) {
    const z = S.size, L = M.layer, out = blank(), g = out.getContext("2d"), px = S.slots[M.k].spec.style === "pixel";
    if (op === "rot") {
      g.imageSmoothingEnabled = !px;
      g.translate(M.cx, M.cy);
      g.rotate((p.a * Math.PI) / 180);
      g.translate(-M.cx, -M.cy);
      g.drawImage(L, 0, 0);
      return out;
    }
    if (op === "glow") {
      g.shadowColor = p.color;
      g.shadowBlur = (p.size * z) / 32;
      for (let i = 0; i < p.str; i++) g.drawImage(L, 0, 0);
      g.shadowBlur = 0;
      g.drawImage(L, 0, 0);
      return out;
    }
    const im = L.getContext("2d").getImageData(0, 0, z, z), d = im.data;
    if (op === "blr") blur(d, z, p.v);
    else {
      const th = ((p.h || 0) * Math.PI) / 180, c = Math.cos(th), s = Math.sin(th), tc = hex2rgb(p.tc || "#000000"), tl = 0.3 * tc[0] + 0.59 * tc[1] + 0.11 * tc[2] || 1, tk = (p.t || 0) / 100;
      for (let i = 0; i < d.length; i += 4) {
        if (!d[i + 3]) continue;
        let r = d[i], gg = d[i + 1], b = d[i + 2];
        if (op === "brt") {
          const v = p.v * 2.55;
          r += v;
          gg += v;
          b += v;
        } else if (op === "con") {
          const C = p.v * 2.55, f = (259 * (C + 255)) / (255 * (259 - C));
          r = f * (r - 128) + 128;
          gg = f * (gg - 128) + 128;
          b = f * (b - 128) + 128;
        } else if (op === "sat") {
          const y = 0.3 * r + 0.59 * gg + 0.11 * b, k = 1 + p.v / 100;
          r = y + (r - y) * k;
          gg = y + (gg - y) * k;
          b = y + (b - y) * k;
        } else if (op === "col") {
          const R0 = r, G0 = gg, B0 = b;
          r = R0 * (0.213 + c * 0.787 - s * 0.213) + G0 * (0.715 - c * 0.715 - s * 0.715) + B0 * (0.072 - c * 0.072 + s * 0.928);
          gg = R0 * (0.213 - c * 0.213 + s * 0.143) + G0 * (0.715 + c * 0.285 + s * 0.140) + B0 * (0.072 - c * 0.072 - s * 0.283);
          b = R0 * (0.213 - c * 0.213 - s * 0.787) + G0 * (0.715 - c * 0.715 + s * 0.715) + B0 * (0.072 + c * 0.928 + s * 0.072);
          if (tk > 0) {
            const y = 0.3 * r + 0.59 * gg + 0.11 * b, k = Math.min(2.2, y / tl);
            r += (tc[0] * k - r) * tk;
            gg += (tc[1] * k - gg) * tk;
            b += (tc[2] * k - b) * tk;
          }
        }
        d[i] = Math.max(0, Math.min(255, r));
        d[i + 1] = Math.max(0, Math.min(255, gg));
        d[i + 2] = Math.max(0, Math.min(255, b));
      }
    }
    g.putImageData(im, 0, 0);
    return out;
  }

  function showPanel(op) {
    const o = OPS[op], P = {};
    let h = '<div class="ph"><button class="bk" id="pbk" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><b>' + o.t + '</b></div>';
    o.c.forEach((c) => {
      P[c.k] = c.v;
      h += c.type === "color"
        ? '<div class="pr"><span>' + c.l + '</span><input type="color" data-k="' + c.k + '" value="' + c.v + '"></div>'
        : '<div class="pr"><span>' + c.l + '</span><input type="range" data-k="' + c.k + '" min="' + c.min + '" max="' + c.max + '" step="1" value="' + c.v + '"><em>' + c.v + '</em></div>';
    });
    h += '<div class="row" style="margin-top:12px"><button class="btn pri sm" id="pap">Apply</button><button class="btn sm" id="prs">Reset</button></div>';
    pw.innerHTML = h;
    pw.style.left = Math.min(innerWidth - 140, Math.max(140, M.mx)) + "px";
    pw.style.top = Math.min(innerHeight - 130, Math.max(130, M.my)) + "px";
    pw.classList.add("on");
    S.selShow = false;
    const run = () => {
      const g = S.slots[M.k].frames[M.idx].getContext("2d");
      g.clearRect(0, 0, S.size, S.size);
      g.drawImage(M.base, 0, 0);
      g.drawImage(runOp(op, P), 0, 0);
      draw();
    };
    pw.querySelectorAll("input").forEach((i) => (i.oninput = () => {
      P[i.dataset.k] = i.type === "color" ? i.value : +i.value;
      if (i.nextElementSibling) i.nextElementSibling.textContent = i.value;
      run();
    }));
    $("#pbk").onclick = () => {
      revert();
      pw.classList.remove("on");
      S.selShow = true;
      rm.classList.add("on");
      draw();
    };
    $("#pap").onclick = () => {
      U.push(M.pre);
      Rd.length = 0;
      Hl.tag = null;
      pw.classList.remove("on");
      M = null;
      S.sel = null;
      draw();
    };
    $("#prs").onclick = () => {
      o.c.forEach((c) => { P[c.k] = c.v; });
      pw.querySelectorAll("input").forEach((i) => {
        i.value = P[i.dataset.k];
        if (i.nextElementSibling) i.nextElementSibling.textContent = i.value;
      });
      run();
    };
    run();
  }

  document.addEventListener("pointerdown", (e) => {
    if (M && !e.target.closest("#rm,#pw") && e.target !== ed) closeMenu();
  });

  function setTab(v) {
    closeMenu();
    const prevTab = S.tab;
    if (prevTab && TAB_WORKSPACES[prevTab]) {
      TAB_WORKSPACES[prevTab].slots = S.slots;
      TAB_WORKSPACES[prevTab].cur = S.cur;
      TAB_WORKSPACES[prevTab].k = S.k;
    }
    S.tab = v;
    if (TAB_WORKSPACES[v]) {
      S.slots = TAB_WORKSPACES[v].slots;
      S.cur = TAB_WORKSPACES[v].cur;
      S.k = TAB_WORKSPACES[v].k || "cursor";
    }
    ed = editors[v] || editors.generate;
    ex = ed ? ed.getContext("2d") : null;
    S.playing = false;
    S.loopStartedAt = null;
    S.loopReturnFrame = null;
    const playText = $("#btn-toggle-play-text");
    const playBtn = $("#btn-toggle-play");
    if (playBtn) playBtn.classList.remove("pri");
    if (playText) playText.textContent = "Play Loop";
    if (v === "draw") {
      Object.values(S.slots).forEach((slot) => { slot.animated = false; });
      S.cur = 0;
    }
    $$(".view").forEach((x) => x.classList.toggle("on", x.id === "v-" + v));
    const descBox = $("#describe-box");
    if (descBox) descBox.style.display = v === "generate" ? "flex" : "none";
    if (ed) ed.style.cursor = v === "draw" ? "crosshair" : "default";
    buildTh();
    thumbs();
    sync();
    draw();
  }
  window._setStudioTab = setTab;
  window._refreshStudioTheme = () => {
    chk = null;
    chkS = 0;
    chkTheme = "";
    draw();
  };

  // Dual Canvas Slots Renderer (2 Dedicated Grids)
  const sl = $("#slots"), slotCv = {}, slotHoverStart = Object.create(null);
  if (sl) {
    sl.innerHTML = "";
    Object.entries(SLOTS).forEach(([k, n]) => {
      const isCur = k === "cursor";
      const card = document.createElement("div");
      card.className = "canvas-slot-grid-card" + (S.k === k ? " on" : "");
      card.dataset.k = k;
      card.innerHTML =
        '<div class="slot-grid-header">' +
          '<div class="slot-grid-title">' +
            '<span class="slot-grid-dot"></span>' +
            '<b>' + n + '</b>' +
          '</div>' +
          '<span class="slot-grid-badge">' + (S.k === k ? "Editing" : "Switch") + '</span>' +
        '</div>' +
        '<div class="slot-grid-canvas-wrap">' +
          '<canvas width="48" height="48"></canvas>' +
        '</div>' +
        '<div class="slot-grid-actions">' +
          '<button type="button" class="btn sm slot-dl-btn" data-slot="' + k + '" aria-label="Download ' + (S.slots[k]?.animated ? ".ani" : ".cur") + '">' +
            downloadIconSvg +
          '</button>' +
        '</div>';
      const slotTitle = card.querySelector(".slot-grid-title");
      if (slotTitle) {
        slotTitle.setAttribute("role", "button");
        slotTitle.setAttribute("tabindex", "0");
        slotTitle.setAttribute("aria-label", "Select " + (isCur ? "Arrow" : "Hand"));
        slotTitle.setAttribute("aria-pressed", String(S.k === k));
        slotTitle.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            card.click();
          }
        });
      }
      slotCv[k] = card.querySelector("canvas");
      card.addEventListener("pointerenter", () => {
        slotHoverStart[k] = performance.now();
        lastSlotFrame[k] = null;
        lastSlotRender[k] = -Infinity;
      });
      card.addEventListener("pointerleave", () => {
        delete slotHoverStart[k];
        lastSlotFrame[k] = null;
        lastSlotRender[k] = -Infinity;
      });

      // Click card to switch slot
      card.onclick = (e) => {
        if (e.target.closest(".slot-dl-btn")) return;
        closeMenu();
        S.k = k;
        S.cur = 0;
        sync();
        draw();
      };

      // Click download button under this grid
      const dlBtn = card.querySelector(".slot-dl-btn");
      if (dlBtn) {
        dlBtn.dataset.extension = S.slots[k]?.animated ? ".ani" : ".cur";
        dlBtn.onclick = (e) => {
          e.stopPropagation();
          dl(new Blob([sbytes(k)]), fname(k));
          toast("Downloaded " + n + " (" + fname(k) + ")");
        };
      }

      sl.appendChild(card);
    });
  }

  $$("[data-size]").forEach((b) => (b.onclick = () => {
    const n = +b.dataset.size;
    if (n === S.size) return;
    closeMenu();
    hpush();
    S.size = n;
    regenAll();
    sync();
    draw();
  }));

  const presetsC = $("#presets");
  let generatedPresetSpec = null;
  let generatedPresetButton = null;
  function addGeneratedPreset(name, spec) {
    if (!presetsC) return;
    generatedPresetSpec = {
      ...spec,
      parts: [...spec.parts],
      fx: [...spec.fx],
      ...(Array.isArray(spec.customPoints) ? { customPoints: spec.customPoints.map((point) => [...point]) } : {})
    };
    if (!generatedPresetButton) {
      generatedPresetButton = document.createElement("button");
      generatedPresetButton.type = "button";
      generatedPresetButton.className = "btn sm ai-generated-preset";
      generatedPresetButton.dataset.preset = "ai-generated";
      generatedPresetButton.onclick = () => {
        if (!generatedPresetSpec) return;
        presetsC.querySelectorAll(".btn").forEach((preset) => preset.setAttribute("aria-pressed", "false"));
        generatedPresetButton.setAttribute("aria-pressed", "true");
        upd((sp) => {
          delete sp.customPoints;
          Object.assign(sp, generatedPresetSpec, {
            parts: [...generatedPresetSpec.parts],
            fx: [...generatedPresetSpec.fx],
            seed: 7
          });
        });
      };
      presetsC.appendChild(generatedPresetButton);
    }
    generatedPresetButton.textContent = name;
    generatedPresetButton.title = `Apply AI preset: ${name}`;
    generatedPresetButton.setAttribute("aria-label", `Apply AI preset: ${name}`);
    generatedPresetButton.setAttribute("aria-pressed", "false");
  }

  if (presetsC) {
    presetsC.innerHTML = "";
    Object.entries(PRESETS).forEach(([k, [l, p]]) => {
      const b = document.createElement("button");
      b.className = "btn sm";
      b.textContent = l;
      b.dataset.preset = k;
      b.setAttribute("aria-pressed", "false");
      b.style.setProperty("--preset-start", p.a);
      b.style.setProperty("--preset-end", p.b);
      b.onclick = () => {
        presetsC.querySelectorAll(".btn").forEach((preset) => preset.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        upd((sp) => Object.assign(sp, p, { parts: [...p.parts], fx: [...p.fx], seed: 7 }));
      };
      presetsC.appendChild(b);
    });
  }

  function chips(id, list, key) {
    const container = $(id);
    if (!container) return;
    container.innerHTML = "";
    list.forEach(([k, l]) => {
      const b = document.createElement("button");
      b.className = "btn sm";
      b.textContent = l;
      b.dataset.k = k;
      b.onclick = () => upd((sp) => {
        const a = sp[key], i = a.indexOf(k);
        i < 0 ? a.push(k) : a.splice(i, 1);
      });
      container.appendChild(b);
    });
  }

  chips("#partsC", PARTS, "parts");
  chips("#fxC", FX, "fx");

  const shapeContainer = $("#shapeC");
  if (shapeContainer) {
    SHAPES.forEach(([shape, label]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn sm";
      button.textContent = label;
      button.dataset.shape = shape;
      button.setAttribute("aria-pressed", "false");
      button.onclick = () => upd((sp) => {
        sp.shape = shape;
        delete sp.customPoints;
      });
      shapeContainer.appendChild(button);
    });
  }

  function buildCols(selector, prefix) {
    const cEl = $(selector);
    if (!cEl) return;
    cEl.innerHTML = "";
    COLS.forEach(([k, l]) => {
      const w = document.createElement("label");
      w.className = "cl";
      w.innerHTML = '<input type="color" id="' + prefix + k + '">' + l;
      w.firstChild.oninput = (e) => upd((sp) => (sp[k] = e.target.value));
      cEl.appendChild(w);
    });
  }
  buildCols("#cols", "c_");
  buildCols("#cols-ani", "ca_");

  $$("[data-style]").forEach((b) => (b.onclick = () => upd((sp) => (sp.style = b.dataset.style))));

  if ($("#kOw")) kn.ow = knob($("#kOw"), { linear: true, label: "Outline width", min: 0, max: 7, step: 0.5, val: 5, fmt: (v) => `${v} px`, onInput: (v) => upd((sp) => (sp.ow = v)) });
  if ($("#kGa")) kn.ga = knob($("#kGa"), {
    linear: true,
    label: "Glow strength",
    min: 0,
    max: 100,
    step: 5,
    val: 80,
    fmt: (v) => `${v}%`,
    onInput: (v) => upd((sp) => (sp.glowAmt = v / 100)),
    onDisplay: (_, progress) => {
      document
        .querySelector(".studio-section[data-studio-tab='generate'] .canvas-stage-wrap")
        ?.style.setProperty("--cursor-preview-glow", `${Math.round(progress * 32)}px`);
    },
  });
  if ($("#btn-remove-glow")) {
    $("#btn-remove-glow").onclick = () => upd((sp) => (sp.glowAmt = 0));
  }
  if ($("#btn-remove-outline")) {
    $("#btn-remove-outline").onclick = () => upd((sp) => (sp.ow = 0));
  }
  if ($("#kDur")) kn.du = knob($("#kDur"), {
    label: "Frame time (ms)",
    min: 40,
    max: 400,
    step: 10,
    val: 120,
    onInput: (v) => {
      S.dur = v;
      updateFrameRate();
    }
  });

  const onLinkChange = (e) => {
    S.link = e.target.checked;
    if ($("#link")) $("#link").checked = S.link;
    if ($("#link-ani")) $("#link-ani").checked = S.link;
    if (S.link) upd(() => {});
  };
  if ($("#link")) $("#link").onchange = onLinkChange;
  if ($("#link-ani")) $("#link-ani").onchange = onLinkChange;

  // Send to Animated button in Generate View prompt box
  const btnSendAnim = $("#btn-send-to-anim");
  if (btnSendAnim) {
    btnSendAnim.onclick = () => {
      const srcK = K();
      const animWs = TAB_WORKSPACES["animated"];
      if (animWs && animWs.slots.cursor) {
        const dest = animWs.slots.cursor;
        dest.animated = true;
        dest.isManual = true;
        dest.hot = [...srcK.hot];
        dest.frameSpecs = Array.from({ length: 3 }, () => cloneSpec(srcK.spec));
        for (let i = 0; i < 3; i++) {
          const dg = dest.frames[i].getContext("2d");
          dg.clearRect(0, 0, S.size, S.size);
          dg.imageSmoothingEnabled = false;
          dg.drawImage(srcK.frames[i], 0, 0);
        }
        if (S.link && animWs.slots.pointer) {
          const ptr = animWs.slots.pointer;
          ptr.animated = true;
          ptr.isManual = true;
          ptr.hot = [...srcK.hot];
          ptr.frameSpecs = Array.from({ length: 3 }, () => cloneSpec(ptr.spec));
          for (let i = 0; i < 3; i++) {
            const dg = ptr.frames[i].getContext("2d");
            dg.clearRect(0, 0, S.size, S.size);
            dg.imageSmoothingEnabled = false;
            dg.drawImage(srcK.frames[i], 0, 0);
          }
        }
      }
      toast("Transferred cursor frames to Animated Studio!");
      if (window._reactSetActiveTab) {
        window._reactSetActiveTab("animated");
      }
      setTab("animated");
    };
  }

  // AI Generation Loading Functions
  window._loadAiGenItem = (item) => {
    if (!item || !item.frames) return;
    const genWs = TAB_WORKSPACES["generate"];
    const targetSlot = (S.tab === "generate" ? S.slots.cursor : genWs.slots.cursor);
    targetSlot.isManual = true;
    targetSlot.animated = !!item.isAni;
    if (item.hot) targetSlot.hot = [...item.hot];
    item.frames.forEach((dataUrl, idx) => {
      if (idx < 3 && dataUrl) {
        const img = new Image();
        img.onload = () => {
          const g = targetSlot.frames[idx].getContext("2d");
          g.clearRect(0, 0, S.size, S.size);
          g.imageSmoothingEnabled = false;
          g.drawImage(img, 0, 0, S.size, S.size);
          if (idx === 0) {
            buildTh();
            thumbs();
            draw();
          }
        };
        img.src = dataUrl;
      }
    });
    toast(`Loaded "${item.title}" into Generate Studio`);
    if (window._reactSetActiveTab) {
      window._reactSetActiveTab("generate");
    }
    if (S.tab !== "generate") {
      setTab("generate");
    } else {
      buildTh();
      thumbs();
      sync();
      draw();
    }
  };

  window._sendAiGenToAnimated = (item) => {
    if (!item || !item.frames) return;
    const animWs = TAB_WORKSPACES["animated"];
    const targetSlot = animWs.slots.cursor;
    targetSlot.isManual = true;
    targetSlot.animated = true;
    targetSlot.frameSpecs = Array.from({ length: 3 }, () => cloneSpec(targetSlot.spec));
    if (item.hot) targetSlot.hot = [...item.hot];
    item.frames.forEach((dataUrl, idx) => {
      if (idx < 3 && dataUrl) {
        const img = new Image();
        img.onload = () => {
          const g = targetSlot.frames[idx].getContext("2d");
          g.clearRect(0, 0, S.size, S.size);
          g.imageSmoothingEnabled = false;
          g.drawImage(img, 0, 0, S.size, S.size);
          if (idx === 0) {
            buildTh();
            thumbs();
            draw();
          }
        };
        img.src = dataUrl;
      }
    });
    toast(`Sent "${item.title}" to Animated Studio`);
    if (window._reactSetActiveTab) {
      window._reactSetActiveTab("animated");
    }
    setTab("animated");
  };

  const dataUrlToU8 = (dataUrl) => {
    const parts = (dataUrl || "").split(",");
    const raw = atob(parts[1] || parts[0] || "");
    const u8 = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      u8[i] = raw.charCodeAt(i);
    }
    return u8;
  };

  window._downloadSavedZip = (item) => {
    if (!item) return;
    try {
      const enc = (s) => new TextEncoder().encode(s);
      const files = [];
      const baseName = (item.title || "custom_cursor").replace(/\s+/g, "_");

      if (item.frames && item.frames.length > 0) {
        item.frames.forEach((fUrl, idx) => {
          if (fUrl) {
            files.push({
              name: `${baseName}_frame_${idx + 1}.png`,
              data: dataUrlToU8(fUrl)
            });
          }
        });
      } else if (item.png || item.gif) {
        files.push({
          name: `${baseName}.png`,
          data: dataUrlToU8(item.png || item.gif)
        });
      }

      if (item.pointer_frames && item.pointer_frames.length > 0) {
        item.pointer_frames.forEach((fUrl, idx) => {
          if (fUrl) {
            files.push({
              name: `${baseName}_pointer_frame_${idx + 1}.png`,
              data: dataUrlToU8(fUrl)
            });
          }
        });
      } else if (item.pointer_png) {
        files.push({
          name: `${baseName}_pointer.png`,
          data: dataUrlToU8(item.pointer_png)
        });
      }

      if (item.ani) {
        files.push({
          name: `${baseName}.ani`,
          data: dataUrlToU8(item.ani)
        });
      }
      if (item.cur) {
        files.push({
          name: `${baseName}.cur`,
          data: dataUrlToU8(item.cur)
        });
      }

      const readme = `CURSOR SET - CURSORS U\r\n\r\nName: ${item.title}\r\nAnimated: ${item.is_animated ? "Yes" : "No"}\r\nFrames: ${item.frames ? item.frames.length : 1}\r\n\r\nCreated with cursors U by Yasser-27\r\nhttps://github.com/YASSER-27`;
      files.push({
        name: "README.txt",
        data: enc(readme)
      });

      const zipBlob = new Blob([zip(files)], { type: "application/zip" });
      dl(zipBlob, `${baseName}_full_pack.zip`);
      toast("Downloaded full cursor pack (.ZIP) with all frames");
    } catch (err) {
      toast("Error downloading ZIP: " + err.message);
    }
  };

  window._loadSavedIntoStudio = (item, targetTab) => {
    if (!item) return;
    const tab = targetTab || (item.is_animated ? "animated" : "draw");
    const ws = TAB_WORKSPACES[tab];
    if (!ws) return;

    const targetCur = ws.slots.cursor;
    const targetPtr = ws.slots.pointer;

    targetCur.animated = !!item.is_animated;
    targetCur.isManual = true;
    if (item.hot) targetCur.hot = [...item.hot];
    if (item.dur) S.dur = item.dur;
    if (item.spec) targetCur.spec = JSON.parse(JSON.stringify(item.spec));
    if (tab === "animated") targetCur.frameSpecs = Array.from({ length: 3 }, () => cloneSpec(targetCur.spec));

    if (targetPtr) {
      targetPtr.animated = !!item.is_animated;
      targetPtr.isManual = true;
      if (item.pointer_hot) targetPtr.hot = [...item.pointer_hot];
      if (item.spec) targetPtr.spec = { ...item.spec, shape: "hand" };
      if (tab === "animated") targetPtr.frameSpecs = Array.from({ length: 3 }, () => cloneSpec(targetPtr.spec));
    }

    const curFrames = (item.frames && item.frames.length > 0) ? item.frames : [item.png || item.gif];
    curFrames.forEach((dataUrl, idx) => {
      if (idx < 3 && dataUrl) {
        const img = new Image();
        img.onload = () => {
          const g = targetCur.frames[idx].getContext("2d");
          g.clearRect(0, 0, S.size, S.size);
          g.imageSmoothingEnabled = false;
          g.drawImage(img, 0, 0, S.size, S.size);
          if (idx === 0) {
            buildTh();
            thumbs();
            draw();
          }
        };
        img.src = dataUrl;
      }
    });

    if (targetPtr) {
      const ptrFrames = (item.pointer_frames && item.pointer_frames.length > 0)
        ? item.pointer_frames
        : (item.pointer_png ? [item.pointer_png] : []);
      ptrFrames.forEach((dataUrl, idx) => {
        if (idx < 3 && dataUrl) {
          const img = new Image();
          img.onload = () => {
            const g = targetPtr.frames[idx].getContext("2d");
            g.clearRect(0, 0, S.size, S.size);
            g.imageSmoothingEnabled = false;
            g.drawImage(img, 0, 0, S.size, S.size);
            thumbs();
          };
          img.src = dataUrl;
        }
      });
    }

    if (window._setStudioTab) {
      window._setStudioTab(tab);
    }
  };

  if ($("#animSw")) $("#animSw").onchange = (e) => {
    hpush();
    const k = K();
    S.playing = false;
    S.loopStartedAt = null;
    S.loopReturnFrame = null;
    const playBtn = $("#btn-toggle-play");
    const playText = $("#btn-toggle-play-text");
    if (playBtn) playBtn.classList.remove("pri");
    if (playText) playText.textContent = "Play Loop";
    k.animated = e.target.checked;
    if (k.animated) {
      ensureFrameSpecs(k);
      if (!k.spec.fx || k.spec.fx.length === 0) {
        k.spec.fx = ["pulse", "sparkle", "orbit"];
      }
      if (S.tab === "animated") k.frameSpecs[S.cur] = cloneSpec(k.spec);
      regenSlot(S.k, true);
    }
    S.cur = 0;
    buildTh();
    sync();
    draw();
  };

  const playBtn = $("#btn-toggle-play");
  const playText = $("#btn-toggle-play-text");
  if (playBtn) {
    playBtn.onclick = () => {
      if (!S.playing && !K().animated) {
        K().animated = true;
        if (S.tab === "animated") ensureFrameSpecs(K());
        if (!K().spec.fx || K().spec.fx.length === 0) {
          K().spec.fx = ["pulse", "sparkle", "orbit"];
        }
        if (S.tab === "animated") K().frameSpecs[S.cur] = cloneSpec(K().spec);
        if (!K().isManual) regenSlot(S.k, true);
        S.cur = 0;
        buildTh();
        sync();
      }
      if (S.playing) {
        S.cur = Number.isInteger(S.loopReturnFrame) ? S.loopReturnFrame : S.cur;
        S.playing = false;
        S.loopStartedAt = null;
        S.loopReturnFrame = null;
      } else {
        S.loopReturnFrame = S.cur;
        S.loopStartFrame = S.cur;
        S.loopStartedAt = performance.now();
        S.loopFrameIdx = S.cur;
        S.playing = true;
      }
      playBtn.classList.toggle("pri", S.playing);
      if (playText) playText.textContent = S.playing ? "Stop Loop" : "Play Loop";
      if (!S.playing) {
        sync();
        thumbs();
        draw();
      } else {
        draw(S.loopStartedAt);
      }
    };
  }

  if ($("#cpPrev")) $("#cpPrev").onclick = () => {
    if (S.cur < 1 || !K().animated) return;
    hpush();
    const g = K().frames[S.cur].getContext("2d");
    g.clearRect(0, 0, S.size, S.size);
    g.drawImage(K().frames[S.cur - 1], 0, 0);
    if (S.tab === "animated" && Array.isArray(K().frameSpecs)) {
      K().frameSpecs[S.cur] = cloneSpec(K().frameSpecs[S.cur - 1]);
      K().spec = cloneSpec(K().frameSpecs[S.cur]);
      sync();
    }
    draw();
  };

  if ($("#clr")) $("#clr").onclick = () => {
    hpush();
    K().frames[S.cur].getContext("2d").clearRect(0, 0, S.size, S.size);
    draw();
  };

  function buildTh() {
    const t = $("#th");
    if (!t) return;
    t.innerHTML = "";
    for (let i = 0; i < nF(); i++) {
      const d = document.createElement("div");
      d.className = "frame-thumb-card" + (i === S.cur ? " on" : "");
      d.title = "Click to select and edit Frame " + (i + 1);

      const c = document.createElement("canvas");
      c.width = c.height = 64;
      d.appendChild(c);

      const lbl = document.createElement("span");
      lbl.className = "frame-label";
      lbl.textContent = "F" + (i + 1);
      d.appendChild(lbl);

      d.onclick = () => {
        S.cur = i;
        S.playing = false;
        S.loopStartedAt = null;
        S.loopReturnFrame = null;
        S.loopFrameIdx = i;
        if (playBtn) playBtn.classList.remove("pri");
        if (playText) playText.textContent = "Play Loop";
        sync();
        thumbs();
        draw();
        toast("Selected Frame " + (i + 1) + " (Loop stopped for editing)");
      };
      t.appendChild(d);
    }
  }

  function updateFrameRate() {
    const rateEl = $("#live-anim-rate");
    if (rateEl) {
      rateEl.textContent = K().animated ? `${S.dur}ms (${Math.round(1000 / S.dur)} FPS)` : "Static (1 Frame)";
    }
  }

  function thumbs() {
    $$("#th .frame-thumb-card").forEach((d, i) => {
      d.classList.toggle("on", i === S.cur);
      const cv = d.querySelector("canvas");
      if (cv && K().frames[i]) {
        const g = cv.getContext("2d");
        g.clearRect(0, 0, 64, 64);
        g.imageSmoothingEnabled = false;
        g.drawImage(K().frames[i], 0, 0, 64, 64);
      }
    });
    updateFrameRate();
  }

  function sync() {
    const k = K();
    S.cur = Math.min(S.cur, nF() - 1);
    if (S.tab === "animated") {
      k.spec = cloneSpec(ensureFrameSpecs(k)[S.cur]);
    }
    const sp = k.spec;
    $$("#partsC .btn").forEach((b) => b.classList.toggle("on", sp.parts.includes(b.dataset.k)));
    $$("#fxC .btn").forEach((b) => b.classList.toggle("on", sp.fx.includes(b.dataset.k)));
    $$("[data-style]").forEach((b) => b.classList.toggle("on", b.dataset.style === sp.style));
    $$("#shapeC [data-shape]").forEach((b) => {
      const selected = b.dataset.shape === sp.shape;
      b.classList.toggle("on", selected);
      b.setAttribute("aria-pressed", String(selected));
    });
    $$("[data-size]").forEach((b) => b.classList.toggle("on", +b.dataset.size === S.size));
    COLS.forEach(([c]) => {
      const el = $("#c_" + c);
      if (el) el.value = sp[c];
      const elAni = $("#ca_" + c);
      if (elAni) elAni.value = sp[c];
    });
    if (kn.ow) kn.ow.set(sp.ow);
    if (kn.ga) kn.ga.set(Math.round(sp.glowAmt * 100));
    if ($("#btn-remove-outline")) $("#btn-remove-outline").disabled = sp.ow <= 0;
    if ($("#btn-remove-glow")) $("#btn-remove-glow").disabled = sp.glowAmt <= 0;
    if (kn.du) kn.du.set(S.dur);
    if ($("#animSw")) $("#animSw").checked = k.animated;
    if ($("#link")) $("#link").checked = S.link;
    if ($("#link-ani")) $("#link-ani").checked = S.link;
    $$(".canvas-slot-grid-card").forEach((b) => {
      const isAct = b.dataset.k === S.k;
      b.classList.toggle("on", isAct);
      const badge = b.querySelector(".slot-grid-badge");
      if (badge) badge.textContent = isAct ? "Editing" : "Switch";
      const slotTitle = b.querySelector(".slot-grid-title");
      if (slotTitle) slotTitle.setAttribute("aria-pressed", String(isAct));
      const dlBtn = b.querySelector(".slot-dl-btn");
      if (dlBtn) {
        const key = b.dataset.k;
        const isAni = S.slots[key]?.animated;
        dlBtn.dataset.extension = isAni ? ".ani" : ".cur";
        dlBtn.setAttribute("aria-label", "Download " + (isAni ? ".ani" : ".cur"));
        dlBtn.innerHTML = downloadIconSvg;
      }
    });
    const thW = $("#thW");
    if (thW) thW.style.display = "block";
    buildTh();
    thumbs();
  }

  const testPads = $$(".cursor-test-pad").map((test) => ({
    test,
    fk: test.querySelector(".cursor-test-preview"),
    padK: "cursor",
    lastTestCssCursorKey: null,
    lastCursorFrame: null,
    lastCursorRender: -Infinity,
    lastCursorSize: 0,
    lastCursorKey: null,
  }));
  const lastSlotFrame = Object.create(null);
  const lastSlotRender = Object.create(null);
  let lastLiveFrame = null;
  let lastLiveRender = -Infinity;
  let lastEditorFrame = null;
  let lastEditorRender = -Infinity;
  testPads.forEach((pad) => {
    const { test, fk } = pad;
    if (!fk) return;
    test.addEventListener("pointermove", (e) => {
      const r = test.getBoundingClientRect();
      pad.padK = e.target.closest(".lnk") ? "pointer" : "cursor";
      const slot = S.slots[pad.padK];
      const h = slot.hot;
      if (slot.animated) {
        test.style.cursor = "none";
        fk.style.display = "block";
        fk.style.left = e.clientX - r.left - h[0] + "px";
        fk.style.top = e.clientY - r.top - h[1] + "px";
        pad.lastTestCssCursorKey = null;
        return;
      }

      fk.style.display = "none";
      const cssCursorKey = `${pad.padK}:${S.size}:${h[0]}:${h[1]}`;
      if (cssCursorKey !== pad.lastTestCssCursorKey) {
        const cursorData = slot.frames[0].toDataURL("image/png");
        test.style.cursor = `url("${cursorData}") ${Math.round(h[0])} ${Math.round(h[1])}, auto`;
        pad.lastTestCssCursorKey = cssCursorKey;
      }
    });
    test.addEventListener("pointerleave", () => {
      fk.style.display = "none";
      test.style.cursor = "";
      pad.lastTestCssCursorKey = null;
    });
  });

  function frameAt(k, t) {
    const s = S.slots[k];
    if (!s?.frames?.length) return null;
    if (s.animated) {
      const duration = Math.max(1, S.dur);
      const frameIndex = Math.floor(Math.max(0, t) / duration) % s.frames.length;
      return s.frames[frameIndex] || s.frames[0];
    }
    return s.frames[0];
  }

  function loop(t) {
    for (const k in slotCv) {
      const cv = slotCv[k];
      if (!cv) continue;
      const hoverStart = slotHoverStart[k];
      const frame = hoverStart === undefined ? S.slots[k].frames[0] : frameAt(k, t - hoverStart);
      if (!frame) continue;
      if (lastSlotFrame[k] === frame && t - (lastSlotRender[k] || 0) < 250) continue;
      const c = cv.getContext("2d");
      const w = cv.width || 48;
      const h = cv.height || 48;
      c.clearRect(0, 0, w, h);
      c.imageSmoothingEnabled = false;
      c.drawImage(frame, 0, 0, w, h);
      lastSlotFrame[k] = frame;
      lastSlotRender[k] = t;
    }
    const liveAnimCv = $("#live-anim-cv");
    if (liveAnimCv) {
      const curF = frameAt(S.k, t);
      if (curF && (lastLiveFrame !== curF || t - lastLiveRender >= 250)) {
        const lctx = liveAnimCv.getContext("2d");
        lctx.clearRect(0, 0, 64, 64);
        lctx.imageSmoothingEnabled = false;
        lctx.drawImage(curF, 0, 0, 64, 64);
        lastLiveFrame = curF;
        lastLiveRender = t;
      }
    }
    const activeFrame = S.playing ? K().frames[loopFrameIndexAt(t)] : null;
    if (S.playing && activeFrame && (lastEditorFrame !== activeFrame || t - lastEditorRender >= 250)) {
      draw(t);
      lastEditorFrame = activeFrame;
      lastEditorRender = t;
    }
    testPads.forEach((pad) => {
      const { fk } = pad;
      if (fk && fk.style.display === "block") {
        const cursorFrame = frameAt(pad.padK, t);
        if (cursorFrame && (fk.width !== S.size || pad.lastCursorFrame !== cursorFrame ||
            pad.lastCursorSize !== S.size || pad.lastCursorKey !== pad.padK ||
            t - pad.lastCursorRender >= 250)) {
          if (fk.width !== S.size) fk.width = fk.height = S.size;
          const q = fk.getContext("2d");
          q.clearRect(0, 0, S.size, S.size);
          q.drawImage(cursorFrame, 0, 0);
          pad.lastCursorFrame = cursorFrame;
          pad.lastCursorSize = S.size;
          pad.lastCursorKey = pad.padK;
          pad.lastCursorRender = t;
        }
      }
    });
    requestAnimationFrame(loop);
  }

  function dl(b, n) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(b);
    a.download = n;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  const fname = (k) => (k === "cursor" ? "cursor" : "pointer") + (S.slots[k].animated ? ".ani" : ".cur");
  const sbytes = (k) => {
    const s = S.slots[k];
    return s.animated ? aniBytes(s.frames, s.hot, S.dur) : curBytes(s.frames[0], s.hot);
  };
  const png = (c) => new Promise((r) => c.toBlob((b) => b.arrayBuffer().then((a) => r(new Uint8Array(a)))));

  // Download Individual Files & Set Under Canvas
  if ($("#xcur")) {
    $("#xcur").onclick = () => {
      dl(new Blob([sbytes("cursor")]), fname("cursor"));
      toast("Downloaded Cursor (" + fname("cursor") + ")");
    };
  }
  if ($("#xptr")) {
    $("#xptr").onclick = () => {
      dl(new Blob([sbytes("pointer")]), fname("pointer"));
      toast("Downloaded Pointer (" + fname("pointer") + ")");
    };
  }
  if ($("#xpng")) {
    $("#xpng").onclick = () => {
      K().frames[S.cur].toBlob((b) => {
        dl(b, S.k + "-" + (S.cur + 1) + ".png");
        toast("Downloaded PNG frame");
      });
    };
  }

  async function zipAll() {
    const c = fname("cursor"), p = fname("pointer"), enc = (s) => new TextEncoder().encode(s);
    const readme = "CURSOR SET - CURSORS U\r\n\r\nFiles\r\n  " + c + "  Normal Select (arrow)\r\n  " + p + "  Link Select (hand)\r\n\r\nInstall on Windows\r\n  1. Extract the ZIP to a permanent folder.\r\n  2. Open Settings, Bluetooth and devices, Mouse, Additional mouse settings.\r\n  3. Open the Pointers tab.\r\n  4. Select Normal Select, click Browse, choose " + c + ".\r\n  5. Select Link Select, click Browse, choose " + p + ".\r\n  6. Click Apply.\r\n";
    dl(new Blob([zip([{ name: c, data: sbytes("cursor") }, { name: p, data: sbytes("pointer") }, { name: "cursor-preview.png", data: await png(S.slots.cursor.frames[0]) }, { name: "pointer-preview.png", data: await png(S.slots.pointer.frames[0]) }, { name: "README.txt", data: enc(readme) }])], { type: "application/zip" }), "cursor-set.zip");
    toast("Downloaded complete cursor set (.ZIP)");
  }

  if ($("#xzip")) $("#xzip").onclick = zipAll;

  // AI & Generator Configuration in Settings Modal
  const DEF = { claude: { model: "claude-3-5-sonnet-20241022" }, gemini: { model: "gemini-2.0-flash" }, openai: { model: "gpt-4o-mini", base: "https://api.openai.com/v1" } };
  let cfg = { prov: "gemini" };
  try {
    Object.assign(cfg, JSON.parse(localStorage.getItem("cursormaker2") || "{}"));
  } catch (e) {}

  const saveCfg = () => {
    try {
      localStorage.setItem("cursormaker2", JSON.stringify(cfg));
    } catch (e) {}
  };

  function fillModels(ids, sel) {
    const m = $("#model");
    if (!m) return;
    m.innerHTML = "";
    ids.forEach((id) => {
      const o = document.createElement("option");
      o.value = o.textContent = id;
      m.appendChild(o);
    });
    if (sel && ids.includes(sel)) m.value = sel;
    cfg[cfg.prov].model = m.value;
    saveCfg();
  }

  function loadProv() {
    const p = cfg.prov, c = (cfg[p] = Object.assign({}, DEF[p], cfg[p]));
    if ($("#prov")) $("#prov").value = p;
    if ($("#key")) $("#key").value = c.key || "";
    if ($("#base")) $("#base").value = c.base || "";
    if ($("#baseW")) $("#baseW").style.display = p === "openai" ? "" : "none";
    fillModels(c.model ? [c.model] : [], c.model);
    loadModels();
  }

  async function loadModels() {
    const p = cfg.prov, c = cfg[p], st = $("#mst");
    if (!st) return;
    st.classList.remove("err");
    if (p !== "openai" && !c.key) {
      st.textContent = "Enter your API key to list the available models.";
      return;
    }
    st.textContent = "Loading models...";
    try {
      let ids = [], r, j;
      if (p === "claude") {
        r = await fetch("https://api.anthropic.com/v1/models?limit=100", { headers: { "x-api-key": c.key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" } });
        if (!r.ok) throw new Error(await r.text());
        j = await r.json();
        ids = j.data.map((m) => m.id);
      } else if (p === "gemini") {
        r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=" + encodeURIComponent(c.key));
        if (!r.ok) throw new Error(await r.text());
        j = await r.json();
        ids = (j.models || []).filter((m) => (m.supportedGenerationMethods || []).includes("generateContent")).map((m) => m.name.replace("models/", ""));
      } else {
        const h = {};
        if (c.key) h.authorization = "Bearer " + c.key;
        r = await fetch((c.base || DEF.openai.base).replace(/\/$/, "") + "/models", { headers: h });
        if (!r.ok) throw new Error(await r.text());
        j = await r.json();
        ids = (j.data || j.models || []).map((m) => m.id || m.name);
      }
      if (!ids.length) throw new Error("The host returned no models");
      fillModels(ids, c.model);
      st.textContent = ids.length + " models available";
    } catch (e) {
      st.classList.add("err");
      st.textContent = "Could not load models: " + String(e.message || e).slice(0, 160);
    }
  }

  let mt;
  const later = () => {
    clearTimeout(mt);
    mt = setTimeout(loadModels, 700);
  };

  if ($("#prov")) $("#prov").onchange = () => {
    cfg.prov = $("#prov").value;
    loadProv();
    saveCfg();
  };
  if ($("#model")) $("#model").onchange = () => {
    cfg[cfg.prov].model = $("#model").value;
    saveCfg();
  };
  if ($("#key")) $("#key").oninput = () => {
    cfg[cfg.prov].key = $("#key").value.trim();
    saveCfg();
    later();
  };
  if ($("#base")) $("#base").oninput = () => {
    cfg[cfg.prov].base = $("#base").value.trim();
    saveCfg();
    later();
  };
  if ($("#mref")) $("#mref").onclick = loadModels;

  function status(m, e) {
    const s = $("#st");
    if (!s) return;
    s.textContent = m;
    s.classList.toggle("err", !!e);
  }

  async function ask(sys, usr) {
    let stored = {};
    try {
      stored = JSON.parse(localStorage.getItem("cursormaker2") || "{}");
    } catch (e) {}
    let p = stored.prov || "gemini";
    let c = stored[p] || {};

    // Auto-detect key from any provider if active provider key is empty
    if (!c.key) {
      for (const pr of ["gemini", "claude", "openai"]) {
        if (stored[pr]?.key && stored[pr].key.trim()) {
          p = pr;
          c = stored[pr];
          break;
        }
      }
    }

    if (!c.key && p !== "openai") {
      throw new Error(`API key is missing for ${p}. Please open Settings (gear icon) and paste your API key.`);
    }

    let r, j;

    if (p === "claude") {
      const model = (c.model || "claude-3-5-sonnet-20241022").trim() || "claude-3-5-sonnet-20241022";

      r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": c.key.trim(),
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model,
          max_tokens: 4000,
          system: sys,
          messages: [{ role: "user", content: usr }]
        })
      });

      if (!r.ok) {
        const rawErr = await r.text();
        let errMsg = rawErr;
        try {
          const parsed = JSON.parse(rawErr);
          if (parsed.error?.message) errMsg = parsed.error.message;
        } catch (_) {}
        throw new Error(`Claude API [${r.status}]: ${errMsg}`);
      }
      j = await r.json();
      return j.content.map((x) => x.text || "").join("");
    }

    if (p === "gemini") {
      const model = (c.model || "gemini-2.0-flash").trim() || "gemini-2.0-flash";

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(c.key.trim())}`;
      r = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: sys + "\n\nUser request: " + usr }] }],
          generationConfig: {
            maxOutputTokens: 4000,
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        })
      });

      if (!r.ok) {
        const rawErr = await r.text();
        let errMsg = rawErr;
        try {
          const parsed = JSON.parse(rawErr);
          if (parsed.error?.message) errMsg = parsed.error.message;
        } catch (_) {}
        throw new Error(`Gemini API [${r.status}]: ${errMsg}`);
      }
      j = await r.json();
      if (!j.candidates || !j.candidates[0] || !j.candidates[0].content) {
        throw new Error("No response generated by Gemini model.");
      }
      return j.candidates[0].content.parts.map((x) => x.text || "").join("");
    }

    // OpenAI / Ollama compatible
    const base = (c.base || "https://api.openai.com/v1").replace(/\/$/, "");
    const h = { "content-type": "application/json" };
    if (c.key) h.authorization = "Bearer " + c.key.trim();
    let model = (c.model || (base.includes("openai.com") ? "gpt-4o-mini" : "llama3.1")).trim();

    const requestBody = {
      model,
      max_tokens: 4000,
      messages: [{ role: "system", content: sys }, { role: "user", content: usr }]
    };
    if (/^https:\/\/api\.openai\.com(?:\/|$)/i.test(base)) {
      requestBody.response_format = { type: "json_object" };
    }

    r = await fetch(base + "/chat/completions", {
      method: "POST",
      headers: h,
      body: JSON.stringify(requestBody)
    });
    if (!r.ok) {
      const rawErr = await r.text();
      let errMsg = rawErr;
      try {
        const parsed = JSON.parse(rawErr);
        if (parsed.error?.message) errMsg = parsed.error.message;
      } catch (_) {}
      throw new Error(`OpenAI API [${r.status}]: ${errMsg}`);
    }
    j = await r.json();
    return j.choices[0].message.content;
  }

  function clean(j, old) {
    const hx = (v, d) => (/^#[0-9a-f]{6}$/i.test(v || "") ? v : d);
    const pick = (a, l) => [...new Set((Array.isArray(a) ? a : []).filter((x) => l.includes(x)))];
    const o = {};
    const validStyles = ["smooth", "pixel", "neon", "metallic", "outline", "retro", "cyberpunk", "tv", "lego", "disco", "mirror", "cross", "crosshatch", "mixed", "glyph", "aurora", "hologram", "glass", "prism"];
    o.style = validStyles.includes(j.style) ? j.style : (old.style || "neon");
    const validShapes = ["arrow", "system-arrow", "flame-arrow", "pointer-hand", "outline-arrow", "arrow-slim", "arrow-wide", "arrow-curved", "spear", "blade", "aero", "crystal", "stealth", "hand", "custom"];
    o.shape = validShapes.includes(j.shape) ? j.shape : (old.shape || "arrow");
    ["a", "b", "outline", "glow", "accent"].forEach((k) => (o[k] = hx(j[k], old[k])));
    const outlineWidth = Number(j.ow);
    o.ow = Number.isFinite(outlineWidth) ? Math.max(0, Math.min(7, outlineWidth)) : 4.2;
    const glowAmount = Number(j.glowAmt);
    o.glowAmt = Number.isFinite(glowAmount) ? Math.max(0, Math.min(1, glowAmount)) : 0.3;
    o.parts = pick(j.parts, PIDS);
    if (!o.parts.length) o.parts = ["shine"];
    o.fx = pick(Array.isArray(j.motion) ? j.motion : j.fx, FIDS);
    if (!o.fx.length) o.fx = ["pulse"];
    if (j.emblem) o.emblem = String(j.emblem);
    if (j.name) o.name = String(j.name);
    const presetName = j.presetName || j.preset;
    if (typeof presetName === "string" && presetName.trim()) {
      o.presetName = presetName.trim().slice(0, 40);
    }
    const points = j.customPoints;
    const validPoints = Array.isArray(points) && points.length >= 6 && points.length <= 14 &&
      points.every((point) => Array.isArray(point) && point.length === 2 &&
        Number.isFinite(Number(point[0])) && Number.isFinite(Number(point[1])) &&
        Number(point[0]) >= 0 && Number(point[0]) <= 75 &&
        Number(point[1]) >= 0 && Number(point[1]) <= 90) &&
      Number(points[0][0]) === 0 && Number(points[0][1]) === 0;
    if (validPoints) {
      o.customPoints = points.map((point) => [Number(point[0]), Number(point[1])]);
      o.shape = "custom";
    } else if (o.shape === "custom") {
      o.shape = "arrow";
    }
    if (Array.isArray(j.pixelArt)) o.pixelArt = j.pixelArt;
    o.seed = 1 + Math.floor(Math.random() * 998);
    return o;
  }

  function synthesizeThemeDesign(promptText) {
    const p = String(promptText || "").toLowerCase();
    if (p.includes("naruto") || p.includes("ناروتو") || p.includes("sharingan") || p.includes("sasuke") || p.includes("ninja") || p.includes("anime")) {
      return {
        name: "Naruto Sharingan Blade",
        shape: "blade",
        style: "neon",
        a: "#18020a",
        b: "#ff1744",
        outline: "#080103",
        glow: "#ff1744",
        accent: "#ff5252",
        ow: 4.5,
        glowAmt: 0.95,
        parts: ["shine", "core"],
        emblem: "sharingan",
        fx: ["pulse", "sparkle", "trail"]
      };
    }
    if (p.includes("cr7") || p.includes("ronaldo") || p.includes("football") || p.includes("ball") || p.includes("كرة") || p.includes("soccer")) {
      return {
        name: "CR7 Speed Football",
        shape: "aero",
        style: "metallic",
        a: "#ffffff",
        b: "#ffd700",
        outline: "#0a0d1f",
        glow: "#ffd700",
        accent: "#00e5ff",
        ow: 4.2,
        glowAmt: 0.9,
        parts: ["shine", "stripes"],
        emblem: "soccer_ball",
        fx: ["pulse", "float", "sparkle"]
      };
    }
    if (p.includes("car") || p.includes("cars") || p.includes("سيارة") || p.includes("سيارات") || p.includes("speed") || p.includes("racing") || p.includes("runn")) {
      return {
        name: "Hypercar Nitro Speed",
        shape: "aero",
        style: "metallic",
        a: "#ff1744",
        b: "#121212",
        outline: "#020202",
        glow: "#00e5ff",
        accent: "#ff7a18",
        ow: 4.2,
        glowAmt: 0.92,
        parts: ["shine", "facets"],
        emblem: "car",
        fx: ["flame", "pulse", "trail"]
      };
    }
    if (p.includes("dragon") || p.includes("تنين")) {
      return {
        name: "Emerald Dragon Blade",
        shape: "blade",
        style: "metallic",
        a: "#00e676",
        b: "#1b5e20",
        outline: "#031406",
        glow: "#00e676",
        accent: "#ffea00",
        ow: 4.5,
        glowAmt: 0.92,
        parts: ["facets", "core"],
        emblem: "dragon",
        fx: ["pulse", "sparkle", "orbit"]
      };
    }
    if (p.includes("lightning") || p.includes("برق") || p.includes("electric") || p.includes("thunder") || p.includes("صاعقة")) {
      return {
        name: "Thunder Volt Stealth",
        shape: "stealth",
        style: "neon",
        a: "#00e5ff",
        b: "#2979ff",
        outline: "#050b1a",
        glow: "#00e5ff",
        accent: "#ffffff",
        ow: 4.5,
        glowAmt: 1.0,
        parts: ["shine", "core"],
        emblem: "lightning",
        fx: ["electric", "pulse", "sparkle"]
      };
    }
    if (p.includes("fire") || p.includes("flame") || p.includes("نار") || p.includes("لهب")) {
      return {
        name: "Inferno Blazing Blade",
        shape: "blade",
        style: "neon",
        a: "#ff3d00",
        b: "#ff9100",
        outline: "#1f0300",
        glow: "#ff1744",
        accent: "#ffea00",
        ow: 4.5,
        glowAmt: 0.95,
        parts: ["shine", "core"],
        emblem: "flame",
        fx: ["flame", "pulse", "sparkle"]
      };
    }
    if (p.includes("skull") || p.includes("جمجمة") || p.includes("cyber") || p.includes("cyberpunk")) {
      return {
        name: "Cyberpunk Neon Skull",
        shape: "stealth",
        style: "neon",
        a: "#00e5ff",
        b: "#7c4dff",
        outline: "#070214",
        glow: "#00e5ff",
        accent: "#ff007f",
        ow: 4.2,
        glowAmt: 0.92,
        parts: ["shine", "core"],
        emblem: "skull",
        fx: ["pulse", "wobble"]
      };
    }
    if (p.includes("sword") || p.includes("سيف") || p.includes("katana")) {
      return {
        name: "Obsidian Katana",
        shape: "blade",
        style: "metallic",
        a: "#e0e6ed",
        b: "#2f6bff",
        outline: "#030a1c",
        glow: "#00d4ff",
        accent: "#ffffff",
        ow: 4.2,
        glowAmt: 0.9,
        parts: ["shine", "facets"],
        emblem: "core",
        fx: ["sparkle", "pulse"]
      };
    }
    if (p.includes("crystal") || p.includes("كريستال") || p.includes("diamond") || p.includes("جوهرة") || p.includes("ألماس")) {
      return {
        name: "Prism Crystal Pointer",
        shape: "crystal",
        style: "smooth",
        a: "#a855f7",
        b: "#06b6d4",
        outline: "#0a0518",
        glow: "#d946ef",
        accent: "#ffffff",
        ow: 4.2,
        glowAmt: 0.95,
        parts: ["facets", "shine"],
        emblem: "core",
        fx: ["chroma", "pulse"]
      };
    }
    // Dynamic procedural synthesis based on prompt hash so every prompt generates a unique cursor
    let hash = 0;
    for (let i = 0; i < p.length; i++) hash = (hash << 5) - hash + p.charCodeAt(i);
    const shapes = ["blade", "aero", "crystal", "stealth", "arrow", "system-arrow", "flame-arrow", "pointer-hand", "outline-arrow", "arrow-slim", "arrow-wide", "arrow-curved", "spear"];
    const styles = ["neon", "metallic", "smooth", "pixel"];
    const emblems = ["core", "flame", "lightning", "dragon", "skull", "gem", "star", "crown"];
    const fxSets = [
      ["pulse", "sparkle", "trail"],
      ["flame", "pulse", "starlight"],
      ["electric", "orbit", "sparkle"],
      ["chroma", "pulse", "shimmer"],
      ["vortex", "meteor", "pulse"]
    ];

    const pickShape = shapes[Math.abs(hash) % shapes.length];
    const pickStyle = styles[Math.abs(hash >> 2) % styles.length];
    const pickEmblem = emblems[Math.abs(hash >> 4) % emblems.length];
    const pickFx = fxSets[Math.abs(hash >> 6) % fxSets.length];

    // Generate vibrant complementary colors from prompt hash
    const h1 = Math.abs(hash * 47) % 360;
    const h2 = (h1 + 140) % 360;
    const hslToHex = (h, s, l) => {
      l /= 100;
      const a = (s * Math.min(l, 1 - l)) / 100;
      const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    };

    const colA = hslToHex(h1, 100, 50);
    const colB = hslToHex(h2, 100, 45);
    const colGlow = hslToHex(h1, 100, 58);

    return {
      name: `Custom ${pickShape.toUpperCase()} (${promptText.slice(0, 16)})`,
      shape: pickShape,
      style: pickStyle,
      a: colA,
      b: colB,
      outline: "#03040a",
      glow: colGlow,
      accent: "#ffffff",
      ow: 4.2,
      glowAmt: 0.95,
      parts: ["shine", "core"],
      emblem: pickEmblem,
      fx: pickFx
    };
  }

  function applyLocalPromptDetails(design, promptText) {
    const prompt = String(promptText || "").toLowerCase();
    const colors = [
      { terms: ["red", "crimson", "أحمر", "حمراء"], hex: "#ff1744" },
      { terms: ["blue", "أزرق", "زرقاء"], hex: "#2979ff" },
      { terms: ["green", "أخضر", "خضراء"], hex: "#00c853" },
      { terms: ["purple", "violet", "بنفسجي", "أرجواني"], hex: "#a855f7" },
      { terms: ["orange", "برتقالي"], hex: "#ff7a18" },
      { terms: ["yellow", "gold", "أصفر", "ذهبي"], hex: "#ffd600" },
      { terms: ["pink", "rose", "وردي"], hex: "#ff4081" },
      { terms: ["cyan", "turquoise", "سماوي", "فيروزي"], hex: "#00d4ff" },
      { terms: ["white", "أبيض", "بيضاء"], hex: "#f7f7ff" },
      { terms: ["black", "أسود", "سوداء"], hex: "#10121b" }
    ];
    const requestedColors = colors.filter(({ terms }) => terms.some((term) => prompt.includes(term)));
    if (requestedColors.length) {
      const primary = requestedColors[0].hex;
      const secondary = requestedColors[1]?.hex || colors[(colors.findIndex((color) => color.hex === primary) + 4) % colors.length].hex;
      design.a = primary;
      design.b = secondary;
      design.glow = primary;
      design.accent = secondary;
    }

    const styles = [
      [["cyberpunk", "cyberpunk", "سايبربانك"], "cyberpunk"],
      [["retro", "vintage", "قديم"], "retro"],
      [["tv static", "television", "تشويش"], "tv"],
      [["lego", "ليغو"], "lego"],
      [["disco", "ديسكو"], "disco"],
      [["mirror", "chrome", "مرآة"], "mirror"],
      [["crosshatch", "cross hatch"], "crosshatch"],
      [["glyph", "multi-glyph", "رموز"], "glyph"],
      [["pixel", "8-bit", "بكسل"], "pixel"],
      [["metallic", "metal", "معدني"], "metallic"],
      [["neon", "نيون"], "neon"]
    ];
    const requestedStyle = styles.find(([terms]) => terms.some((term) => prompt.includes(term)));
    if (requestedStyle) design.style = requestedStyle[1];

    const subjects = [
      [["sword", "blade", "katana", "سيف"], "blade", "sword"],
      [["car", "racing", "سيارة", "سيارات"], "aero", "car"],
      [["dragon", "تنين"], "blade", "dragon"],
      [["lightning", "thunder", "electric", "برق", "صاعقة"], "stealth", "lightning"],
      [["crystal", "diamond", "gem", "كريستال", "ألماس"], "crystal", "gem"],
      [["star", "نجمة"], "crystal", "star"],
      [["flame", "fire", "نار", "لهب"], "blade", "flame"]
    ];
    const requestedSubject = subjects.find(([terms]) => terms.some((term) => prompt.includes(term)));
    if (requestedSubject) {
      design.shape = requestedSubject[1];
      design.emblem = requestedSubject[2];
    }

    const pointerShapes = [
      [["system arrow", "windows arrow", "standard arrow"], "system-arrow"],
      [["flame arrow", "fire arrow", "ember arrow"], "flame-arrow"],
      [["pointing hand", "hand pointer", "hand cursor"], "pointer-hand"],
      [["outline arrow", "outlined arrow", "glow arrow", "shadow arrow"], "outline-arrow"],
      [["slim arrow", "thin arrow", "slim pointer"], "arrow-slim"],
      [["wide arrow", "broad arrow", "wide pointer"], "arrow-wide"],
      [["curved arrow", "curved pointer"], "arrow-curved"],
      [["spear pointer", "spear arrow"], "spear"]
    ];
    const requestedPointerShape = pointerShapes.find(([terms]) => terms.some((term) => prompt.includes(term)));
    if (requestedPointerShape) design.shape = requestedPointerShape[1];

    if (prompt.includes("wave") || prompt.includes("موجة")) {
      design.fx = ["aurora", "wave", "pulse"];
    } else if (prompt.includes("nebula") || prompt.includes("galaxy") || prompt.includes("مجرة")) {
      design.fx = ["nebula", "starlight", "orbit"];
    }
    return design;
  }

  function countryFlagDesign(promptText) {
    const prompt = String(promptText || "").toLowerCase();
    const hasFlagIntent = /\b(flag|flags|cursor|mouse)\b/.test(prompt) ||
      prompt.includes("علم") || prompt.includes("راية") || prompt.includes("مؤشر");
    if (!hasFlagIntent) return null;

    let country;
    if (/\b(morocco|moroccan|maroc)\b/.test(prompt) ||
        prompt.includes("المغرب") || prompt.includes("مغربي") || prompt.includes("مغربية")) {
      country = {
        name: "Morocco Flag Cursor",
        emblem: "flag_morocco",
        a: "#c1272d",
        b: "#c1272d",
        outline: "#3d1114",
        glow: "#006233",
        accent: "#006233"
      };
    } else if (/\b(france|french)\b/.test(prompt) ||
        prompt.includes("فرنسا") || prompt.includes("فرنسي") || prompt.includes("فرنسية")) {
      country = {
        name: "France Flag Cursor",
        emblem: "flag_france",
        a: "#0055a4",
        b: "#ef4135",
        outline: "#17243b",
        glow: "#ffffff",
        accent: "#ffffff"
      };
    } else if (/\b(us|usa|american|united states)\b/.test(prompt) || prompt.includes("u.s.") ||
        prompt.includes("أمريكا") || prompt.includes("امريكا") ||
        prompt.includes("الولايات المتحدة") || prompt.includes("أمريكي") || prompt.includes("أمريكية")) {
      country = {
        name: "United States Flag Cursor",
        emblem: "flag_usa",
        a: "#b22234",
        b: "#ffffff",
        outline: "#151a35",
        glow: "#3c3b6e",
        accent: "#ffffff"
      };
    }
    if (!country) return null;

    return {
      ...country,
      shape: "arrow",
      style: "smooth",
      ow: 4.2,
      glowAmt: 0.2,
      parts: ["shine"],
      fx: ["pulse"]
    };
  }

  if ($("#gen")) {
    $("#gen").onclick = async () => {
      const btn = $("#gen");
      const promptVal = ($("#prompt")?.value || "").trim();
      if (!promptVal) {
        toast("Please describe the cursor you want to generate");
        return;
      }
      const flagDesign = countryFlagDesign(promptVal);
      btn.disabled = true;
      status(flagDesign ? "Creating country flag cursor..." : "Preparing cursor design...");

      try {
        let pStored = {};
        try {
          pStored = JSON.parse(localStorage.getItem("cursormaker2") || "{}");
        } catch {}
        let prov = pStored.prov || "gemini";
        let hasKey = pStored[prov]?.key && pStored[prov].key.trim();
        let canUseLocalApi = prov === "openai" &&
          /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?\//i.test(pStored[prov]?.base || "");

        // Check all providers if active one doesn't have key
        if (!hasKey) {
          for (const pr of ["gemini", "claude", "openai"]) {
            if (pStored[pr]?.key && pStored[pr].key.trim()) {
              prov = pr;
              hasKey = pStored[pr].key.trim();
              pStored.prov = pr;
              localStorage.setItem("cursormaker2", JSON.stringify(pStored));
              break;
            }
          }
          if (!hasKey && prov === "openai") {
            canUseLocalApi = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?\//i.test(pStored[prov]?.base || "");
          }
        }

        const useLocalDesign = !flagDesign && !hasKey && !canUseLocalApi;
        if (useLocalDesign) {
          status("No API key found; creating a prompt-matched cursor locally...");
        } else if (!flagDesign) {
          status("Asking the AI model to follow your cursor description...");
        }

        const sys = `Create a complete, reusable cursor preset from the user's exact description. Preserve the requested subject, colors, country, style, and mood. Do not replace a specific request with a generic cursor. Make the pointer silhouette immediately recognizable and the requested subject easy to identify at 32-64 pixels. Vary the pointer silhouette to fit the request; do not default to the same classic arrow every time. Keep the outline crisp, use a clear contrast between fill and outline, and avoid tiny details, text, clutter, or effects that hide the silhouette. Use restrained glow (normally 0.15-0.4; only use more when explicitly requested). Choose one to three real motion effects that create a visible loop, and keep the motion compatible with the pointer's silhouette. Choose a silhouette and emblem that visibly communicate the subject. Use customPoints only when a standard shape is a poor match; points must be 6-14 [x,y] pairs inside x=0..75 and y=0..90, starting at [0,0]. The app renders this preset and creates the cursor files; do not return file data.

Return one JSON object only, without markdown or comments. Use these keys:
- name: short descriptive title
- presetName: short name for the complete reusable preset
- shape: one of arrow, system-arrow, flame-arrow, pointer-hand, outline-arrow, arrow-slim, arrow-wide, arrow-curved, spear, blade, aero, crystal, stealth, custom
- customPoints: optional array of [x,y] pairs; required when shape is custom
- style: one of smooth, pixel, neon, metallic, outline, retro, cyberpunk, tv, lego, disco, mirror, cross, crosshatch, mixed, glyph, aurora, hologram, glass, prism
- a, b, outline, glow, accent: six-digit hex colors matching the request
- ow: outline width from 1 to 7
- glowAmt: glow strength from 0 to 1
- parts: any of shine, facets, stripes, core
- emblem: short subject keyword such as sharingan, soccer_ball, car, flame, lightning, dragon, skull, gem, star, crown, eye, sword, cross, core
- motion: one to three effects from pulse, sparkle, particles, flame, shimmer, wobble, orbit, flow, electric, trail, chroma, glitch, vortex, float, starlight, meteor, warp, ring, rainbow, breathe, aurora, nebula, wave, ripple, plasma, liquid

Valid example:
{"name":"Crimson Star Cursor","presetName":"Crimson Star","shape":"arrow-slim","style":"neon","a":"#ff1744","b":"#ffd600","outline":"#18040a","glow":"#ff1744","accent":"#ffffff","ow":4,"glowAmt":0.3,"parts":["shine"],"emblem":"star","motion":["pulse","sparkle"]}`;

        let design = flagDesign;
        if (!design) {
          if (useLocalDesign) {
            design = applyLocalPromptDetails(synthesizeThemeDesign(promptVal), promptVal);
          } else {
            const raw = await ask(sys, promptVal);
            design = parseAiJsonResponse(raw);
          }
        }

        hpush("generate_cursor");
        const k = K();
        const cleanedSpec = clean(design, k.spec);
        Object.assign(k.spec, cleanedSpec);
        const generatedName = cleanedSpec.name || design.name || "Custom Cursor";
        const generatedPresetName = cleanedSpec.presetName || generatedName;
        addGeneratedPreset(generatedPresetName, cleanedSpec);
        k.animated = true;
        k.isManual = false; // Ensures full procedural & motion effects rendering!

        regenSlot(S.k);

        if (S.link && S.slots.pointer) {
          const ptr = S.slots.pointer;
          ptr.animated = true;
          ptr.isManual = false;
          ptr.spec = { ...k.spec, shape: "hand" };
          regenSlot("pointer");
        }

        buildTh();
        thumbs();
        sync();
        draw();

        const successMessage = flagDesign
          ? `Generated "${generatedName}" using the built-in country flag design.`
          : useLocalDesign
            ? `Generated "${generatedName}" preset in ${cleanedSpec.style} style with ${cleanedSpec.fx.join(", ")} motion. Add an API key for more complex AI designs.`
            : `Generated "${generatedName}" preset in ${cleanedSpec.style} style with ${cleanedSpec.fx.join(", ")} motion via ${prov.toUpperCase()} API!`;
        status(successMessage);
        toast(`Generated "${generatedName}"!`);

        if (window._recordAiGen) {
          window._recordAiGen({
            id: "ai_" + Date.now(),
            title: generatedName || promptVal.slice(0, 30) || "Custom Cursor",
            thumb: k.frames[0].toDataURL("image/png"),
            frames: [k.frames[0].toDataURL("image/png"), k.frames[1].toDataURL("image/png"), k.frames[2].toDataURL("image/png")],
            hot: [...k.hot],
            isAni: true,
            createdAt: Date.now()
          });
        }
      } catch (e) {
        status("Generation failed: " + String(e.message || e).slice(0, 300), true);
        toast("Generation failed: " + String(e.message || e).slice(0, 100));
      } finally {
        btn.disabled = false;
      }
    };
  }

  regenAll();
  loadProv();
  sync();
  setTab(initialTab || "generate");
  requestAnimationFrame(loop);
}
