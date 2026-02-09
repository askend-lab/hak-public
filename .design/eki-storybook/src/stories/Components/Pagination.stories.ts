import type { Meta, StoryObj } from '@storybook/html';
import { createPagination, Pagination } from './Pagination';
import { fn } from '@storybook/test';

const meta: Meta<Pagination> = {
  title: 'Components/Pagination',
  tags: ['autodocs'],
  parameters: {
    controls: { sort: 'none' },
  },
  argTypes: {
    count: { 
      name: 'Pages count',
      description: 'Number of pages to display',
      control: {
        type: 'range',
        min: 1,
        max: 10,
        step: 1
      },
    },
    shape: {
      name: 'Pagination shape',
      description: 'Pagination active and hover element shape',
      control: { type: 'radio' },
      options: ['circular', 'rounded'],
    },
    showArrows: {
      name: 'Show arrows',
      description: 'Display navigation arrows',
      control: 'boolean',
    },
    showAll: {
      name: 'Show all pages',
      description: 'Display all page numbers',
      control: 'boolean',
    },
  },
  args: {
    count: 3,
    shape: 'circular',
    showArrows: false,
    showAll: true,
  },
  render: (args) => {
    const container = createPagination({
      ...args,
      onClick: fn(() => console.log('Page clicked')),
    });
    document.body.appendChild(container);
    document.body.removeChild(container);
    return container;
  },
} satisfies Meta<Pagination>;

export default meta;
type Story = StoryObj<Pagination>;

export const CircularPagination: Story = {
  args: {
    count: 3,
    showArrows: true,
    showAll: true,
  },
};

export const RoundedPagination: Story = {
  args: {
    count: 3,
    shape: 'rounded',
    showArrows: true,
    showAll: true,
  },
};
