import '../assets/scss/components/_button.scss';

export interface Button {
  buttonType: 'primary' | 'secondary';
  buttonSize: 'large' | 'small';
  buttonLabel?: string;
  iconDisplay?: boolean;
  iconOnly?: boolean;
  iconPosition?: 'left' | 'right';
  icon?: string;
  onClick?: () => void;
}

export const createButton = ({
  buttonType = 'primary',
  buttonSize = 'large',
  buttonLabel = 'Default button',
  iconDisplay = false,
  iconOnly = false,
  iconPosition = 'left',
  icon,
  onClick,
}: Button): HTMLButtonElement => {
  const button = document.createElement('button');
  button.type = 'button';

  const iconElement = icon ? document.createElement('i') : null;
  
  if (iconElement && icon) {
    iconElement.setAttribute('data-feather', icon);
  }

  if (iconOnly && iconElement) {
    button.appendChild(iconElement);
  } else {
    if (iconDisplay && (iconElement || buttonLabel)) {
      const labelText = document.createElement('span');

      if (buttonLabel) {
        labelText.innerText = buttonLabel;
      }

      if (iconElement) {
        if (iconPosition === 'left') {
          button.appendChild(iconElement);
          button.appendChild(labelText);
        } else {
          button.appendChild(labelText);
          button.appendChild(iconElement);
        }
      } else {
        button.appendChild(labelText);
      }
    } else if (buttonLabel) {
      button.innerText = buttonLabel;
    }
  }

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  const buttonClasses = [
    'button',
    `button--${buttonSize}`,
    `button--${buttonType}`
  ];

  if (iconDisplay || iconOnly) {
    buttonClasses.push('button--icon');
  }

  if (iconOnly) {
    buttonClasses.push('button--icon-only');
  }

  button.className = buttonClasses.join(' ');

  return button;
};
