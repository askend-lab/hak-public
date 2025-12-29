import type { Preview } from "@storybook/html";

import '../src/styles/fonts.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    html: {
      prettier: {
        tabWidth: 4,
        useTabs: true,
      },
    },
  },

  tags: ["autodocs", "autodocs"]
};

export default preview;
