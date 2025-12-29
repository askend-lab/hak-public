import type { Meta, StoryObj } from '@storybook/html';
import { fn } from '@storybook/test';
import { createRadioButton, RadioButton } from './RadioButton';

const meta: Meta<RadioButton> = {
  title: 'Forms/RadioButton',
  tags: ['autodocs'],

  parameters: {
    controls: { sort: 'none' },
  },

  argTypes: {
    onClick: {
      name: 'Click event',
      description: 'Event triggered on click',
      action: 'clicked'
    },
    name: { 
      name: 'Radio buttons label',
      description: 'Name attribute for the radio buttons',
      control: 'text',
    },
    count: { 
      name: 'Radio buttons count',
      description: 'Number of radio buttons to display',
      control: {
        type: 'range',
        min: 1,
        max: 10,
        step: 1
      },
    },
    labelPosition: {
      name: 'Label Position',
      description: 'Position of the label relative to the radio button',
      control: { type: 'select' },
      options: ['start', 'end', 'top', 'bottom'],
    },
    radioSize: {
      name: 'Radio button size',
      description: 'Radio button size',
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
    },
    listPosition: {
      name: 'List position',
      description: 'Set list position either vertical or horizontal',
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
    },
    btnState: {
      name: 'Radio button state',
      description: 'Radio button state',
      control: { type: 'select' },
      options: ['default', 'error', 'warning', 'success'],
    },
    displayFormLabel: {
      name: 'Display form label',
      description: 'Display form label before radio buttons',
      control: 'boolean',
    },
    formLabel: {
      name: 'Form label',
      description: 'Form label',
      control: 'text',
      if: { arg: 'displayFormLabel', eq: true },
    },
    displayHelperText: {
      name: 'Display helper text',
      description: 'Display helper text after radio buttons',
      control: 'boolean',
    },
    helperText: {
      name: 'Helper text',
      description: 'Helper text',
      control: 'text',
      if: { arg: 'displayHelperText', eq: true },
    },
    disabled: {
      name: 'Disable button',
      description: 'Disable button',
      control: 'boolean',
    }
  },

  args: {
    name: 'Label',
    count: 3,
    labelPosition: 'end',
    radioSize: 'small',
    listPosition: 'vertical',
    btnState: 'default',
    displayFormLabel: false,
    formLabel: 'Label',
    displayHelperText: false,
    helperText: 'Helper text',
    disabled: false,
    onClick: fn(),
  },
  
  render: (args) => {
    const radioButton = createRadioButton(args);
    return radioButton;
  },
} satisfies Meta<RadioButton>;

export default meta;
type Story = StoryObj<RadioButton>;

export const DefaultRadio: Story = {

};

export const RadioHorizontalOrientation: Story = {
  args: {
    listPosition: 'horizontal',
  }
};

export const RadioFormLabel: Story = {
  args: {
    displayFormLabel: true,
    formLabel: 'Label'
  }
};

export const RadioHelperText: Story = {
  args: {
    displayHelperText: true,
    helperText: 'Helper text'
  }
};

export const RadioFormLabelAndHelperText: Story = {
  args: {
    displayFormLabel: true,
    formLabel: 'Label',
    displayHelperText: true,
    helperText: 'Helper text'
  }
};

export const LargeRadioButton: Story = {
  args: {
    count: 1,
    radioSize: 'large',
  }
};

export const MediumRadioButton: Story = {
  args: {
    count: 1,
    radioSize: 'medium',
  }
};

export const SmallRadioButton: Story = {
  args: {
    count: 1,
    radioSize: 'small',
  }
};

export const RadioLabelTopPostiton: Story = {
  args: {
    count:  1,
    labelPosition: 'top',
  }
};

export const RadioLabelBottomPostiton: Story = {
  args: {
    count:  1,
    labelPosition: 'bottom',
  }
};

export const RadioLabelStartPostiton: Story = {
  args: {
    count:  1,
    labelPosition: 'start',
  }
};

export const RadioLabelEndPostiton: Story = {
  args: {
    count:  1,
    labelPosition: 'end',
  }
};

export const RadioDisabled: Story = {
  args: {
    disabled: true,
  }
};