import { useState, useEffect, useCallback } from 'react';

import { Header, Footer, NotificationContainer } from '../components';
import { useAuth } from '../services/auth';
import { createTask, listTasks } from '../services/tasks';
import type { Task } from '../services/tasks';

export function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await listTasks(user.id);
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const handleCreateTask = () => {
    setIsModalOpen(true);
    setTaskName('');
    setTaskDescription('');
    setNameError('');
  };

  const handleSave = async () => {
    if (!taskName.trim()) {
      setNameError('Task name is required');
      return;
    }
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await createTask(user.id, {
        name: taskName.trim(),
        description: taskDescription.trim(),
      });
      if (response.success) {
        await loadTasks();
        setIsModalOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="app-page">
      <Header />
      <main className="app-main">
        <div className="app-main__header">
          <h1 className="app-main__title">Minu ülesanded</h1>
          <button className="button button--primary button--small" onClick={handleCreateTask} disabled={isLoading}>
            {isLoading ? 'Laadimine...' : 'Lisa ülesanne'}
          </button>
        </div>

        <div className="tasks-page__content">
        {tasks.length === 0 ? (
          <p>Ülesandeid pole veel. Loo oma esimene ülesanne!</p>
        ) : (
          <ul className="tasks-list">
            {tasks.map((task) => (
              <li key={task.id} className="task-card">
                <h3>{task.name}</h3>
                <p>{task.description}</p>
              </li>
            ))}
          </ul>
        )}
        </div>
      </main>

      <Footer />

      {isModalOpen && (
        <div role="dialog" className="feedback-modal__overlay">
          <div className="feedback-modal__form">
            <div className="feedback-modal__header">
              <h2 className="feedback-modal__title">Lisa ülesanne</h2>
              <button type="button" onClick={handleCancel} className="feedback-modal__close">×</button>
            </div>
            <div className="feedback-modal__field">
              <label htmlFor="task-name" className="feedback-modal__label">Ülesande nimi</label>
              <input
                id="task-name"
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Sisesta ülesande nimi"
                className="feedback-modal__input"
              />
              {nameError && <span role="alert" className="error">{nameError}</span>}
            </div>
            <div className="feedback-modal__field">
              <label htmlFor="task-description" className="feedback-modal__label">Kirjeldus</label>
              <textarea
                id="task-description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Sisesta ülesande kirjeldus"
                className="feedback-modal__textarea"
              />
            </div>
            <div className="feedback-modal__actions">
              <button type="button" onClick={handleCancel} className="feedback-modal__btn feedback-modal__btn--cancel">Tühista</button>
              <button type="button" onClick={() => { void handleSave(); }} className="feedback-modal__btn feedback-modal__btn--submit">Salvesta</button>
            </div>
          </div>
        </div>
      )}

      <NotificationContainer />
    </div>
  );
}
