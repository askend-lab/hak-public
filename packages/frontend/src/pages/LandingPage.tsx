// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useCallback } from "react";
import { ROLE_CONFIGS } from "@/config/onboardingConfig";
import { UserRole } from "@/types/onboarding";
import PatternBg from "@/components/ui/PatternBg";
import LandingDemo from "./LandingDemo";
import LandingExerciseCard from "./LandingExerciseCard";

const LANDING_EXERCISES = [
  {
    id: "valted",
    title: "Välted",
    subtitle: "II VÄLTES või III VÄLTES",
    entries: [
      { id: "valted-1", text: "Mari võttis tassi", stressedText: "Mari v<õt]t+is t<as]si" },
      { id: "valted-2", text: "Ta valas mahla tassi", stressedText: "ta vala+s m<ahla t<as]si" },
    ],
  },
  {
    id: "peenendus",
    title: "Peenendus",
    subtitle: "Harjuta n ja n'",
    entries: [
      { id: "peenendus-1", text: "tonn", stressedText: "t<on]n" },
      { id: "peenendus-2", text: "pani", stressedText: "pan+i" },
    ],
  },
] as const;

const ROLE_AVATARS: Record<string, string> = {
  learner: "/icons/student-avatar.png",
  teacher: "/icons/teacher-avatar.png",
  specialist: "/icons/researcher-avatar.png",
};

const ROLE_DATIVE_TITLES: Record<string, string> = {
  learner: "Õppijale",
  teacher: "Õpetajale",
  specialist: "Uurijale",
};

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const roles = Object.values(ROLE_CONFIGS);

  const handleLogin = useCallback(() => {
    onLogin();
  }, [onLogin]);

  return (
    <div className="landing">
      <HeroSection onLogin={handleLogin} />
      <ExercisesSection />
      <RolesSection roles={roles} />
    </div>
  );
}

function HeroSection({ onLogin }: { onLogin: () => void }) {
  return (
    <section className="landing__hero">
      <PatternBg />
      <div className="landing__hero-inner">
        <h1 className="landing__hero-title">
          Eesti keele häälduse õppimise ja õpetamise abivahend
        </h1>
        <p className="landing__hero-description">
          Logi sisse ja sisesta lause või sõna, et kuulata selle hääldust ja uurida variante
        </p>
        <div className="landing__hero-demo">
          <LandingDemo />
        </div>
        <button className="button button--primary landing__hero-cta" onClick={onLogin}>
          Hakka harjutama
        </button>
      </div>
    </section>
  );
}

function ExercisesSection() {
  return (
    <section className="landing__exercises">
      <div className="landing__exercises-inner">
        <h2 className="landing__section-title">Proovi mängida hääldusharjutusi</h2>
        <div className="landing__exercise-cards">
          {LANDING_EXERCISES.map((exercise) => (
            <LandingExerciseCard
              key={exercise.id}
              title={exercise.title}
              subtitle={exercise.subtitle}
              entries={exercise.entries}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface RoleCardData {
  id: UserRole;
  descriptionEt: string;
}

function RolesSection({ roles }: { roles: RoleCardData[] }) {
  return (
    <section className="landing__roles">
      <PatternBg />
      <div className="landing__roles-inner">
        <div className="landing__role-cards">
          {roles.map((role) => (
            <div key={role.id} className="role-card role-card--landing">
              <div className="role-card-avatar">
                <img
                  src={ROLE_AVATARS[role.id] || "/icons/rolli_avatar.png"}
                  alt=""
                />
              </div>
              <h3 className="role-card-title">
                {ROLE_DATIVE_TITLES[role.id] || role.id}
              </h3>
              <p className="role-card-description">{role.descriptionEt}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
