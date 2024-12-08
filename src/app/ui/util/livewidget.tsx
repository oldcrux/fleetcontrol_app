import React from "react";

const LiveWidget = () => (
  <>
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div className="absolute h-3 w-3 rounded-full bg-red-500 opacity-50 animate-ripple"></div>
        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
      </div>
      <span className="font-normal text-gray-300">Live</span>
    </div>

    <style>
      {`@keyframes ripple {
        0% {
            transform: scale(0.8);
            opacity: 0.5;
        }
        100% {
            transform: scale(2.5);
            opacity: 0;
        }
        }
        .animate-ripple {
        animation: ripple 1.5s infinite;
        }`}{" "}
    </style>
  </>
);

export default LiveWidget;
