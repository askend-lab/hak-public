// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../features/auth/services/context";
import { useDataService } from "../contexts/DataServiceContext";

interface ActivityMetric {
  label: string;
  value: number;
  icon: string;
}
interface RecentActivity {
  id: string;
  description: string;
  timestamp: Date;
}

function MetricCard({ metric }: { metric: ActivityMetric }) {
  return (
    <div className="dashboard__metric-card">
      <div className="dashboard__metric-icon">{metric.icon}</div>
      <div className="dashboard__metric-content">
        <span className="dashboard__metric-value">{metric.value}</span>
        <span className="dashboard__metric-label">{metric.label}</span>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: RecentActivity }) {
  return (
    <div className="dashboard__activity-item">
      <div className="dashboard__activity-dot"></div>
      <div className="dashboard__activity-content">
        <span className="dashboard__activity-description">
          {activity.description}
        </span>
        <span className="dashboard__activity-time">
          {activity.timestamp.toLocaleTimeString("et-EE", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

function QuickLinks() {
  return (
    <div className="dashboard__section">
      <h2 className="dashboard__section-title">Kiirlingid</h2>
      <div className="dashboard__quick-links">
        <button className="dashboard__quick-link">
          <span className="dashboard__quick-link-icon">🎤</span>
          <span>Uus süntees</span>
        </button>
        <button className="dashboard__quick-link">
          <span className="dashboard__quick-link-icon">📋</span>
          <span>Loo ülesanne</span>
        </button>
      </div>
    </div>
  );
}

function ActivitySection({
  recentActivity,
}: {
  recentActivity: RecentActivity[];
}) {
  return (
    <div className="dashboard__section">
      <h2 className="dashboard__section-title">Hiljutine tegevus</h2>
      <div className="dashboard__activity-list">
        {recentActivity.length > 0 ? (
          recentActivity.map((a) => <ActivityItem key={a.id} activity={a} />)
        ) : (
          <p className="dashboard__empty">Tegevust pole veel</p>
        )}
      </div>
    </div>
  );
}

function useDashboardData() {
  const { user, isAuthenticated } = useAuth();
  const [metrics, setMetrics] = useState<ActivityMetric[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dataService = useDataService();
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      let taskCount = 0,
        entryCount = 0;
      if (isAuthenticated && user) {
        const tasks = await dataService.getUserTasks(user.id);
        taskCount = tasks.length;
        entryCount = tasks.reduce((sum, task) => sum + task.entryCount, 0);
      }
      setMetrics([
        { label: "Ülesanded", value: taskCount, icon: "📋" },
        { label: "Kirjed", value: entryCount, icon: "📝" },
      ]);
      setRecentActivity([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, dataService]);
  useEffect(() => {
    loadData();
  }, [loadData]);
  return { metrics, recentActivity, isLoading, isAuthenticated };
}

export default function Dashboard() {
  const { metrics, recentActivity, isLoading, isAuthenticated } =
    useDashboardData();
  if (isLoading)
    return (
      <div className="dashboard">
        <div className="dashboard__loading">
          <div className="loader-spinner loader-spinner--lg"></div>
        </div>
      </div>
    );
  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Töölaud</h1>
        <p className="dashboard__subtitle">Rakenduse aktiivsuse ülevaade</p>
      </div>
      <div className="dashboard__metrics">
        {metrics.map((m) => (
          <MetricCard key={m.label} metric={m} />
        ))}
      </div>
      <div className="dashboard__sections">
        <ActivitySection recentActivity={recentActivity} />
        <QuickLinks />
      </div>
      {!isAuthenticated && (
        <div className="dashboard__auth-prompt">
          <p>Logi sisse, et näha oma aktiivsust ja statistikat.</p>
        </div>
      )}
    </div>
  );
}
