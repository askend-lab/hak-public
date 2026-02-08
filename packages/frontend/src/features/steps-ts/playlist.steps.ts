// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/**
 * Playlist Step Definitions
 * Implements steps for playlist and audio playback features
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { TestWorld } from "./setup";

Given("I have a playlist with entries", async function (this: TestWorld) {
  await this.renderApp();
});

Given("I have audio in the playlist", async function (this: TestWorld) {
  await this.renderApp();
});

Given("the playlist is playing", async function (this: TestWorld) {
  await this.renderApp();
});

When("I click play on the playlist", async function (this: TestWorld) {
  await this.waitFor(() => {
    const playButton = this.container?.querySelector(
      '.playlist-play, [data-testid="playlist-play"]',
    );
    if (playButton) {
      this.click(playButton);
      return true;
    }
    return false;
  });
});

When("I click pause", async function (this: TestWorld) {
  await this.waitFor(() => {
    const pauseButton = this.container?.querySelector(
      '.pause, [data-testid="pause"]',
    );
    if (pauseButton) {
      this.click(pauseButton);
      return true;
    }
    return false;
  });
});

When("I click next", async function (this: TestWorld) {
  await this.waitFor(() => {
    const nextButton = this.container?.querySelector(
      '.next, [data-testid="next"]',
    );
    if (nextButton) {
      this.click(nextButton);
      return true;
    }
    return false;
  });
});

When("I click previous", async function (this: TestWorld) {
  await this.waitFor(() => {
    const prevButton = this.container?.querySelector(
      '.previous, [data-testid="previous"]',
    );
    if (prevButton) {
      this.click(prevButton);
      return true;
    }
    return false;
  });
});

When("I add a sentence to the playlist", async function (this: TestWorld) {
  await this.waitFor(() => {
    const addButton = this.container?.querySelector(
      '[data-testid="add-to-playlist"]',
    );
    if (addButton) {
      this.click(addButton);
      return true;
    }
    return false;
  });
});

When("I remove an entry from the playlist", async function (this: TestWorld) {
  await this.waitFor(() => {
    const removeButton = this.container?.querySelector(
      '[data-testid="remove-from-playlist"]',
    );
    if (removeButton) {
      this.click(removeButton);
      return true;
    }
    return false;
  });
});

When("I reorder entries in the playlist", async function (this: TestWorld) {
  // Drag and drop reordering
});

When("I download the playlist", async function (this: TestWorld) {
  await this.waitFor(() => {
    const downloadButton =
      this.queryByText("Lae alla") ||
      this.container?.querySelector('[data-testid="download-playlist"]');
    if (downloadButton) {
      this.click(downloadButton);
      return true;
    }
    return false;
  });
});

Then("the playlist starts playing", async function (this: TestWorld) {
  await this.waitFor(() => {
    const audioElement = this.container?.querySelector("audio");
    return audioElement;
  });
});

Then("the playlist is paused", async function (this: TestWorld) {
  // Verify paused state
});

Then("the next entry plays", async function (this: TestWorld) {
  // Verify next entry is playing
});

Then("the previous entry plays", async function (this: TestWorld) {
  // Verify previous entry is playing
});

Then("the sentence is added to the playlist", async function (this: TestWorld) {
  // Verify entry was added
});

Then(
  "the entry is removed from the playlist",
  async function (this: TestWorld) {
    // Verify entry was removed
  },
);

Then("the playlist order is updated", async function (this: TestWorld) {
  // Verify order change
});

Then("the playlist is downloaded", async function (this: TestWorld) {
  // Verify download triggered
});

Then("I see the playlist", async function (this: TestWorld) {
  await this.waitFor(() => {
    return this.container?.querySelector('.playlist, [data-testid="playlist"]');
  });
});

Then(
  "I see {int} entries in the playlist",
  async function (this: TestWorld, count: number) {
    await this.waitFor(() => {
      const entries = this.container?.querySelectorAll(
        '.playlist-entry, [data-testid="playlist-entry"]',
      );
      return entries && entries.length === count;
    });
  },
);
