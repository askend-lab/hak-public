import { createPagination } from './Pagination';
import '../assets/scss/components/_table.scss';
import feather from 'feather-icons';

export interface Table {
  title: string;
  columns: number;
  rows: number;
  showDescription: boolean;
  cellText: string;
  cellSecondInstance: boolean;
  cellSecondInstanceText: string;
  tableSize: 'small' | 'medium';
  description: string;
  smallHeadSwitch: boolean;
  smallBodySwitch: boolean;
  checkbox: boolean;
  expandable: boolean;
  expandableText: string;
  showHead: boolean;
  sortSwitch: boolean;
  sort: 'left' | 'right' | 'both';
  overflow: boolean;
  iconRow: boolean;
  pagination: boolean;
}

export const createTable = ({
  title = 'Table Title',
  columns = 3,
  rows = 3,
  showDescription = true,
  description = 'Additional description if required',
  cellText = 'Cell',
  cellSecondInstance = false,
  cellSecondInstanceText = 'Typography',
  tableSize = 'medium',
  smallHeadSwitch = false,
  smallBodySwitch = false,
  checkbox = false,
  expandable = false,
  expandableText = 'Add text',
  showHead = true,
  sortSwitch = false,
  sort = 'left',
  overflow = false,
  iconRow = false,
  pagination = false,
}: Table): HTMLDivElement => {
  const tableWrapper = document.createElement('div');
  const tableContainer = document.createElement('div');
  const tableHead = document.createElement('div');
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');

  tableWrapper.appendChild(tableContainer);

  tableWrapper.classList.add('table__wrapper');
  tableContainer.classList.add('table__container');
  tableHead.classList.add('table__head');
  table.classList.add('table');
  tableHead.innerHTML = `<div class="table__title">${title}</div>`;
  if (showDescription) tableHead.innerHTML += `<span class="table__description">${description}</span>`;

  let rowSelector: HTMLElement | null = null;
  if (checkbox) {
    rowSelector = document.createElement('div');
    rowSelector.classList.add('table__selector');
    rowSelector.style.display = 'none';
    const selectedCount = document.createElement('span');
    selectedCount.classList.add('table__selected-count');
    selectedCount.textContent = '0 items selected';
    const trashButton = document.createElement('button');
    trashButton.classList.add('table__trash-btn');
    const trashIcon = document.createElement('i');
    trashIcon.setAttribute('data-feather', 'trash-2');
    trashIcon.classList.add('table__trash-icon');
    trashButton.appendChild(trashIcon);

    trashButton.addEventListener('click', () => {
      const checkboxes = table.querySelectorAll('.table__checkbox') as NodeListOf<HTMLInputElement>;
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.closest('tr')?.classList.remove('selected');
      });
      updateSelectedCount();
    });

    rowSelector.appendChild(selectedCount);
    rowSelector.appendChild(trashButton);
    tableWrapper.appendChild(rowSelector);
  }

  tableWrapper.appendChild(tableHead);

  if (showHead) {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    if (expandable) headerRow.innerHTML = '<th></th>';

    for (let i = 0; i < columns; i++) {
      const th = document.createElement('th');
      th.classList.add('table__cell');
      let thContent = '';

      if (checkbox && i === 0) {
        const headerCheckbox = document.createElement('input');
        headerCheckbox.type = 'checkbox';
        headerCheckbox.classList.add('table__checkbox');
        th.classList.add('table__cell--checkbox');
        headerCheckbox.addEventListener('change', (e) => {
          const checkboxes = table.querySelectorAll('.table__checkbox') as NodeListOf<HTMLInputElement>;
          const isChecked = (e.target as HTMLInputElement).checked;
          checkboxes.forEach((checkbox) => {
            checkbox.checked = isChecked;
            checkbox.closest('tr')?.classList.toggle('selected', isChecked);
          });
          updateSelectedCount();
        });
        th.appendChild(headerCheckbox);
      }

      if (sortSwitch) {
        if (sort === 'left' || sort === 'both') thContent += `<i data-feather="arrow-down" class="table__sort-icon"></i> `;
        thContent += `<span>Head</span>`;
        if (sort === 'right' || sort === 'both') thContent += ` <i data-feather="arrow-down" class="table__sort-icon"></i>`;
      } else {
        thContent = `<span>Head</span>`;
      }

      th.innerHTML += thContent;
      if (smallHeadSwitch || tableSize === 'small') th.classList.add('small');
      headerRow.appendChild(th);
    }

    if (checkbox) {
      headerRow.addEventListener('click', () => {
        const isSelected = headerRow.classList.contains('selected');
        if (isSelected) {
          headerRow.classList.remove('selected');
          const checkboxes = table.querySelectorAll('.table__checkbox') as NodeListOf<HTMLInputElement>;
          checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
            checkbox.closest('tr')?.classList.remove('selected');
          });
        } else {
          headerRow.classList.add('selected');
          const checkboxes = table.querySelectorAll('.table__checkbox') as NodeListOf<HTMLInputElement>;
          checkboxes.forEach((checkbox) => {
            checkbox.checked = true;
            checkbox.closest('tr')?.classList.add('selected');
          });
        }
        updateSelectedCount();
      });
    }

    if (overflow) {
      const emptyTh = document.createElement('th');
      emptyTh.classList.add('table__cell');
      headerRow.appendChild(emptyTh);
    }

    if (iconRow) {
      const emptyIconTh = document.createElement('th');
      emptyIconTh.classList.add('table__cell');
      headerRow.appendChild(emptyIconTh);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);
  }

  for (let i = 0; i < rows; i++) {
    const row = document.createElement('tr');
    row.classList.add('table__row');

    if (expandable) {
      const expandableTd = document.createElement('td');
      expandableTd.classList.add('table__toggle');
      if (smallBodySwitch || tableSize === 'small') expandableTd.classList.add('small');
      const button = document.createElement('button');
      const icon = document.createElement('i');
      icon.setAttribute('data-feather', 'chevron-down');
      button.appendChild(icon);
      expandableTd.appendChild(button);
      row.appendChild(expandableTd);

      const expandedRow = document.createElement('tr');
      expandedRow.innerHTML = `<td colspan="${columns + (expandable ? 1 : 0)}" class="expandable-row">${expandableText}</td>`;
      expandedRow.style.display = 'none';
      tbody.appendChild(row);
      tbody.insertBefore(expandedRow, row.nextSibling);

      button.addEventListener('click', (e) => {
        e.stopPropagation();
        expandedRow.style.display = expandedRow.style.display === 'table-row' ? 'none' : 'table-row';
        const isExpanded = expandedRow.style.display === 'table-row';
        icon.setAttribute('data-feather', isExpanded ? 'chevron-up' : 'chevron-down');
        feather.replace();
        row.classList.toggle('table__row--expanded', isExpanded);
      });
    } else {
      tbody.appendChild(row);
    }

    for (let j = 0; j < columns; j++) {
      const td = document.createElement('td');
      const cellWrapper = document.createElement('span');
      cellWrapper.classList.add('table__cell__wrapper');
      
      if (checkbox && j === 0) {
        const checkboxInput = document.createElement('input');
        checkboxInput.type = 'checkbox';
        checkboxInput.classList.add('table__checkbox');
        td.appendChild(checkboxInput);

        td.classList.add('table__cell--checkbox');
        
        const content = cellSecondInstance 
          ? `<span>${cellText}</span><span class="table__cell__instance">${cellSecondInstanceText}</span>`
          : `<span>${cellText}</span>`;
      
        cellWrapper.innerHTML = content;

        checkboxInput.addEventListener('change', (e) => {
          const isChecked = (e.target as HTMLInputElement).checked;
          row.classList.toggle('selected', isChecked);
          updateSelectedCount();
        });
      } else {
        const content = cellSecondInstance 
          ? `<span>${cellText}</span><span class="table__cell__instance">${cellSecondInstanceText}</span>`
          : `<span>${cellText}</span>`;
        
        cellWrapper.innerHTML = content;
      }

      td.appendChild(cellWrapper);

      if (smallBodySwitch || tableSize === 'small') td.classList.add('small');
      td.classList.add('table__cell');
      row.appendChild(td);
    }

    if (checkbox) {
      row.addEventListener('click', (e) => {
        const checkbox = row.querySelector('.table__checkbox') as HTMLInputElement;
        if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
        row.classList.toggle('selected', checkbox.checked);
        updateSelectedCount();
      });
    }

    if (overflow) {
      const overflowTd = document.createElement('td');
      overflowTd.classList.add('table__overflow');
      const overflowContainer = document.createElement('span');
      const overflowIcon = document.createElement('i');
      overflowIcon.setAttribute('data-feather', 'more-vertical');
      overflowContainer.appendChild(overflowIcon);
      row.appendChild(overflowTd);
      overflowTd.appendChild(overflowContainer);
    }

    if (iconRow) {
      const iconTd = document.createElement('td');
      iconTd.classList.add('table__cell', 'table__cell--icon');
      const infoIcon = document.createElement('i');
      infoIcon.setAttribute('data-feather', 'info');
      iconTd.appendChild(infoIcon);
      row.appendChild(iconTd);
    }
    
  }

  const updateSelectedCount = () => {
    const selectedRows = tableContainer.querySelectorAll('.table__row.selected').length;
    const selectedCount = tableWrapper.querySelector('.table__selected-count') as HTMLElement;
    selectedCount.textContent = `${selectedRows} items selected`;
    rowSelector?.style.setProperty('display', selectedRows > 0 ? 'flex' : 'none');
  };

  table.appendChild(tbody);
  tableContainer.appendChild(table);

  if (tableSize === 'small') {
    const controlsContainer = document.createElement('div');
    controlsContainer.classList.add('table__foot');

    const dropdownContainer = document.createElement('div');
    dropdownContainer.classList.add('table__foot__dropdown');
  
    const label = document.createElement('span');
    label.textContent = 'Rows per page:';
    label.classList.add('table__foot__label');
  
    const dropdown = document.createElement('select');
    dropdown.classList.add('table__foot__select');
    for (let i = 1; i <= rows; i++) {
      const option = document.createElement('option');
      option.value = String(i);
      option.textContent = `${i}`;
      dropdown.appendChild(option);
    }

    const defaultVisibleRows = Math.min(rows, rows);
    dropdown.value = String(defaultVisibleRows);
  
    const rowCountIndicator = document.createElement('span');
    rowCountIndicator.classList.add('table__foot__count');
    rowCountIndicator.textContent = `1-${defaultVisibleRows} of ${rows}`;
  
    const chevronContainer = document.createElement('div');
    chevronContainer.classList.add('table__foot__navigation');

    const selectContainer = document.createElement('div');
    selectContainer.classList.add('table__foot__select-container');
  
    const leftChevron = document.createElement('button');
    leftChevron.classList.add('table__foot__chevron', 'table__foot__chevron--left');
    leftChevron.innerHTML = `<i data-feather="chevron-left"></i>`;
  
    const rightChevron = document.createElement('button');
    rightChevron.classList.add('table__foot__chevron', 'table__foot__chevron--right');
    rightChevron.innerHTML = `<i data-feather="chevron-right"></i>`;
  
    dropdownContainer.appendChild(label);
    selectContainer.appendChild(dropdown);
    dropdownContainer.appendChild(selectContainer);
    controlsContainer.appendChild(dropdownContainer);
    controlsContainer.appendChild(rowCountIndicator);
    chevronContainer.appendChild(leftChevron);
    chevronContainer.appendChild(rightChevron);
    controlsContainer.appendChild(chevronContainer);
    tableWrapper.appendChild(controlsContainer);
  
    let currentStartIndex = 0;
    let visibleRowsCount = Number(dropdown.value);
  
    const updateVisibleRows = () => {
      const allRows = Array.from(tbody.querySelectorAll('.table__row')) as HTMLElement[];
      allRows.forEach((row, index) => {
        row.style.display =
          index >= currentStartIndex && index < currentStartIndex + visibleRowsCount
            ? ''
            : 'none';
      });
  
      const start = currentStartIndex + 1;
      const end = Math.min(currentStartIndex + visibleRowsCount, rows);
      rowCountIndicator.textContent = `${start}-${end} of ${rows}`;
    };
  
    dropdown.addEventListener('change', () => {
      visibleRowsCount = Number(dropdown.value);
      currentStartIndex = 0;
      updateVisibleRows();
    });
  
    updateVisibleRows();
  }  

  if (pagination) {
    tableWrapper.appendChild(createPagination({
      count: 7,
      shape: 'rounded',
      showArrows: true,
      showAll: true,
    }));
  }

  setTimeout(() => feather.replace(), 100);
  return tableWrapper;
};
