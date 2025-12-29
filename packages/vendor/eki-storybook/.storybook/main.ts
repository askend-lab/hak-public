import type { StorybookConfig } from "@storybook/html-vite";

const config: StorybookConfig = {
  framework: {
    name: "@storybook/html-vite",
    options: {},
  },
  stories: [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-controls",
    "storybook-addon-pseudo-states",
    "@storybook/preset-scss",
    "@whitespace/storybook-addon-html",
    "@chromatic-com/storybook"
  ],
  docs: {
    autodocs: 'tag',
  },
};

export default config;
