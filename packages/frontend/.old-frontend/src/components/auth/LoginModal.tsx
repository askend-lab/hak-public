import { useUIStore } from '../../features';
import { useAuth } from '../../services/auth';

export function LoginModal() {
  const { activeModal, closeModal } = useUIStore();
  const { login } = useAuth();

  if (activeModal !== 'login') {
    return null;
  }

  const handleLogin = (): void => {
    login();
    closeModal();
  };

  return (
    <div role="dialog" aria-label="Login" className="feedback-modal__overlay">
      <div className="feedback-modal__form">
        <div className="feedback-modal__header">
          <h2 className="feedback-modal__title">Logi sisse</h2>
          <button type="button" onClick={closeModal} className="feedback-modal__close">×</button>
        </div>
        <p className="feedback-modal__intro">
          Ülesandesse lisamiseks pead olema sisse logitud.
        </p>
        <div className="feedback-modal__actions">
          <button type="button" onClick={closeModal} className="feedback-modal__btn feedback-modal__btn--cancel">
            Tühista
          </button>
          <button type="button" onClick={handleLogin} className="feedback-modal__btn feedback-modal__btn--submit">
            Logi sisse
          </button>
        </div>
      </div>
    </div>
  );
}
