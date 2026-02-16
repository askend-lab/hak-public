// SPDX-License-Identifier: MIT
// Copyright (c) 2024-2026 Askend Lab

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { execSync } from "child_process";

function getGitInfo(): {
  commitHash: string;
  commitMessage: string;
  branch: string;
  commitDate: string;
} {
  try {
    const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
    const commitMessage = execSync("git log -1 --format=%s").toString().trim();
    const branch = execSync("git rev-parse --abbrev-ref HEAD")
      .toString()
      .trim();
    const commitDate = execSync("git log -1 --format=%ci").toString().trim();
    return { commitHash, commitMessage, branch, commitDate };
  } catch {
    return {
      commitHash: "unknown",
      commitMessage: "",
      branch: "unknown",
      commitDate: "",
    };
  }
}

const gitInfo = getGitInfo();

// Warn if any proxy target looks like a production URL
function checkProxyTargets(proxy: Record<string, { target?: string }>): void {
  for (const [route, config] of Object.entries(proxy)) {
    const target = typeof config === "string" ? config : config?.target;
    if (target && /[-.]prod[.-]/.test(target)) {
      console.warn(
        `\x1b[33m⚠ WARNING: Proxy "${route}" targets PRODUCTION: ${target}\x1b[0m`,
      );
    }
  }
}

export default defineConfig({
  define: {
    __BUILD_INFO__: JSON.stringify({
      commitHash: gitInfo.commitHash,
      branch: gitInfo.branch,
      commitDate: gitInfo.commitDate,
      buildTime: new Date().toISOString(),
    }),
  },
  plugins: [
    react(),
    {
      name: "proxy-prod-warning",
      configResolved(config): void {
        if (config.command === "serve" && config.server?.proxy) {
          checkProxyTargets(config.server.proxy as Record<string, { target?: string }>);
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        if (warning.message.includes("sourcemap for reporting an error")) return;
        defaultHandler(warning);
      },
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query"],
          vendor: ["zod", "zustand", "jszip", "@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
          sentry: ["@sentry/react"],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "${path.resolve(__dirname, "src/styles/vendor/eki-storybook/abstracts/variables")}" as *;
          $color-light-blue: #e3effb;
          $border-radius-round: 50px;
        `,
        loadPaths: [path.resolve(__dirname, "..")],
        silenceDeprecations: ["import"],
      },
    },
  },
  resolve: {
    alias: {
      "@hak/specifications": path.resolve(
        __dirname,
        "../specifications/index.ts",
      ),
      "@hak/shared": path.resolve(__dirname, "../shared/src/index.ts"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5181,
    strictPort: true,
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL ?? "https://hak-dev.askend-lab.com",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.removeHeader("cookie");
            proxyReq.removeHeader("Cookie");
          });
        },
      },
      "/auth/tara": {
        target: process.env.VITE_AUTH_PROXY_TARGET ?? "https://hak-api-dev.askend-lab.com",
        changeOrigin: true,
      },
    },
  },
});
