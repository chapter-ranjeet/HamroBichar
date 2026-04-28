"use client";

import React from "react";

type Props = {
  text: string;
  className?: string;
  stagger?: number; // ms
};

export default function AnimatedHeadline({ text, className = "", stagger = 80 }: Props) {
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <h1 className={`headline-container ${className}`} aria-label={text}>
      {words.map((word, idx) => (
        <span
          key={idx}
          className="headline-word mr-2 inline-block"
          style={{ animationDelay: `${idx * stagger}ms` }}
        >
          {word}
        </span>
      ))}
    </h1>
  );
}
