export const colors = {
  brand: {
    primary: "#E50059",
    pink: "#EB588C", // legacy brand used elsewhere
  },
  text: {
    light: "#F5F5F5",
    secondary: "#B0B0B0",
    inactive: "#A7A7A7",
  },
  surface: {
    bg: "#FFFFFF",
    darkBg: "#020100",
  },
  border: {
    subtle: "rgba(245, 245, 245, 0.1)",
  },
  badge: {
    blue: "#2B8CFF",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
};

export const fonts = {
  family: "LeagueSpartan",
  weight: {
    extraLight: "200" as const,
    regular: "400" as const,
    semiBold: "600" as const,
    bold: "700" as const,
  },
};

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.37,
    shadowRadius: 20.5,
    elevation: 10,
  },
};
