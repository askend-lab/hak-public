import type { StoryObj, Meta } from '@storybook/html';
import { createModal, Modal } from './Modal';

const meta: Meta<Modal> = {
  title: 'Components/Modal',
  tags: ['autodocs'],
  parameters: {
    controls: { sort: 'none' },
    pseudo: {
      active: true,
      focus: true,
    },
  },
  argTypes: {
    title: { 
      name: 'Modal title',
      control: 'text', 
      description: 'Title of the modal' 
    },
    showDescription: { 
      name: 'Show description',
      control: 'boolean', 
      description: 'Toggle to show or hide the description' 
    },
    description: { 
      name: 'Modal description',
      control: 'text', 
      description: 'Description text of the modal',
      if: { arg: 'showDescription', eq: true },
    },
    size: {
      name: 'Modal size',
      description: 'Size of the modal',
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    variant: {
      name: 'Modal variant',
      description: 'Style variant of the modal',
      control: { type: 'select' },
      options: ['soft', 'outlined'],
    },
    color: {
      name: 'Modal color',
      description: 'Color theme of the modal',
      control: { type: 'select' },
      options: ['primary', 'neutral', 'danger', 'success', 'warning'],
    },
  },

  args: {
    title: 'Modal title',
    showDescription: true,
    description: 'Description',
    size: 'small',
    variant: 'soft',
    color: 'primary',
  },

  render: (args) => {
    const modal = createModal(args);
    document.body.appendChild(modal);
    document.body.removeChild(modal);

    return modal;
  },
} satisfies Meta<Modal>;

export default meta;
type Story = StoryObj<Modal>;

export const DefaultModal: Story = {

};

export const ModalWithoutDescription: Story = {
  args: {
    showDescription: false,
  },
};

export const ModalMedium: Story = {
  args: {
    size: 'medium',
  },
};

export const ModalLarge: Story = {
  args: {
    size: 'large',
  },
};

export const ModalOutlined: Story = {
  args: {
    variant: 'outlined',
  },
};

export const ModalNeutral: Story = {
  args: {
    color: 'neutral',
  },
};

export const ModalWarning: Story = {
  args: {
    color: 'warning',
  },
};

export const ModalDanger: Story = {
  args: {
    color: 'danger',
  },
};

export const ModalSuccess: Story = {
  args: {
    color: 'success',
  },
};

