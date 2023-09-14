import { PaletteMode, colors, createTheme } from "@mui/material";
import { opacify } from "./utils";
import { rgba } from "polished";

declare module "@mui/material/styles/createPalette" {
  interface Palette {
    customBackground: {
      surface: string;
      outputBackground: string;
      module: string;
      bg1: string;
      bg2: string;
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
      textQuaternary: string;
      textLinks: string;
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
      accentFailure: string;
      shadow1: string;
    };
  }

  interface PaletteOptions {
    customBackground?: {
      surface: string;
      module: string;
      outputBackground: string;
      bg1: string;
      bg2: string;
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
      textQuaternary: string;
      textLinks: string;
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
      accentFailure: string;
      shadow1: string;
    };
  }
}

export const theme = (mode: PaletteMode) => {
  // console.log("🚀 « mode:", mode);
  const isDark = mode === "dark";
  // console.log("🚀 « isDark:", isDark);

  const newTheme = createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#D9D9D9" : "#181A25",
      },
      secondary: {
        main: isDark ? "#98A1C0" : "#98A1C0",
        light: "#B8C0DC",
      },
      background: {
        default: isDark ? "#0F1016" : "#FFFFFF",
        paper: isDark ? "#181A25" : rgba(136, 102, 221, 0.1),
      },
      error: {
        main: "#FD766B",
      },
      customBackground: {
        surface: isDark ? "#0F1016" : "#F8F8F8",
        module: isDark ? "#13141E" : "#F8F8F8",
        outputBackground: isDark ? "#181A25" : "#F8F8F8",
        bg1: isDark ? "#181A25" : "#FFFFFF",
        bg2: isDark ? "#13141E" : "#FFFFFF",
        bg3: isDark ? "#404A67" : "#B8C0DC",
        bg4: isDark ? "#5D6785" : "#98A1C0",
        bg5: isDark ? "#7780A0" : "#7780A0",
        interactive: isDark ? "#293249" : "#E8ECFB",
        accentAction: isDark ? "#8866DD" : "#8866DD",
        accentActionSoft: isDark
          ? opacify(24, "#8866DD")
          : opacify(24, "#8866DD"),
        accentSuccess: "#B4EFAF",
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
        textTertiary: isDark ? "#E0E0E0" : "#4E4E4E",
        textQuaternary: isDark ? "#B4EFAF" : "#F66B3C",
        textLinks: isDark ? "#8866DD" : "#F66B3C",
        borderColor: isDark ? "#8866DD" : "#8866DD",
        stateOverlayHover: opacify(8, "#98A1C0"),
        stateOverlayPressed: opacify(24, "#B8C0DC"),
        deprecated_primary2: isDark ? "#4C82FB" : "#FF6FA3",
        deprecated_primary3: isDark ? "#869EFF" : "#FBA4C0",
        deprecated_primary4: isDark ? "#376bad70" : "#F6DDE8",
        deprecated_primary5: isDark ? "#153d6f70" : "#FDEAF1",
        deprecated_yellow3: "#5D4204",
        accentTextLightPrimary: isDark ? "#F5F6FC" : "#F5F6FC",
        accentTextLightSecondary: isDark ? "#4E4E4E" : "#A3A3A3",
        accentTextLightTertiary: opacify(12, "#F5F6FC"),
        accentTextDarkPrimary: opacify(80, "#0D111C"),
        accentTextDarkSecondary: opacify(60, "#0D111C"),
        accentTextDarkTertiary: opacify(24, "#0D111C"),
        accentFailure: "#D15858",
        shadow1: isDark ? "#000" : "#2F80ED",
      },
    },
    typography: {
      fontFamily: ["Inter", "Darker Grotesque"].join(","),
      subtitle1: {
        color: isDark ? "#FFFFFF" : "#0D111C",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "@global": {
            body: {
              backgroundImage:
                "url(https://designshack.net/wp-content/uploads/gradient-background.jpg)",
            },
          },
        },
      },
    },
  });

  return newTheme;
};
