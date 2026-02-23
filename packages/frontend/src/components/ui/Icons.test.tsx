// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Icon } from "./Icon";
import {
  PlayIcon,
  PauseIcon,
  CloseIcon,
  EditIcon,
  TrashIcon,
  StopIcon,
  MusicNoteIcon,
  CheckCircleIcon,
  MenuIcon,
  TaskIcon,
  VolumeIcon,
  MuteIcon,
  SpeedIcon,
  PlusCircleIcon,
  DocumentPlusIcon,
} from "./Icons";

describe("Icon component", () => {
  it("renders with name prop", () => {
    const { container } = render(<Icon name="play_arrow" />);
    expect(container.querySelector(".icon")).toBeTruthy();
    expect(container.querySelector(".icon")?.textContent).toBe("play_arrow");
  });

  it("renders with custom size", () => {
    const { container } = render(<Icon name="close" size="xl" />);
    expect(
      container.querySelector(".icon")?.classList.contains("icon--xl"),
    ).toBe(true);
  });

  it("renders with custom weight", () => {
    const { container } = render(<Icon name="edit" weight="bold" />);
    expect(
      container.querySelector(".icon")?.classList.contains("icon--bold"),
    ).toBe(true);
  });

  it("renders with filled modifier", () => {
    const { container } = render(<Icon name="check" filled />);
    expect(
      container.querySelector(".icon")?.classList.contains("icon--filled"),
    ).toBe(true);
  });

  it("renders with custom className", () => {
    const { container } = render(
      <Icon name="search" className="custom-class" />,
    );
    expect(
      container.querySelector(".icon")?.classList.contains("custom-class"),
    ).toBe(true);
  });

  it("has aria-hidden attribute", () => {
    const { container } = render(<Icon name="help" />);
    expect(container.querySelector(".icon")?.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });
});

describe("Named icon components", () => {
  const iconMap: [string, React.FC<Record<string, unknown>>, string][] = [
    ["PlayIcon", PlayIcon, "play_arrow"],
    ["PauseIcon", PauseIcon, "pause"],
    ["CloseIcon", CloseIcon, "close"],
    ["StopIcon", StopIcon, "stop"],
    ["MusicNoteIcon", MusicNoteIcon, "music_note"],
    ["CheckCircleIcon", CheckCircleIcon, "check_circle"],
    ["MenuIcon", MenuIcon, "menu"],
    ["TaskIcon", TaskIcon, "assignment"],
    ["VolumeIcon", VolumeIcon, "volume_up"],
    ["MuteIcon", MuteIcon, "volume_off"],
    ["SpeedIcon", SpeedIcon, "speed"],
    ["PlusCircleIcon", PlusCircleIcon, "add_circle"],
    ["DocumentPlusIcon", DocumentPlusIcon, "note_add"],
  ];

  it.each(iconMap)("%s renders correct Material Symbol name", (_name, Component, expectedText) => {
    const { container } = render(<Component />);
    const span = container.querySelector(".icon");
    expect(span).toBeTruthy();
    expect(span?.textContent).toBe(expectedText);
    expect(span?.getAttribute("aria-hidden")).toBe("true");
  });

  it("EditIcon passes size prop through", () => {
    const { container } = render(<EditIcon size="2xl" />);
    expect(container.querySelector(".icon")?.classList.contains("icon--2xl")).toBe(true);
  });

  it("TrashIcon passes weight prop through", () => {
    const { container } = render(<TrashIcon weight="medium" />);
    expect(container.querySelector(".icon")?.classList.contains("icon--medium")).toBe(true);
  });
});
