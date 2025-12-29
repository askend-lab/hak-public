import "choices.js/public/assets/styles/choices.min.css";
import Choices from "choices.js";
import "../assets/scss/components/_select.scss";

export interface Select {
  size: string;
  addLabel: boolean;
  optionsCount: number;
  selectState: string;
  checkbox: boolean;
  width: string;
  multipleSelect: boolean;
  valueDisplayStyle: string;
  removeBorder: boolean;
}

export const createSelect = ({
  size,
  addLabel,
  optionsCount,
  selectState,
  multipleSelect,
  width,
  valueDisplayStyle,
  checkbox,
  removeBorder
}: Select): HTMLDivElement => {
  const wrapper = document.createElement("div");
  wrapper.classList.add(
    "select__wrapper",
    `select__wrapper--${size}`,
    `select__wrapper--${selectState}`,
    `dropdown--${width}`,
    `select__wrapper__values--${valueDisplayStyle}`
  );

  if (checkbox === true) {
    wrapper.classList.add("select__wrapper--checkbox");
  }

  if (removeBorder === true) {
    wrapper.classList.add("select__wrapper--no-border");
  }

  if (addLabel === true) {
    const labelElement = document.createElement("label");
    labelElement.textContent = "Label";
    labelElement.className = "select__label";

    wrapper.appendChild(labelElement);
  }

  if (addLabel === false) {
    wrapper.classList.add("select__wrapper--no-label");
  }

  const selectElement = document.createElement("select");
  selectElement.className = "select__dropdown";

  if (selectState === "disabled") {
    selectElement.disabled = true;
  }

  if (multipleSelect) {
    selectElement.multiple = true;
  }

  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = "Label";
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  selectElement.appendChild(placeholderOption);

  for (let i = 1; i <= optionsCount; i++) {
    const optionElement = document.createElement("option");
    optionElement.value = `option-${i}`;
    optionElement.textContent = `Menu item`;
    optionElement.classList.add(valueDisplayStyle);
    selectElement.appendChild(optionElement);
  }

  wrapper.appendChild(selectElement);

  selectElement.addEventListener("change", () => {
    const choicesInner = wrapper.querySelector('.choices__inner');
    if (choicesInner && selectElement.selectedOptions.length > 0) {
      choicesInner.classList.add('is-selected');
    } else if (choicesInner && selectElement.selectedOptions.length === 0) {
      choicesInner.classList.remove('is-selected');
    }
  });
  
  setTimeout(() => {
    const choices = new Choices(selectElement, {
      allowHTML: true,
      searchEnabled: false,
      itemSelectText: "",
      shouldSort: false,
      searchChoices: false,
      placeholder: true,
      placeholderValue: "Label",
      removeItemButton: true,
      removeItems: true,
      closeDropdownOnSelect: false,
      renderSelectedChoices: "always",
    });
  
    if (selectState === "disabled") {
      choices.disable();
    }
  
    if (multipleSelect) {
      const dropdown = wrapper.querySelector(".choices__list--dropdown") as HTMLElement;
  
      if (dropdown) {
        dropdown.addEventListener("click", (event) => {
          const target = event.target as HTMLElement;
  
          if (target.classList.contains("choices__item--selectable")) {
            const value = target.getAttribute("data-value");
  
            if (value) {
              const selectedValues = choices.getValue(true);
  
              if (selectedValues.includes(value)) {
                choices.removeActiveItemsByValue(value);
  
                event.stopPropagation();
                choices.showDropdown(true);
              }
            }
          }
        });
      }
    }
  
    (selectElement as HTMLSelectElement).addEventListener("removeItem", () => {
      const choicesInner = wrapper.querySelector(".choices__inner");
      const selectedItems = choices.getValue(true);
  
      if (choicesInner && selectedItems.length === 0) {
        choicesInner.classList.remove("is-selected");
      }
    });
  
    (selectElement as HTMLSelectElement).addEventListener("change", () => {
      const choicesInner = wrapper.querySelector(".choices__inner");
      const selectedItems = choices.getValue(true);
  
      if (choicesInner && selectedItems.length > 0) {
        choicesInner.classList.add("is-selected");
      } else if (choicesInner && selectedItems.length === 0) {
        choicesInner.classList.remove("is-selected");
      }
    });
  }, 0);
  
  
  
  return wrapper;
};
