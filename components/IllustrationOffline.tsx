"use client";

import React from "react";
import { motion } from "framer-motion";

export function IllustrationOffline() {
  return (
    <div className="relative w-full max-w-[450px] h-[320px] mx-auto flex items-center justify-center select-none overflow-visible">
      {/* Background Concentric Circles - matching the screenshot */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top Left Circle Group */}
        <motion.div
          className="absolute -top-16 -left-16 w-64 h-64 rounded-full border border-red-100/50"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -top-8 -left-8 w-48 h-48 rounded-full border border-red-50/50"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Center-Left Concentric Circle */}
        <motion.div
          className="absolute top-1/2 -left-24 -translate-y-1/2 w-80 h-80 rounded-full border border-red-100/40"
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bottom Right Circle Group */}
        <motion.div
          className="absolute -bottom-24 -right-12 w-80 h-80 rounded-full border border-red-100/60"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-12 -right-4 w-56 h-56 rounded-full border border-red-100/40"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bottom Left Circle */}
        <motion.div
          className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full border border-red-100/40"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Center-Right Concentric Circle */}
        <motion.div
          className="absolute top-6 -right-24 w-72 h-72 rounded-full border border-red-100/30"
          animate={{ scale: [1, 1.07, 1] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating 3D Card Container */}
      <motion.div
        className="relative bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-1 z-10 border border-gray-100/80 w-[240px] h-[240px] flex flex-col items-center justify-center overflow-hidden"
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src="/screen 3.png"
          alt="Offline"
          className="w-full h-full object-cover rounded-[22px]"
        />
      </motion.div>
    </div>
  );
}
