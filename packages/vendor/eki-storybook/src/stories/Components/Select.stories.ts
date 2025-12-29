import type { Meta, StoryObj } from '@storybook/html';
import { createSelect, Select } from "./Select";

const meta: Meta<Select> = {
  title: "Components/Select",
  tags: ["autodocs"],

  parameters: {
    controls: { sort: "none" },
    pseudo: { active: false, focus: false },
  },

  argTypes: {
    size: { 
      name: "Size",
      description: "Select field size",
      control: { type: 'select' },
      options: ['medium', 'small'],
      table: { category: 'Select size' },
    },
    addLabel: {
      name: "Label",
      description: "Add label to select field",
      control: "boolean",
      table: { category: 'Select elements' },
    },
    optionsCount: { 
      name: "Number of options",
      description: "Choose the number of options displayed in a dropdown",
      control: { type: "range", min: 1, max: 10, step: 1 },
      table: { category: 'Select elements' },
    },
    selectState: {
      name: "Select field state",
      description: "Choose a state for the select field",
      control: { type: 'select' },
      options: ['default', 'disabled', 'error'],
      table: { category: 'Select settings' },
    },
    width: {
      name: "Select width",
      description: "Select field and dropdown width",
      control: { type: 'select' },
      options: ['default', 'auto'],
      table: { category: 'Select size' },
    },
    valueDisplayStyle: {
      name: "Value style",
      description: "Select displayed value styles",
      control: { type: 'select' },
      options: ['chip', 'default'],
      if: { arg: 'multipleSelect', eq: true },
      table: { category: 'Select settings' },
    },
    multipleSelect: {
      name: "Multiple select",
      description: "Switch on/off multiple select in dropdown",
      control: "boolean",
      table: { category: 'Select settings' },
    },
    checkbox: {
      name: "Checkboxes",
      description: "Add checkboxes to dropdown elements",
      control: "boolean",
      if: { arg: 'multipleSelect', eq: true },
      table: { category: 'Select settings' },
    },
    removeBorder: {
      name: "Remove border",
      description: "Remove border from the select element",
      control: "boolean",
      table: { category: 'Select settings' },
    }
  },

  args: {
    addLabel: true,
    optionsCount: 3,
    size: 'medium',
    selectState: 'default',
    multipleSelect: false,
    valueDisplayStyle: 'default',
    checkbox: false,
    width: 'default',
    removeBorder: false,
  },

  render: (args) => {
    return createSelect(args);
  },
} satisfies Meta<Select>;

export default meta;
type Story = StoryObj<Select>;

export const DefaultSelect: Story = {
  args: {

  },
};

export const SelectWithoutLabel: Story = {
  args: {
    addLabel: false,
  },
};

export const SmallSelect: Story = {
  args: {
    size: 'small',
  },
};

export const AutoWidthSelect: Story = {
  args: {
    width: 'auto',
  },
};

export const DisabledSelect: Story = {
  args: {
    selectState: 'disabled',
  },
};

export const ErrorSelect: Story = {
  args: {
    selectState: 'error',
  },
};

export const MultipleCheckboxSelect: Story = {
  args: {
    multipleSelect: true,
    checkbox: true,
  },
};

export const MultipleSelectChip: Story = {
  args: {
    multipleSelect: true,
    valueDisplayStyle: 'chip',
  },
};

export const SelectWithoutBorder: Story = {
  args: {
    removeBorder: true
  },
};
