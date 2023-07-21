import { PaletteMode, colors, createTheme } from "@mui/material";

declare module "@mui/material/styles/createPalette" {
  interface Palette {
    customBackground: {
      surface: string;
      module: string;
      bg1: string;
      interactive: string;
    };
    custom: {
      textTertiary: string;
      borderColor: string;
    };
  }

  interface PaletteOptions {
    customBackground?: {
      surface: string;
      module: string;
      bg1: string;
      interactive: string;
    };
    custom: {
      textTertiary: string;
      borderColor: string;
    };
  }
}

export const theme = (mode: PaletteMode) => {
  console.log("🚀 « mode:", mode);
  const isDark = mode === "dark";
  console.log("🚀 « isDark:", isDark);

  const newTheme = createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#FFFFFF" : "#0D111C",
      },
      secondary: {
        main: isDark ? "#98A1C0" : "#98A1C0",
        light: "#B8C0DC",
      },
      background: {
        default: isDark ? "#0D111C" : "#f3f4f3",
        paper: isDark ? "#323232" : "#f3f4f3",
      },
      error: {
        main: "#FD766B",
      },
      customBackground: {
        surface: isDark ? "#0D111C" : "#FFFFFF",
        module: isDark ? "#131A2A" : "#F5F6FC",
        bg1: isDark ? "#131A2A" : "#F5F6FC",
        interactive: isDark ? "#293249" : "#E8ECFB",
      },
      custom: {
        textTertiary: "#5D6785",
        borderColor: "#4C82FB",
      },
    },
    typography: {
      fontFamily: "Inter",
      subtitle1: {
        color: isDark ? "#FFFFFF" : "#0D111C",
      },
    },
  });

  return newTheme;
};
