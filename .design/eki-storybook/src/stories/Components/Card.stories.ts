import type { StoryObj, Meta } from "@storybook/html";
import { createCard, Card } from "./Card";

const meta: Meta<Card & { cardCount: number }> = {
  title: "Components/Card",
  tags: ["autodocs"],

  parameters: {
    controls: { sort: "none" },
    pseudo: { active: true, focus: true },
  },

  argTypes: {
    cardMediaDisplay: {
      name: "Card Media Display",
      description: "Show or hide card media",
      control: "boolean",
      table: { category: 'Card media' },
    },
    cardMedia: {
      name: "Card Media",
      control: "text",
      description: "Card Media URL",
      if: { arg: "cardMediaDisplay", eq: true },
      table: { category: 'Card media' },
    },
    cardDateDisplay: {
      name: "Display date and author",
      description: "Show or hide date and author",
      control: "boolean",
      table: { category: 'Card header' },
    },
    cardAuthor: {
      name: "Author Name",
      description: "The author of the blog post",
      control: "text",
      if: { arg: "cardDateDisplay", eq: true },
      table: { category: 'Card header' },
    },
    cardDate: {
      name: "Date and author",
      description: "The date the blog post was published",
      control: "text",
      if: { arg: "cardDateDisplay", eq: true },
      table: { category: 'Card header' },
    },
    cardTitle: {
      name: "Card Title",
      description: "Title displayed on the card",
      control: "text",
      table: { category: 'Card header' },
    },
    titleAvatar: {
      name: "Avatar",
      description: "Add avatar to title",
      control: "boolean",
      table: { category: 'Card header' },
    },
    cardText: {
      name: "Card Text",
      description: "Content text inside the card",
      control: "text",
      table: { category: 'Card body' },
    },
    cardCountDisplay: {
      name: "Multiple Cards",
      description: "Display multiple cards",
      control: "boolean",
    },
    cardCount: {
      name: "Number of Cards",
      description: "Select how many cards to display",
      if: { arg: "cardCountDisplay", eq: true },
      control: { type: "range", min: 1, max: 10, step: 1 },
    },
    displayAvatar: {
      name: "Display avatars",
      description: "Show or hide avatars",
      control: "boolean",
      table: { category: 'Card footer' },
    },
  },

  args: {
    cardMediaDisplay: false,
    cardMedia: "",
    cardDateDisplay: false,
    cardAuthor: "John Doe",
    cardDate: "Feb 28, 2025",
    cardTitle: "New feature available on Devias",
    titleAvatar: false,
    cardText: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    cardCountDisplay: false,
    cardCount: 3,
    displayAvatar: false,
  },

  render: (args) => {
    if (!args.cardCountDisplay) {
      return createCard(args);
    }

    const wrapper = document.createElement("div");
    wrapper.className = "card__wrapper";

    Array.from({ length: args.cardCount }).forEach(() => {
      const card = createCard(args);
      wrapper.appendChild(card);
    });

    return wrapper;
  },
} satisfies Meta<Card & { cardCount: number }>;

export default meta;
type Story = StoryObj<Card & { cardCount: number }>;

export const DefaultCard: Story = {
  args: {},
};

export const CardWithMedia: Story = {
  args: {
    cardMediaDisplay: true,
  },
};

export const CardWithActions: Story = {
  args: {
    cardMediaDisplay: true,
    cardDateDisplay: true,
    displayAvatar: true,
  },
};

export const CardWithAvatar: Story = {
  args: {
    titleAvatar: true,
  },
};