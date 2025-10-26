import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: "MVPPIR",
    slug: "mvppir-mobile",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#09090B",
    },
    ios: {
      bundleIdentifier: "com.mvppir.mobile",
      supportsTablet: true,
    },
    android: {
      package: "com.mvppir.mobile",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#09090B",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
    },
    experiments: {
      reactCompiler: false,
      tsconfigPaths: true,
    },
  };
};
