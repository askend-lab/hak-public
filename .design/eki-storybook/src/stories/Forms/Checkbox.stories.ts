import type { Meta, StoryObj } from '@storybook/html';
import { fn } from '@storybook/test';
import { createCheckbox, Checkbox } from './Checkbox';

const meta: Meta<Checkbox> = {
  title: 'Forms/Checkbox',
  tags: ['autodocs'],

  parameters: {
    controls: { sort: 'none' },
  },

  argTypes: {
    name: { 
      name: 'Checkboxes label',
      description: 'Name attribute for the radio buttons',
      control: 'text',
    },
    count: { 
      name: 'Checkboxes count',
      description: 'Number of radio buttons to display',
      control: {
        type: 'range',
        min: 1,
        max: 10,
        step: 1
      },
    },
    enableFormControlLabel: {
      name: 'Display Form Label',
      description: 'Display form label',
      control: 'boolean',
    },
    formControlLabel: {
      name: 'Form label',
      description: 'Add form label before the list',
      control: 'text',
      if: { arg: 'enableFormControlLabel', eq: true },
    },
    enableFormHelperText: {
      name: 'Display Helper Text',
      description: 'Display helper text',
      control: 'boolean',
    },
    formHelperText: {
      name: 'Helper Text',
      description: 'Add helper text after the list',
      control: 'text',
      if: { arg: 'enableFormHelperText', eq: true },
    },
    checkboxSize: {
      name: 'Checkbox Size',
      description: 'Checbox size',
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
    },
    checkboxColor: {
      name: 'Checkbox Color',
      description: 'Checbox color',
      control: { type: 'select' },
      options: ['primary', 'error', 'warning', 'info' ,'success'],
    },
    checkboxLabelPosition: {
      name: 'Checkbox Label Position',
      description: 'Position of the label relative to the checkbox',
      control: { type: 'select' },
      options: ['start', 'end', 'top', 'bottom'],
    },
    checkboxListPosition: {
      name: 'Checkbox List Position',
      description: 'Position of the checkbox list',
      control: { type: 'select' },
      options: ['vertical', 'horizontal'],
    },
    disableCheckbox: {
      name: 'Disable Checkbox',
      description: 'Disabled checkbox',
      control: 'boolean',
    },
  },

  args: {
    name: 'Label',
    count: 3,
    enableFormControlLabel: false,
    formControlLabel: 'Label',
    enableFormHelperText: false,
    formHelperText: 'Helper text',
    checkboxSize: 'small',
    checkboxColor: 'primary',
    checkboxLabelPosition: 'end',
    checkboxListPosition: 'vertical',
    disableCheckbox: false,
    onChange: fn()
  },
  
  render: (args) => {
    const checkbox = createCheckbox(args);
    return checkbox;
  },
} satisfies Meta<Checkbox>;

export default meta;
type Story = StoryObj<Checkbox>;

export const DefaultCheckbox: Story = {

};

export const MediumCheckbox: Story = {
  args: {
    checkboxSize: 'medium'
  }
};

export const LargeCheckbox: Story = {
  args: {
    checkboxSize: 'large'
  }
};

export const CheckboxHorizontalOrientation: Story = {
  args: {
    checkboxListPosition: 'horizontal'
  }
};

export const CheckboxLabelTopPosition: Story = {
  args: {
    count: 1,
    checkboxLabelPosition: 'top'
  }
};

export const CheckboxLabelBottomPosition: Story = {
  args: {
    count: 1,
    checkboxLabelPosition: 'bottom'
  }
};

export const CheckboxLabelStartPosition: Story = {
  args: {
    count: 1,
    checkboxLabelPosition: 'start'
  }
};

export const CheckboxLabelEndPosition: Story = {
  args: {
    count: 1,
    checkboxLabelPosition: 'end'
  }
};

export const CheckboxFormLabel: Story = {
  args: {
    enableFormControlLabel: true,
    formControlLabel: 'Label'
  }
};

export const CheckboxHelperText: Story = {
  args: {
    enableFormHelperText: true,
    formHelperText: 'Helper text'
  }
};

export const DisabledCheckbox: Story = {
  args: {
    enableFormControlLabel: true,
    formControlLabel: 'Label',
    enableFormHelperText: true,
    formHelperText: 'Helper text',
    disableCheckbox: true
  }
};

export const ErrorCheckbox: Story = {
  args: {
    checkboxColor: 'error',
    enableFormControlLabel: true,
    formControlLabel: 'Label',
    enableFormHelperText: true,
    formHelperText: 'Helper text',
  }
};
