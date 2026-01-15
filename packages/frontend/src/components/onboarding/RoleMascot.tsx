 
'use client';

interface RoleMascotProps {
  variant: 'wave' | 'point' | 'think';
  className?: string;
}

/**
 * RoleMascot - SVG comma-like character with different poses
 * 
 * Variants:
 * - wave: Friendly waving gesture (Learner)
 * - point: Pointing gesture (Teacher)
 * - think: Thinking pose with hand on chin (Specialist)
 */
export default function RoleMascot({ variant, className = '' }: RoleMascotProps) {
  // Different arm positions based on variant
  const getLeftArm = () => {
    switch (variant) {
      case 'wave':
        // Arm waving up to the left
        return (
          <path 
            d="M28 42 Q18 32 12 28 Q8 26 10 22"
            stroke="#173148"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        );
      case 'point':
        // Arm down relaxed
        return (
          <path 
            d="M28 42 Q22 48 20 55"
            stroke="#173148"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        );
      case 'think':
        // Hand on chin, thinking
        return (
          <path 
            d="M28 42 Q20 40 22 48 Q24 52 30 50"
            stroke="#173148"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        );
    }
  };

  const getRightArm = () => {
    switch (variant) {
      case 'wave':
        // Arm relaxed
        return (
          <path 
            d="M52 42 Q58 48 60 55"
            stroke="#173148"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        );
      case 'point':
        // Arm pointing to the right
        return (
          <path 
            d="M52 42 Q62 38 72 35 Q76 34 80 36"
            stroke="#173148"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        );
      case 'think':
        // Arm relaxed
        return (
          <path 
            d="M52 42 Q58 48 60 55"
            stroke="#173148"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
        );
    }
  };

  // Different eye expressions
  const getEyes = () => {
    switch (variant) {
      case 'wave':
        // Happy, slightly upward looking eyes
        return (
          <>
            <ellipse cx="32" cy="30" rx="4" ry="5" fill="white" />
            <ellipse cx="48" cy="30" rx="4" ry="5" fill="white" />
            <circle cx="33" cy="29" r="2.5" fill="#173148" />
            <circle cx="49" cy="29" r="2.5" fill="#173148" />
          </>
        );
      case 'point':
        // Confident, forward looking eyes
        return (
          <>
            <ellipse cx="32" cy="30" rx="4" ry="5" fill="white" />
            <ellipse cx="48" cy="30" rx="4" ry="5" fill="white" />
            <circle cx="34" cy="30" r="2.5" fill="#173148" />
            <circle cx="50" cy="30" r="2.5" fill="#173148" />
          </>
        );
      case 'think':
        // Looking up, thinking eyes
        return (
          <>
            <ellipse cx="32" cy="30" rx="4" ry="5" fill="white" />
            <ellipse cx="48" cy="30" rx="4" ry="5" fill="white" />
            <circle cx="32" cy="27" r="2.5" fill="#173148" />
            <circle cx="48" cy="27" r="2.5" fill="#173148" />
          </>
        );
    }
  };

  // Different mouth expressions
  const getMouth = () => {
    switch (variant) {
      case 'wave':
        // Big smile
        return (
          <path 
            d="M34 42 Q40 48 46 42" 
            stroke="white" 
            strokeWidth="2.5" 
            fill="none"
            strokeLinecap="round"
          />
        );
      case 'point':
        // Confident smile
        return (
          <path 
            d="M35 42 Q40 46 45 42" 
            stroke="white" 
            strokeWidth="2.5" 
            fill="none"
            strokeLinecap="round"
          />
        );
      case 'think':
        // Thoughtful, slight smile
        return (
          <path 
            d="M36 43 Q40 45 44 43" 
            stroke="white" 
            strokeWidth="2.5" 
            fill="none"
            strokeLinecap="round"
          />
        );
    }
  };

  return (
    <svg 
      className={`role-mascot role-mascot--${variant} ${className}`}
      viewBox="0 0 80 100" 
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Comma-shaped body */}
      <path 
        d="M40 8 
           Q62 8 62 35 
           Q62 55 50 70 
           Q42 80 38 88 
           Q34 94 28 92 
           Q22 90 26 82 
           Q32 72 36 60 
           Q40 48 38 38 
           Q36 28 30 22 
           Q24 16 28 10 
           Q32 6 40 8"
        fill="#173148"
      />
      
      {/* Face area - lighter inner part */}
      <ellipse cx="40" cy="34" rx="16" ry="18" fill="#173148" />
      
      {/* Eyes */}
      {getEyes()}
      
      {/* Mouth */}
      {getMouth()}
      
      {/* Arms */}
      {getLeftArm()}
      {getRightArm()}
    </svg>
  );
}
