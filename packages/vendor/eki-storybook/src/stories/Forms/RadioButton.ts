import '../assets/scss/components/_radio-button.scss';

export interface RadioButton {
  name: string;
  count: number;
  labelPosition: 'start' | 'end' | 'top' | 'bottom';
  radioSize: 'small' | 'medium' | 'large';
  listPosition: 'vertical' | 'horizontal';
  btnState: 'default' | 'error' | 'warning' | 'success';
  displayFormLabel?: boolean;
  formLabel: string;
  displayHelperText?: boolean;
  helperText: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const createRadioButton = ({
  name,
  count,
  labelPosition = 'end',
  radioSize = 'large',
  listPosition = 'vertical',
  btnState = 'default',
  displayFormLabel = false,
  formLabel = 'Label',
  displayHelperText = false,
  helperText = 'Helper text',
  disabled = false,
  onClick,
}: RadioButton): HTMLDivElement => {
  const selectedValue = "option-1";

  const container = document.createElement('div');
  const wrapper = document.createElement('div');

  container.classList.add('radio-btn__container');

  wrapper.classList.add('radio-btn__wrapper');

  const radioClasses = [
    'radio-btn',
    `radio-btn--${labelPosition}`,
    `radio-btn--${radioSize}`,
    `radio-btn--${btnState}`,
  ];

  if (onClick) {
    container.addEventListener('click', onClick);
  }

  if (disabled) {
    radioClasses.push('radio-btn--disabled');
  };

  if (listPosition == 'horizontal') {
    container.classList.add('radio-btn--horizontal');
  }

  if (displayFormLabel) {
    const formLabelElement = document.createElement('span');
    formLabelElement.classList.add('radio-btn__form-label');

    formLabelElement.textContent = formLabel;
    wrapper.appendChild(formLabelElement);
  }

  wrapper.appendChild(container);

  if (displayHelperText) {
    const helperTextElement = document.createElement('span');
    helperTextElement.classList.add('radio-btn__helper-text');

    helperTextElement.textContent = helperText;
    wrapper.appendChild(helperTextElement);
  }

  for (let i = 0; i < count; i++) {
    const value = `option-${i + 1}`;

    const radioButtonContainer = document.createElement('div');
    radioButtonContainer.classList.add('radio-button-container');

    const radioButton = document.createElement('input');
    radioButton.type = 'radio';
    radioButton.name = name;
    radioButton.value = value;
    radioButton.checked = value === selectedValue;

    if (disabled) {
      radioButton.disabled = true;
    }

    const labelElement = document.createElement('label');
    labelElement.htmlFor = value;
    labelElement.textContent = `${name}`;
    
    radioButton.id = value;

    radioButtonContainer.appendChild(labelElement);
    radioButtonContainer.appendChild(radioButton);

    container.appendChild(radioButtonContainer);

    radioButtonContainer.className = radioClasses.join(' ');
  }

  return wrapper;
}
