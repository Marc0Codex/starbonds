import path from "node:path"

import { Config } from "@remotion/cli/config"

Config.setVideoImageFormat("jpeg")
Config.setJpegQuality(95)
Config.setOverwriteOutput(true)
// Standard limited-range 4:2:0 so every browser (incl. iOS Safari) decodes it.
Config.setPixelFormat("yuv420p")
Config.setColorSpace("bt709")
// Keep memory use moderate on this machine.
Config.setConcurrency(2)

// Shared art (../components/plei/plei-art.tsx) must use this package's React,
// not the app's copy in the repo root.
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...(config.resolve?.alias ?? {}),
      react: path.resolve(process.cwd(), "node_modules/react"),
      "react/jsx-runtime": path.resolve(process.cwd(), "node_modules/react/jsx-runtime"),
    },
  },
}))
