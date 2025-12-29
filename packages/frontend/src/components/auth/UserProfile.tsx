import { useAuth } from '../../services/auth';

interface UserStats {
  tasksCreated: number;
  totalEntries: number;
  createdAt: string;
}

interface UserProfileProps {
  stats?: UserStats;
}

export function UserProfile({ stats }: UserProfileProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  const defaultStats: UserStats = stats ?? {
    tasksCreated: 0,
    totalEntries: 0,
    createdAt: new Date().toISOString().split('T')[0] || '',
  };

  return (
    <div className="user-profile">
      <div className="user-profile__header">
        {user.picture && (
          <img src={user.picture} alt={user.name ?? 'User'} className="user-profile__avatar" />
        )}
        <div>
          <h2 className="user-profile__name">{user.name ?? user.email}</h2>
          <p className="user-profile__email">{user.email}</p>
        </div>
      </div>

      <div className="user-profile__stats">
        <div className="stat">
          <span className="user-profile__stat-value">{defaultStats.tasksCreated}</span>
          <span className="user-profile__stat-label">Tasks Created</span>
        </div>
        <div className="stat">
          <span className="user-profile__stat-value">{defaultStats.totalEntries}</span>
          <span className="user-profile__stat-label">Total Entries</span>
        </div>
        <div className="stat">
          <span className="user-profile__stat-value user-profile__stat-value--small">{defaultStats.createdAt}</span>
          <span className="user-profile__stat-label">Member Since</span>
        </div>
      </div>
    </div>
  );
}
