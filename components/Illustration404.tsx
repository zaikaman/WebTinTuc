"use client";

import React from "react";
import { motion } from "framer-motion";

export function Illustration404() {
  return (
    <div className="relative w-full max-w-[400px] h-[300px] mx-auto flex items-center justify-center select-none overflow-visible">
      {/* Background Big "404" text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span className="text-[180px] md:text-[240px] font-black text-black/[0.04] leading-none whitespace-nowrap">
          404
        </span>
      </div>

      {/* Floating Clouds Outlines */}
      <motion.div
        className="absolute left-4 top-12 text-gray-300 pointer-events-none"
        animate={{ x: [-5, 5, -5], y: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <CloudIcon className="w-8 h-8 opacity-60" />
      </motion.div>

      <motion.div
        className="absolute right-8 top-16 text-gray-300 pointer-events-none"
        animate={{ x: [5, -5, 5], y: [0, -3, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <CloudIcon className="w-7 h-7 opacity-60" />
      </motion.div>

      <motion.div
        className="absolute left-6 bottom-16 text-gray-300 pointer-events-none"
        animate={{ x: [-4, 4, -4], y: [0, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <CloudIcon className="w-8 h-8 opacity-60" />
      </motion.div>

      <motion.div
        className="absolute right-12 bottom-12 text-gray-300 pointer-events-none"
        animate={{ x: [4, -4, 4], y: [0, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <CloudIcon className="w-6 h-6 opacity-60" />
      </motion.div>

      {/* 3D Isometric SVG Illustration */}
      <svg
        viewBox="0 0 400 300"
        className="w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Hexagon Pattern */}
          <pattern
            id="hex-grid"
            width="12"
            height="20.78"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(30) scale(1)"
          >
            <path
              d="M6 0 L12 3.46 L12 10.39 L6 13.85 L0 10.39 L0 3.46 Z"
              fill="none"
              stroke="#555"
              strokeWidth="0.5"
            />
            <path
              d="M6 20.78 L12 24.24 L12 31.17 L6 34.63 L0 31.17 L0 24.24 Z"
              fill="none"
              stroke="#555"
              strokeWidth="0.5"
            />
          </pattern>

          {/* Red Neon Glow */}
          <filter id="red-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft Shadow */}
          <radialGradient
            id="base-shadow"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#000000" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          {/* Gradients for Box */}
          <linearGradient id="top-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2c2d30" />
            <stop offset="100%" stopColor="#1e1f22" />
          </linearGradient>
          <linearGradient id="left-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e1f22" />
            <stop offset="100%" stopColor="#121315" />
          </linearGradient>
          <linearGradient id="right-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#232427" />
            <stop offset="100%" stopColor="#161719" />
          </linearGradient>
        </defs>

        {/* Base Shadow */}
        <ellipse cx="200" cy="220" rx="100" ry="25" fill="url(#base-shadow)" />

        {/* Hexagonal Path leading to the box */}
        <g opacity="0.8">
          <path
            d="M 140 220 L 200 190 L 260 220 L 200 250 Z"
            fill="url(#hex-grid)"
            opacity="0.3"
          />
          <path
            d="M 160 210 L 200 190 L 240 210 L 200 230 Z"
            fill="url(#hex-grid)"
            opacity="0.6"
          />
          {/* Animated red pulse on path */}
          <path
            d="M 180 200 L 200 190 L 220 200 L 200 210 Z"
            fill="#ff4d4d"
            opacity="0.2"
            className="animate-pulse"
          />
        </g>

        {/* 3D Isometric Box (The Platform) */}
        {/* Top Face */}
        <polygon
          points="200,120 280,80 200,40 120,80"
          fill="url(#top-grad)"
          stroke="#3d3e42"
          strokeWidth="1"
        />

        {/* Hex Grid on top face */}
        <polygon
          points="200,120 280,80 200,40 120,80"
          fill="url(#hex-grid)"
          opacity="0.2"
          style={{ mixBlendMode: "overlay" }}
        />

        {/* Front Left Face */}
        <polygon
          points="120,80 200,120 200,190 120,150"
          fill="url(#left-grad)"
          stroke="#26272a"
          strokeWidth="1"
        />

        {/* Front Right Face */}
        <polygon
          points="200,120 280,80 280,150 200,190"
          fill="url(#right-grad)"
          stroke="#2d2e31"
          strokeWidth="1"
        />

        {/* Highlight edges */}
        <line x1="200" y1="120" x2="200" y2="190" stroke="#484a4f" strokeWidth="1.5" />
        <line x1="120" y1="80" x2="200" y2="120" stroke="#484a4f" strokeWidth="1.5" />
        <line x1="200" y1="120" x2="280" y2="80" stroke="#484a4f" strokeWidth="1.5" />

        {/* Glowing Red Neon "404" Standing Vertically */}
        <g transform="translate(0, -10)" filter="url(#red-glow)">
          {/* Isometric text styling through path */}
          {/* Neon base shadow lines */}
          <path
            d="M 160 85 L 180 75"
            stroke="#ff3333"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
            className="animate-pulse"
          />
          <path
            d="M 190 85 L 210 75"
            stroke="#ff3333"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
            className="animate-pulse"
          />
          <path
            d="M 220 85 L 240 75"
            stroke="#ff3333"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
            className="animate-pulse"
          />

          {/* Neon Glowing "404" vertical representation */}
          <text
            x="200"
            y="95"
            fill="#ff4d4d"
            fontWeight="bold"
            fontSize="48"
            textAnchor="middle"
            style={{
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "4px",
              transform: "skewY(-18deg) rotate(-2deg)",
              transformOrigin: "200px 95px",
              textShadow: "0 0 10px #ff0000, 0 0 20px #ff3333, 0 0 30px #ff4d4d",
            }}
          >
            404
          </text>
        </g>
      </svg>
    </div>
  );
}

function CloudIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42-1.89-2.18-3.5-4.5-3.5a5 5 0 0 0-4.9 4c-2 .42-3.6 1.89-3.6 4a3.5 3.5 0 0 0 3.5 3.5Z" />
    </svg>
  );
}
