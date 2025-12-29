import '../assets/scss/components/_modal.scss';
import feather from 'feather-icons';

export interface Modal {
  title: string;
  description: string;
  showDescription: boolean;
  size: 'small' | 'medium' | 'large';
  variant: 'soft' | 'outlined';
  color: 'primary' | 'neutral' | 'danger' | 'success' | 'warning';
}

export const createModal = ({ 
  title = 'Modal title', 
  showDescription = true, 
  description = 'Description', 
  size = 'small', 
  variant = 'soft', 
  color = 'primary' 
}: Modal): HTMLDivElement => {
  const modal = document.createElement('div');
  modal.classList.add('modal', `modal--${size}`, `modal--${color}--${variant}`, `modal--${variant}`);

  const modalTop = document.createElement('div');
  modalTop.classList.add('modal__top');

  const closeButton = document.createElement('button');
  closeButton.classList.add('modal__close');
  closeButton.innerHTML = feather.icons.x.toSvg();

  const modalTitle = document.createElement('h2');
  modalTitle.innerText = title;

  modalTop.appendChild(modalTitle);
  modalTop.appendChild(closeButton);

  modal.appendChild(modalTop);

  if (showDescription) {
    const modalDescription = document.createElement('p');
    modalDescription.innerText = description;
    modal.appendChild(modalDescription);
  }

  return modal;
};
