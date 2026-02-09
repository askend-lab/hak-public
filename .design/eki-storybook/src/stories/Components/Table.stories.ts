import type { StoryObj, Meta } from '@storybook/html';
import { createTable, Table } from './Table';

const meta: Meta<Table> = {
  title: 'Components/Table',
  tags: ['autodocs'],
  parameters: {
    controls: { sort: 'none' },
  },
  argTypes: {
    title: {
      name: 'Table title',
      control: 'text',
      description: 'Title of the table',
      table: { category: 'Table texts' },
    },
    showDescription: { 
      name: 'Show description',
      control: 'boolean', 
      description: 'Toggle to show or hide the description',
      table: { category: 'Table texts' },
    },
    description: { 
      name: 'Table description',
      control: 'text', 
      description: 'Description text of the table',
      if: { arg: 'showDescription', eq: true },
      table: { category: 'Table texts' },
    },
    cellText: {
      name: 'Table cell text',
      control: 'text',
      description: 'Text that appears inside table cells',
      table: { category: 'Table texts' },
    },
    cellSecondInstance: {
      name: 'Toggle table cell second instance',
      control: 'boolean',
      description: 'Toggle hide or show table cell second instance',
      table: { category: 'Table texts' },
    },
    cellSecondInstanceText: {
      name: 'Table cell second instance text',
      control: 'text',
      description: 'Table cell second instance text',
      if: { arg: 'cellSecondInstance', eq: true },
      table: { category: 'Table texts' },
    },
    tableSize : {
      name: 'Table size',
      control: { type: 'select' },
      options: ['small', 'medium'],
      description: 'Choose table size',
      table: { category: 'Table sizing' },
    },
    columns: {
      name: 'Number of columns',
      control: { type: 'range', min: 1, max: 10, step: 1 },
      description: 'The number of columns in the table',
      table: { category: 'Table sizing' },
    },
    rows: {
      name: 'Number of rows',
      control: { type: 'range', min: 1, max: 10, step: 1 },
      description: 'The number of rows in the table',
      table: { category: 'Table sizing' },
    },
    showHead: {
      name: 'Show table head',
      control: 'boolean',
      description: 'Toggle to show or hide the table head'
    },
    smallHeadSwitch: {
      name: 'Small table head cells',
      control: 'boolean',
      description: 'Switch to small table head cells',
      if: { arg: 'tableSize', eq: 'medium' },
      table: { category: 'Table sizing' },
    },
    smallBodySwitch: {
      name: 'Small body cells',
      control: 'boolean',
      description: 'Switch to small table body cells',
      if: { arg: 'tableSize', eq: 'medium' },
      table: { category: 'Table sizing' },
    },
    checkbox: {
      name: 'Toggle checkbox',
      control: 'boolean',
      description: 'Toggle hide or show checkbox',
      table: { category: 'Table cell additions' },
    },
    expandable: {
      name: 'Toggle expandable row',
      control: 'boolean',
      description: 'Toggle if rows are expandable',
      table: { category: 'Table cell additions' },
    },
    expandableText: {
      name: 'Expanded row text',
      control: 'text',
      description: 'Add text to the expanded rows',
      if: { arg: 'expandable', eq: true },
      table: { category: 'Table cell additions' },
    },
    sortSwitch: {
      name: 'Toggle sort icons',
      control: 'boolean',
      description: 'Toggle sort icons in head cells',
      table: { category: 'Table cell additions' },
    },
    sort: {
      name: 'Sort icon position',
      control: { type: 'select' },
      options: ['left', 'right', 'both'],
      description: 'Select sort icon position',
      if: { arg: 'sortSwitch', eq: true },
      table: { category: 'Table cell additions' },
    },
    overflow: {
      name: 'Toggle overflow',
      control: 'boolean',
      description: 'Toggle table overflow',
      if: { arg: 'iconRow', eq: false },
      table: { category: 'Table cell additions' },
    },
    iconRow: {
      name: 'Toggle icon row',
      control: 'boolean',
      description: 'Toggle hide or show icon row',
      if: { arg: 'overflow', eq: false },
      table: { category: 'Table cell additions' },
    },
    pagination: {
      name: 'Pagination',
      control: 'boolean',
      description: 'Toggle to show or hide pagination'
    },
  },
  args: {
    title: 'Table Title',
    showDescription: true,
    description: 'Additional description if required',
    cellText: 'Cell',
    cellSecondInstance: false,
    cellSecondInstanceText: 'Typography',
    tableSize: 'medium',
    columns: 3,
    rows: 3,
    showHead: true,
    smallHeadSwitch: false,
    smallBodySwitch: false,
    checkbox: false,
    expandable: false,
    expandableText: 'Add text',
    sortSwitch: false,
    sort: 'left',
    overflow: false,
    iconRow: false,
    pagination: false,
  },
  render: (args) => {
    return createTable(args);
  },
};

export default meta;
type Story = StoryObj<Table>;

export const DefaultTable: Story = {
  args: {

  }
};

export const SmallTable: Story = {
  args: {
    tableSize: 'small',
  }
};

export const SortTable: Story = {
  args: {
    sortSwitch: true,
    sort: 'right',
  }
};

export const SelectableTable: Story = {
  args: {
    checkbox: true,
  }
};

export const ExpandableTable: Story = {
  args: {
    expandable: true,
  }
};

export const OverflowTable: Story = {
  args: {
    overflow: true,
  }
};

export const IconRowTable: Story = {
  args: {
    cellText: '<i data-feather="check-circle"></i> Cell',
    iconRow: true,
  }
};

export const SecondInstanceTable: Story = {
  args: {
    cellSecondInstance: true,
    cellSecondInstanceText: 'Typography',
  }
};