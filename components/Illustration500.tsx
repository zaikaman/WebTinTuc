"use client";

import React from "react";
import { motion } from "framer-motion";

export function Illustration500() {
  return (
    <div className="relative w-full max-w-[400px] h-[300px] mx-auto flex items-center justify-center select-none overflow-visible">
      {/* 3D Isometric SVG Illustration */}
      <svg
        viewBox="0 -25 400 325"
        className="w-full h-full overflow-visible drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Warning Glow */}
          <filter id="neon-warning-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradients for Server Cubes */}
          <linearGradient id="srv-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#252629" />
            <stop offset="100%" stopColor="#1a1b1d" />
          </linearGradient>
          <linearGradient id="srv-left" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a1b1d" />
            <stop offset="100%" stopColor="#101112" />
          </linearGradient>
          <linearGradient id="srv-right" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#202123" />
            <stop offset="100%" stopColor="#141516" />
          </linearGradient>

          {/* Small Node Gradients */}
          <linearGradient id="node-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3a3b3e" />
            <stop offset="100%" stopColor="#2d2e30" />
          </linearGradient>

          {/* Soft Shadow */}
          <radialGradient
            id="srv-shadow"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base Shadows */}
        <ellipse cx="200" cy="235" rx="80" ry="20" fill="url(#srv-shadow)" opacity="0.8" />
        <ellipse cx="80" cy="195" rx="30" ry="8" fill="url(#srv-shadow)" opacity="0.5" />
        <ellipse cx="320" cy="195" rx="30" ry="8" fill="url(#srv-shadow)" opacity="0.5" />
        <ellipse cx="200" cy="115" rx="40" ry="10" fill="url(#srv-shadow)" opacity="0.4" />

        {/* Connection Wires (Left, Right, Top) */}
        <g stroke="#e24a48" strokeWidth="2" strokeLinecap="round" opacity="0.6">
          {/* Wire to Left Node */}
          <path d="M 130 145 L 80 170" />
          <path d="M 130 190 L 80 185" strokeWidth="1" strokeDasharray="3,3" />

          {/* Wire to Right Node */}
          <path d="M 270 145 L 320 170" />
          <path d="M 270 190 L 320 185" strokeWidth="1" strokeDasharray="3,3" />

          {/* Wire to Top Node */}
          <path d="M 200 115 L 200 95" />
        </g>

        {/* Glowing Data Pulses along wires */}
        <circle cx="105" cy="157" r="3" fill="#ff4d4d">
          <animate attributeName="cx" values="130;80" dur="2s" repeatCount="indefinite" />
          <animate attributeName="cy" values="145;170" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="295" cy="157" r="3" fill="#ff4d4d">
          <animate attributeName="cx" values="270;320" dur="2s" repeatCount="indefinite" />
          <animate attributeName="cy" values="145;170" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Small Node Cube - Left */}
        <g transform="translate(0, 20)">
          <polygon points="80,150 100,140 80,130 60,140" fill="url(#node-top)" stroke="#4a4b4e" />
          <polygon points="60,140 80,150 80,170 60,160" fill="#202123" />
          <polygon points="80,150 100,140 100,160 80,170" fill="#141516" />
        </g>

        {/* Small Node Cube - Right */}
        <g transform="translate(0, 20)">
          <polygon points="320,150 340,140 320,130 300,140" fill="url(#node-top)" stroke="#4a4b4e" />
          <polygon points="300,140 320,150 320,170 300,160" fill="#202123" />
          <polygon points="320,150 340,140 340,160 320,170" fill="#141516" />
        </g>

        {/* Small Node Cube - Top */}
        <g transform="translate(0, -35)">
          <polygon points="200,120 220,110 200,100 180,110" fill="url(#node-top)" stroke="#4a4b4e" />
          <polygon points="180,110 200,120 200,135 180,125" fill="#202123" stroke="#121314" />
          <polygon points="200,120 220,110 220,135 200,135" fill="#141516" stroke="#121314" />
        </g>

        {/* Main Center Server Box */}
        {/* Top Face */}
        <polygon points="200,150 270,115 200,80 130,115" fill="url(#srv-top)" stroke="#3e3f43" />
        <polygon points="200,150 270,115 200,80 130,115" fill="url(#hex-grid)" opacity="0.1" />

        {/* Front Left Face */}
        <polygon points="130,115 200,150 200,210 130,175" fill="url(#srv-left)" stroke="#222326" />
        {/* Server vent slots/details */}
        <line x1="145" y1="135" x2="185" y2="155" stroke="#333" strokeWidth="2" />
        <line x1="145" y1="145" x2="185" y2="165" stroke="#333" strokeWidth="2" />
        <line x1="145" y1="155" x2="185" y2="175" stroke="#333" strokeWidth="2" />
        
        {/* Status indicators (Red/Green blinking) */}
        <circle cx="150" cy="135" r="2.5" fill="#ff3b30" className="animate-pulse" />
        <circle cx="150" cy="145" r="2.5" fill="#34c759" />
        <circle cx="150" cy="155" r="2.5" fill="#ffcc00" className="animate-pulse" />

        {/* Front Right Face */}
        <polygon points="200,150 270,115 270,175 200,210" fill="url(#srv-right)" stroke="#26272b" />
        {/* Server panel detail */}
        <polygon points="215,147 255,127 255,152 215,172" fill="#111" stroke="#2c2d30" />
        <rect x="220" y="140" width="10" height="4" fill="#ff4d4d" transform="skewY(-26.5)" opacity="0.8" className="animate-pulse" />
        <rect x="235" y="132" width="15" height="4" fill="#34c759" transform="skewY(-26.5)" opacity="0.8" />

        {/* Highlight edges */}
        <line x1="200" y1="150" x2="200" y2="210" stroke="#484a4f" strokeWidth="1.5" />
        <line x1="130" y1="115" x2="200" y2="150" stroke="#484a4f" strokeWidth="1.5" />
        <line x1="200" y1="150" x2="270" y2="115" stroke="#484a4f" strokeWidth="1.5" />

        {/* Floating Neon Red Warning/Exclamation Triangle */}
        <motion.g
          animate={{ y: [-15, -2, -15] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Neon warning base shadow */}
          <ellipse cx="200" cy="72" rx="15" ry="4" fill="#ff3333" opacity="0.3" filter="url(#neon-warning-glow)" />

          {/* Warning sign assembly */}
          <g filter="url(#neon-warning-glow)" transform="translate(200, 35) scale(0.9)">
            {/* Red Glowing Triangle */}
            <polygon
              points="0,-40 35,20 -35,20"
              fill="#18181b"
              stroke="#ff3333"
              strokeWidth="4.5"
              strokeLinejoin="round"
            />
            {/* Exclamation point */}
            <line x1="0" y1="-15" x2="0" y2="0" stroke="#ff3333" strokeWidth="5.5" strokeLinecap="round" />
            <circle cx="0" cy="10" r="3.5" fill="#ff3333" />
          </g>
        </motion.g>
      </svg>
    </div>
  );
}
