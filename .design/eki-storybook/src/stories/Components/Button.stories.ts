import type { StoryObj, Meta } from '@storybook/html';
import { fn } from '@storybook/test';
import { createButton, Button } from './Button';
import feather from 'feather-icons';

const meta: Meta<Button> = {
  title: 'Components/Button',
  tags: ['autodocs'],

  parameters: {
    controls: { sort: 'none' },
    pseudo: { active: true,
      focus: true
     }
  },

  argTypes: {
    onClick: {
      name: 'Click event',
      description: 'Event triggered on click',
      action: 'clicked'
    },
    buttonLabel: {
      name: 'Button text',
      description: 'Modify button label text',
      control: 'text',
      if: { arg: 'iconOnly', eq: false },
    },
    buttonType: {
      name: 'Button type',
      description: 'Change button type',
      control: { type: 'select' },
      options: ['primary', 'secondary'],
    },
    buttonSize: {
      name: 'Button size',
      description: 'Change button size',
      control: { type: 'select' },
      options: ['large', 'small'],
    },
    iconDisplay: {
      name: 'Enable icon',
      description: 'Show or hide button icon',
      control: 'boolean'
    },
    iconOnly: {
      name: 'Display only icon',
      description: 'Toggle only button icon and remove label text',
      control: 'boolean',
      if: { arg: 'iconDisplay', eq: true },
    },
    iconPosition: {
      name: 'Position icon',
      description: 'Position icon before or after label',
      control: { type: 'select' },
      options: ['left', 'right'],
      if: { arg: 'iconDisplay', eq: true },
    },
    icon: {
      name: 'Icon',
      control: { type: 'text' },
      description: 'Feather icon name (e.g., "circle")',
      if: { arg: 'iconDisplay', eq: true },
    },
  },

  args: {
    buttonLabel: 'Default button',
    buttonType: 'primary',
    buttonSize: 'large',
    icon: 'plus',
    onClick: fn()
  },
  
  render: (args) => {
    const button = createButton(args);
    document.body.appendChild(button);
    feather.replace();
    document.body.removeChild(button);

    return button;
  },

} satisfies Meta<Button>;

export default meta;
type Story = StoryObj<Button>;

export const DefaultButton: Story = {
  args: {
    buttonLabel: 'Default button',
    iconDisplay: false,
    iconOnly: false,
  },
};

export const ButtonWithLeftIcon: Story = {
  args: {
    buttonLabel: 'Button with left icon',
    iconDisplay: true,
    iconOnly: false,
    iconPosition: 'left',
    icon: 'plus',
  },
};

export const ButtonWithRightIcon: Story = {
  args: {
    buttonLabel: 'Button with right icon',
    iconDisplay: true,
    iconOnly: false,
    iconPosition: 'right',
    icon: 'plus',
  },
};

export const ButtonWithOnlyIcon: Story = {
  args: {
    iconDisplay: true,
    iconOnly: true,
    iconPosition: 'left',
    icon: 'plus',
  },
};