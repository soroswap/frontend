import { PaletteMode, colors, createTheme } from "@mui/material";
import { opacify } from "./utils";

declare module "@mui/material/styles/createPalette" {
  interface Palette {
    customBackground: {
      surface: string;
      module: string;
      bg1: string;
      bg3: string;
      bg4: string;
      bg5: string;
      interactive: string;
      accentAction: string;
      accentActionSoft: string;
      accentSuccess: string;
      accentWarning: string;
      accentWarningSoft: string;
      accentCritical: string;
      accentFailureSoft: string;
      backdrop: string;
      floating: string;
      outline: string;
      scrim: string;
      scrolledSurface: string;
    };
    custom: {
      textTertiary: string;
      borderColor: string;
      stateOverlayHover: string;
      stateOverlayPressed: string;
      deprecated_primary2: string;
      deprecated_primary3: string;
      deprecated_primary4: string;
      deprecated_primary5: string;
      deprecated_yellow3: string;
      accentTextLightPrimary: string;
      accentTextLightSecondary: string;
      accentTextLightTertiary: string;
      accentTextDarkPrimary: string;
      accentTextDarkSecondary: string;
      accentTextDarkTertiary: string;
      shadow1: string;
    };
  }

  interface PaletteOptions {
    customBackground?: {
      surface: string;
      module: string;
      bg1: string;
      bg3: string;
      bg4: string;
      bg5: string;
      interactive: string;
      accentAction: string;
      accentActionSoft: string;
      accentSuccess: string;
      accentWarning: string;
      accentWarningSoft: string;
      accentCritical: string;
      accentFailureSoft: string;
      backdrop: string;
      floating: string;
      outline: string;
      scrim: string;
      scrolledSurface: string;
    };
    custom: {
      textTertiary: string;
      borderColor: string;
      stateOverlayHover: string;
      stateOverlayPressed: string;
      deprecated_primary2: string;
      deprecated_primary3: string;
      deprecated_primary4: string;
      deprecated_primary5: string;
      deprecated_yellow3: string;
      accentTextLightPrimary: string;
      accentTextLightSecondary: string;
      accentTextLightTertiary: string;
      accentTextDarkPrimary: string;
      accentTextDarkSecondary: string;
      accentTextDarkTertiary: string;
      shadow1: string;
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
        bg3: isDark ? "#404A67" : "#B8C0DC",
        bg4: isDark ? "#5D6785" : "#98A1C0",
        bg5: isDark ? "#7780A0" : "#7780A0",
        interactive: isDark ? "#293249" : "#E8ECFB",
        accentAction: isDark ? "#4C82FB" : "#FB118E",
        accentActionSoft: isDark
          ? opacify(24, "#4C82FB")
          : opacify(24, "#FB118E"),
        accentSuccess: "#76D191",
        accentWarning: "#EEB317",
        accentWarningSoft: opacify(24, "#EEB317"),
        accentCritical: "#FD766B",
        accentFailureSoft: opacify(12, "#FD766B"),
        backdrop: "#080B11",
        floating: opacify(12, "#000000"),
        outline: opacify(24, "#98A1C0"),
        scrim: opacify(72, "#0D111C"),
        scrolledSurface: opacify(72, "#0D111C"),
      },
      custom: {
        textTertiary: isDark ? "#5D6785" : "#98A1C0",
        borderColor: isDark ? "#4C82FB" : "#FB118E",
        stateOverlayHover: opacify(8, "#98A1C0"),
        stateOverlayPressed: opacify(24, "#B8C0DC"),
        deprecated_primary2: isDark ? "#4C82FB" : "#FF6FA3",
        deprecated_primary3: isDark ? "#869EFF" : "#FBA4C0",
        deprecated_primary4: isDark ? "#376bad70" : "#F6DDE8",
        deprecated_primary5: isDark ? "#153d6f70" : "#FDEAF1",
        deprecated_yellow3: "#5D4204",
        accentTextLightPrimary: "#F5F6FC",
        accentTextLightSecondary: opacify(72, "#F5F6FC"),
        accentTextLightTertiary: opacify(12, "#F5F6FC"),
        accentTextDarkPrimary: opacify(80, "#0D111C"),
        accentTextDarkSecondary: opacify(60, "#0D111C"),
        accentTextDarkTertiary: opacify(24, "#0D111C"),
        shadow1: isDark ? "#000" : "#2F80ED",
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
