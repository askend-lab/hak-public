import type { StoryObj, Meta } from "@storybook/html";
import { createAvatar, Avatar } from "./Avatar";

const meta: Meta<Avatar> = {
  title: "Components/Avatar",
  tags: ["autodocs"],

  parameters: {
    controls: { sort: "none" },
    pseudo: { active: true, focus: true },
  },

  argTypes: {
    initials: {
      name: "Initials",
      description: "Two-letter initials to display in the avatar",
      control: "text",
      table: { category: 'Avatar' },
    },
    title: {
      name: "Title",
      description: "Title displayed below the initials",
      control: "text",
      table: { category: 'Avatar' },
    },
    avatarCountDisplay: {
      name: "Multiple Avatars",
      description: "Display multiple avatars in a row",
      control: "boolean",
    },
    avatarCount: {
      name: "Number of Avatars",
      description: "Select how many avatars to display",
      if: { arg: "avatarCountDisplay", eq: true },
      control: { type: "range", min: 1, max: 10, step: 1 },
    },
  },

  args: {
    initials: "OP",
    title: "Security",
    avatarCountDisplay: false,
    avatarCount: 1,
  },

  render: (args) => {
    return createAvatar(args);
  },
} satisfies Meta<Avatar>;

export default meta;
type Story = StoryObj<Avatar>;

export const DefaultAvatar: Story = {
  args: {
    avatarCountDisplay: false,
    avatarCount: 1,
  },
};
