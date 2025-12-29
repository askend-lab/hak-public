import '../assets/scss/components/_checkbox.scss';

export interface Checkbox {
  name: string;
  count: number;
  enableFormControlLabel: boolean;
  formControlLabel: string;
  enableFormHelperText: boolean;
  formHelperText: string;
  checkboxSize: 'small' | 'medium' | 'large';
  checkboxColor: 'primary' | 'error' | 'warning' | 'info' | 'success';
  checkboxLabelPosition: 'start' | 'end' | 'top' | 'bottom';
  checkboxListPosition: 'vertical' | 'horizontal';
  disableCheckbox: boolean;
  onChange?: (event: Event) => void;
}

export const createCheckbox = ({
  name,
  count,
  enableFormControlLabel,
  formControlLabel,
  enableFormHelperText,
  formHelperText,
  checkboxSize,
  checkboxColor,
  checkboxLabelPosition,
  checkboxListPosition,
  disableCheckbox,
  onChange,
}: Checkbox): HTMLDivElement => {
  const selectedValue = "";
  const container = document.createElement('div');
  const wrapper = document.createElement('div');
  const formLabel = document.createElement('div');

  container.classList.add('checkbox-btn__container');
  wrapper.classList.add('checkbox-btn__wrapper');
  formLabel.classList.add('checkbox-list__label');

  for (let i = 0; i < count; i++) {
    const value = `option-${i + 1}`;

    const checkboxContainer = document.createElement('div');

    const checkboxButton = document.createElement('input');
    checkboxButton.type = 'checkbox';
    checkboxButton.name = 'checkboxesDefault';
    checkboxButton.value = value;
    checkboxButton.checked = value === selectedValue;

    checkboxButton.classList.add('checkbox-btn__input');

    let stateCounter = 0;

    checkboxButton.addEventListener('click', (event) => {
      stateCounter = (stateCounter + 1) % 3;
      if (stateCounter === 0) {
        checkboxButton.checked = false;
        checkboxButton.indeterminate = false;
      } else if (stateCounter === 1) {
        checkboxButton.checked = true;
        checkboxButton.indeterminate = false;
      } else if (stateCounter === 2) {
        checkboxButton.checked = false;
        checkboxButton.indeterminate = true;
      }

      if (onChange) {
        onChange(event);
      }
    });

    const labelElement = document.createElement('label');
    labelElement.htmlFor = value;
    labelElement.textContent = `${name}`;
    
    checkboxButton.id = value;

    const checkboxClasses = [
      'checkbox-btn',
      `checkbox-btn--${checkboxLabelPosition}`,
      `checkbox-btn--${checkboxSize}`,
      `checkbox-btn--${checkboxColor}`,
    ];

    const checkboxContainerClasses = [
      'checkbox-btn__container',
      `checkbox-btn__container--${checkboxListPosition}`,
    ]

    checkboxContainer.className = checkboxClasses.join(' ');
    container.className = checkboxContainerClasses.join(' ');

    if(disableCheckbox) {
      wrapper.classList.add('checkbox-btn__wrapper--disabled');
      checkboxButton.disabled = true;
    }

    if(checkboxColor === 'error') {
      wrapper.classList.add('checkbox-btn__wrapper--error')
    }

    checkboxContainer.appendChild(checkboxButton);
    checkboxContainer.appendChild(labelElement);
    container.appendChild(checkboxContainer);
  }

  if (enableFormControlLabel) {
    const formLabelElement = document.createElement('span');
    formLabelElement.classList.add('checkbox-btn__form-label');

    formLabelElement.textContent = formControlLabel;
    wrapper.appendChild(formLabelElement);
  }

  wrapper.appendChild(container);

  if (enableFormHelperText) {
    const formHelperTextElement = document.createElement('span');
    formHelperTextElement.classList.add('checkbox-btn__helper-text');

    formHelperTextElement.textContent = formHelperText;
    wrapper.appendChild(formHelperTextElement);
  }

  return wrapper;
}
