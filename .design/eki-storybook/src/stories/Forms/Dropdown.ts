import '../assets/scss/components/_dropdown.scss';

export interface Dropdown {
  dropdownLabel: string;
  optionsCount: number;
  multiple?: boolean;
}

export const createDropdown = ({
  dropdownLabel,
  optionsCount = 1,
  multiple = false,
}: Dropdown): HTMLDivElement => {
  const dropdownContainer = document.createElement('div');

  if (dropdownLabel) {
    const label = document.createElement('label');    
    label.innerText = dropdownLabel;

    if(multiple) {
      label.htmlFor = 'dropdown-multiple';
    } else {
      label.htmlFor = 'dropdown-single';
    }

    dropdownContainer.appendChild(label);
  }

  const select = document.createElement('select');
  select.classList.add('dropdown-field');
  select.multiple = multiple;

  if(multiple) {
    select.name = 'dropdown-multiple';
    select.id = 'dropdown-multiple';
  } else {
    select.name = 'dropdown-multiple';
    select.id = 'dropdown-multiple';
  }

  for (let i = 1; i <= optionsCount; i++) {
    const optionElement = document.createElement('option');
    optionElement.value = `option-${i}`;
    optionElement.innerText = `Option ${i}`;
    select.appendChild(optionElement);
  }

  dropdownContainer.appendChild(select);

  return dropdownContainer;
};
