import type { Meta, StoryObj } from '@storybook/html';
import { createDropdown, Dropdown } from './Dropdown';

const meta: Meta<Dropdown> = {
  title: 'Forms/Dropdown',
  tags: ['autodocs'],

  parameters: {
    controls: { sort: 'none' },
  },

  argTypes: {
    dropdownLabel: { 
      name: 'Dropdown Label',
      description: 'Label for the dropdown',
      control: 'text',
    },
    optionsCount: {
      name: 'Options Count',
      description: 'Number of options in the dropdown',
      control: {
        type: 'range',
        min: 1,
        max: 10,
        step: 1,
      },
    },
    multiple: {
      name: 'Multiple Selection',
      description: 'Allow multiple selections',
      control: 'boolean',
    },
  },

  args: {
    dropdownLabel: 'Select an option',
    optionsCount: 3,
    multiple: false,
  },
  
  render: (args) => {
    const dropdown = createDropdown(args);
    return dropdown;
  },
} satisfies Meta<Dropdown>;

export default meta;
type Story = StoryObj<Dropdown>;

export const SingleSelect: Story = {
  args: {
    dropdownLabel: 'Single Select',
    optionsCount: 3,
    multiple: false,
  },
};

export const MultiSelect: Story = {
  args: {
    dropdownLabel: 'Multi Select',
    optionsCount: 3,
    multiple: true,
  },
};
