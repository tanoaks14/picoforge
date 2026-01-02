export const colors = {
    background: '#0c1021',
    surface: '#111732',
    surfaceStrong: '#151c3d',
    border: '#1f2a54',
    primary: '#7de2ff',
    primaryStrong: '#5cb8ff',
    accent: '#aee67f',
    text: '#e8edff',
    muted: '#9fb0d3',
    danger: '#ff7b7b',
    warning: '#ffd479',
    success: '#9cf7c8',
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
};

export const radii = {
    sm: 8,
    md: 12,
    lg: 18,
    pill: 999,
};

export const shadows = {
    sm: '0 2px 10px rgba(0, 0, 0, 0.18)',
    md: '0 6px 24px rgba(0, 0, 0, 0.28)',
    lg: '0 10px 45px rgba(0, 0, 0, 0.35)',
};

export const typography = {
    fontFamily: "'Space Grotesk', 'Segoe UI', system-ui, -apple-system, sans-serif",
    sizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 22,
        xxl: 28,
    },
    weights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
};

export const theme = {
    colors,
    spacing,
    radii,
    shadows,
    typography,
};

export type Theme = typeof theme;
