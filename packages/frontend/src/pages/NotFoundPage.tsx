// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <h1>404</h1>
      <p>Lehekülge ei leitud</p>
      <button
        className="btn btn--primary"
        onClick={() => { void navigate("/synthesis"); }}
      >
        Tagasi avalehele
      </button>
    </div>
  );
}
