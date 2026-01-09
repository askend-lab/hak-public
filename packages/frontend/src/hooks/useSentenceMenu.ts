import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DataService } from '@/services/dataService';

export function useSentenceMenu(): {
  openMenuId: string | null;
  menuAnchorEl: { [key: string]: HTMLElement | null };
  menuTasks: Array<{ id: string; name: string }>;
  isLoadingMenuTasks: boolean;
  menuSearchQuery: string;
  setMenuSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  handleMenuOpen: (event: React.MouseEvent, id: string) => Promise<void>;
  handleMenuClose: () => void;
} {
  const { user, isAuthenticated } = useAuth();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});
  const [menuTasks, setMenuTasks] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingMenuTasks, setIsLoadingMenuTasks] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState('');

  const handleMenuOpen = useCallback(async (event: React.MouseEvent, id: string) => {
    setMenuAnchorEl(prev => ({ ...prev, [id]: event.currentTarget as HTMLElement }));
    setOpenMenuId(id);

    if (isAuthenticated && user) {
      setIsLoadingMenuTasks(true);
      try {
        const dataService = DataService.getInstance();
        const tasks = await dataService.getUserTasks(user.id);
        setMenuTasks(tasks.map(t => ({ id: t.id, name: t.name })));
      } catch (error) {
        console.error('Failed to load tasks for menu:', error);
        setMenuTasks([]);
      } finally {
        setIsLoadingMenuTasks(false);
      }
    }
  }, [isAuthenticated, user]);

  const handleMenuClose = useCallback(() => {
    setOpenMenuId(null);
    setMenuSearchQuery('');
  }, []);

  return {
    openMenuId,
    menuAnchorEl,
    menuTasks,
    isLoadingMenuTasks,
    menuSearchQuery,
    setMenuSearchQuery,
    handleMenuOpen,
    handleMenuClose,
  };
}
