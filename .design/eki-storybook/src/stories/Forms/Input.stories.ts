import type { StoryObj, Meta } from '@storybook/html';
import { createInput, Input } from './Input';
import feather from 'feather-icons';

const meta: Meta<Input> = {
  title: 'Forms/Input',
  tags: ['autodocs'],

  argTypes: {
    inputSize: {
      name: 'Input size',
      description: 'Change input size',
      control: { type: 'select' },
      options: ['large', 'medium', 'small'],
    },
    inputLabelDisplay: {
      name: 'Enable label',
      description: 'Show or hide input label',
      control: 'boolean',
    },
    inputLabel: { 
      name: 'Input label',
      control: { type: 'text' },
      description: 'Label before input field',
      if: { arg: 'inputLabelDisplay', eq: true },
    },
    inputIconDisplay: {
      name: 'Enable icon',
      description: 'Show or hide input icon',
      control: 'boolean'
    },
    inputIcon: {
      name: 'Icon',
      control: { type: 'text' },
      description: 'Feather icon name (e.g., "circle")',
      if: { arg: 'inputIconDisplay', eq: true },
    },
    inputPlaceholder: {
      name: 'Placeholder',
      control: 'text',
      description: 'Placeholder text for the input field',
    },
    inputHelperTextDisplay: {
      name: 'Enable helper text',
      description: 'Show or hide helper text',
      control: 'boolean',
    },
    inputHelperText: {
      name: 'Helper text',
      control: { type: 'text' },
      description: 'Helper text for the input field',
      if: { arg: 'inputHelperTextDisplay', eq: true},
    },
    inputDisabled: {
      name: 'Disable input field',
      description: 'Disable input field',
      control: 'boolean'
    },
    inputError: {
      name: 'Show/hide error',
      description: 'Show/hide error',
      control: 'boolean',
      if: { arg: 'inputDisabled', eq: false },
    },
  },

  args: {
    inputSize: 'large',
    inputPlaceholder: 'Placeholder',
    inputLabelDisplay: false,
    inputLabel: 'Label',
    inputHelperTextDisplay: false,
    inputHelperText: 'This is a helper text.',
    inputIconDisplay: false,
    inputIcon: 'eye',
    inputDisabled: false,
    inputError: false,
  },
  
  render: (args) => {
    const input = createInput(args);
    document.body.appendChild(input);
    feather.replace();
    document.body.removeChild(input);

    return input;
  },

} satisfies Meta<Input>;

export default meta;
type Story = StoryObj<Input>;

export const DefaultInput: Story = {

};

export const InputWithLabel: Story = {
  args: {
    inputLabelDisplay: true,
  }
};

export const InputWithHelperText: Story = {
  args: {
    inputHelperTextDisplay: true,
  }
};

export const InputWithDecorator: Story = {
  args: {
    inputIconDisplay: true,
    inputIcon: 'eye',
  },
};

export const InputWithEverything: Story = {
  args: {
    inputLabelDisplay: true,
    inputIconDisplay: true,
    inputIcon: 'eye',
    inputHelperTextDisplay: true,
  },
};