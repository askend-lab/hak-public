// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

interface PatternBgProps {
  className?: string;
}

export default function PatternBg({ className }: PatternBgProps) {
  return (
    <div className={`landing-pattern ${className ?? ""}`} aria-hidden="true">
      <img src="/icons/Vector-1.svg" alt="" className="landing-pattern__el landing-pattern__el--wave" />
      <img src="/icons/Vector-2.svg" alt="" className="landing-pattern__el landing-pattern__el--chevron" />
      <img src="/icons/Vector-3.svg" alt="" className="landing-pattern__el landing-pattern__el--squares" />
      <img src="/icons/Vector-4.svg" alt="" className="landing-pattern__el landing-pattern__el--slash" />
    </div>
  );
}
