import type { StoryObj, Meta } from '@storybook/html';
import { createTextarea, Textarea } from './Textarea';

const meta: Meta<Textarea> = {
  title: 'Forms/Textarea',
  tags: ['autodocs'],

  argTypes: {
    textareaLabel: { 
      name: 'Input label',
      description: 'Label before input field',
      control: 'text',
    },
  },

  args: {
    textareaLabel: 'Label',
  },
  
  render: (args) => {
    const textarea = createTextarea(args);
    return textarea;
  },

} satisfies Meta<Textarea>;

export default meta;
type Story = StoryObj<Textarea>;

export const DefaultTextarea: Story = {
  args: {
    textareaLabel: 'Label',
  }
};