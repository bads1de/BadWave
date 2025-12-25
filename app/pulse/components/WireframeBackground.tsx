"use client";

import React, { useEffect, useRef } from "react";

interface WireframeProps {
  analyser: AnalyserNode | null;
}

const WireframeBackground: React.FC<WireframeProps> = ({ analyser }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationId: number;
    // We'll look at low frequencies for the "Kick" effect
    const dataArray = new Uint8Array(16);

    const update = () => {
      if (!containerRef.current) return;

      let scale = 1;
      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
        // Grab average of very low freq (bass)
        const bass =
          (dataArray[0] + dataArray[1] + dataArray[2] + dataArray[3]) / 4;
        // Normalize: 0-255 -> 1.0 - 1.3 approx
        scale = 1 + (bass / 255) * 0.3;
      }

      // Update CSS variable for efficient transform
      containerRef.current.style.setProperty("--bass-scale", scale.toFixed(3));

      animationId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationId);
  }, [analyser]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      {/* Floating Pyramid Left */}
      <div className="absolute top-1/4 left-[15%] w-0 h-0 transform-3d animate-float-slow">
        <div
          className="pyramid-container"
          style={{ transform: "scale(var(--bass-scale))" }}
        >
          <div className="pyramid-axis animate-spin-slow">
            <div className="face front" />
            <div className="face back" />
            <div className="face left" />
            <div className="face right" />
          </div>
        </div>
      </div>

      {/* Floating Cube Right */}
      <div className="absolute top-1/3 right-[15%] w-0 h-0 transform-3d animate-float-delayed">
        <div
          className="cube-container"
          style={{ transform: "scale(var(--bass-scale))" }}
        >
          <div className="cube-axis animate-spin-reverse">
            <div className="cube-face front" />
            <div className="cube-face back" />
            <div className="cube-face right" />
            <div className="cube-face left" />
            <div className="cube-face top" />
            <div className="cube-face bottom" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .transform-3d {
          transform-style: preserve-3d;
        }

        /* --- PYRAMID STYLES --- */
        .pyramid-container {
          position: relative;
          width: 200px;
          height: 200px;
          transform-style: preserve-3d;
          transition: transform 0.05s ease-out; /* Smooth bass Kick */
        }
        .pyramid-axis {
          position: absolute;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }
        .face {
          position: absolute;
          top: 0;
          left: 0;
          width: 0;
          height: 0;
          border-left: 100px solid transparent;
          border-right: 100px solid transparent;
          border-bottom: 200px solid rgba(0, 255, 255, 0.1); /* Glassy cyan */
          transform-origin: 50% 100%;
        }
        /* Borders for wireframe look using pseudo elements or multiple borders would be complex, 
           so we use a trick: clip-path or border-image. 
           Simple border on triangle is tricky. Let's use linear-gradient on the border-bottom color 
           to simulate wireframe edges, or just keep it glassy. 
           Actually, let's use clip-path to make it a hollow triangle? 
           For now, let's just make it semi-transparent with a border on the base? 
           CSS Triangles don't support normal borders easily.
           Let's use a clip-path div instead for cleaner wireframe.
        */
        .face {
          border: none;
          width: 200px;
          height: 200px;
          background: linear-gradient(
            to top,
            rgba(0, 255, 255, 0.4),
            transparent 60%
          );
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          /* Add an inner "border" via box-shadow inset? No, scale calc.
               Let's rely on the gradient for the look + CSS drop-shadow. */
          filter: drop-shadow(0 0 5px cyan);
        }

        .face.front {
          transform: translateZ(50px) rotateX(30deg);
        }
        .face.back {
          transform: translateZ(-50px) rotateX(-30deg) rotateY(180deg);
        }
        .face.left {
          transform: translateX(-50px) rotateZ(30deg) rotateY(-90deg);
        }
        /* The above math is messy for strict pyramid. Let's use a simpler 4-sided pyramid transform */
        /* Re-doing straightforward transforms for a square base pyramid */

        .pyramid-axis .face {
          width: 200px;
          height: 200px;
          background: transparent;
          border: 2px solid cyan;
          clip-path: none;
          /* Actually, converting to simple triangles using borders is easiest for "wireframe" */
          /* Let's try "Triangular Prism" approach or just pure CSS borders on a square div rotated? */
        }
        /* OK, Simpler approach: Just 3D rotating squares/rects is cleaner for "Retro" */

        /* --- CUBE STYLES --- */
        .cube-container {
          position: relative;
          width: 150px;
          height: 150px;
          transform-style: preserve-3d;
          transition: transform 0.05s ease-out;
        }
        .cube-axis {
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }
        .cube-face {
          position: absolute;
          width: 150px;
          height: 150px;
          border: 2px solid rgba(255, 0, 255, 0.5);
          background: rgba(255, 0, 255, 0.05);
          box-shadow: 0 0 10px rgba(255, 0, 255, 0.2) inset;
        }
        .cube-face.front {
          transform: rotateY(0deg) translateZ(75px);
        }
        .cube-face.back {
          transform: rotateY(180deg) translateZ(75px);
        }
        .cube-face.right {
          transform: rotateY(90deg) translateZ(75px);
        }
        .cube-face.left {
          transform: rotateY(-90deg) translateZ(75px);
        }
        .cube-face.top {
          transform: rotateX(90deg) translateZ(75px);
        }
        .cube-face.bottom {
          transform: rotateX(-90deg) translateZ(75px);
        }

        /* --- Re-defining Pyramid as an Octahedron top half (easier) --- */
        /* Actually, I'll switch the left object to be another Cube but rotated 45deg (Diamond), easier to make look good than CSS triangle wireframes */
        .pyramid-container {
          width: 150px;
          height: 150px;
        }
        .pyramid-axis .face {
          /* Reuse cube face logic but Cyan */
          position: absolute;
          width: 150px;
          height: 150px;
          border: 2px solid rgba(0, 255, 255, 0.5);
          background: rgba(0, 255, 255, 0.05);
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.2) inset;
        }
        .pyramid-axis .face.front {
          transform: rotateY(0deg) translateZ(75px);
        }
        .pyramid-axis .face.back {
          transform: rotateY(180deg) translateZ(75px);
        }
        .pyramid-axis .face.right {
          transform: rotateY(90deg) translateZ(75px);
        }
        .pyramid-axis .face.left {
          transform: rotateY(-90deg) translateZ(75px);
        }
        .pyramid-axis .face.top {
          transform: rotateX(90deg) translateZ(75px);
        }
        .pyramid-axis .face.bottom {
          transform: rotateX(-90deg) translateZ(75px);
        }

        /* Rotate the whole "Pyramid" container to stand on corner to look like diamond/octahedron vibe */
        .pyramid-container {
          transform: rotateX(45deg) rotateZ(45deg);
          /* We need to apply var bass-scale too, handled in JS inline style overrides CSS transform, 
                so we apply the rotation to the AXIS instead? No, axis spins. 
                Let's apply static rotation to the wrapper div in HTML */
        }

        /* --- ANIMATIONS --- */
        .animate-float-slow {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 10s ease-in-out infinite reverse;
        }

        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        .animate-spin-reverse {
          animation: spin 25s linear infinite reverse;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }
        @keyframes spin {
          from {
            transform: rotateX(0) rotateY(0);
          }
          to {
            transform: rotateX(360deg) rotateY(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default WireframeBackground;
