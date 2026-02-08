// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

/// <reference types="vite/client" />

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}
