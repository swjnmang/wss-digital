import React from 'react';

export type FeedbackStatus = 'correct' | 'incorrect' | null;

interface FeedbackIconProps {
  status: FeedbackStatus;
}

export function FeedbackIcon({ status }: FeedbackIconProps) {
  if (!status) return null;

  const isCorrect = status === 'correct';
  const strokeColor = isCorrect ? '#16a34a' : '#dc2626';
  const path = isCorrect
    ? 'M5 13l4 4L19 7'
    : 'M6 6l12 12M6 18L18 6';

  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke={strokeColor}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}
