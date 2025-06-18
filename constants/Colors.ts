const primary = '#e44332';
const p1 = '#e44332';
const p2 = '#ff9800';
const p3 = '#2196f3';

export const Colors = {
  light: {
    // General
    text: '#11181C',
    textSecondary: '#687076',
    background: '#ffffff', // UPDATED: Changed to pure white
    card: '#f0f2f5',       // UPDATED: Changed to a light grey for search bars, modals, etc.
    cardSecondary: '#f9f9f9',
    border: '#dcdcdc',
    tint: primary,

    // Tab Bar
    tabIconDefault: '#687076',
    tabIconSelected: primary,

    // Priority Colors
    p1,
    p2,
    p3,
    p4: '#8e8e93',
    p1_bg: 'rgba(228, 67, 50, 0.1)',
    p2_bg: 'rgba(255, 152, 0, 0.1)',
    p3_bg: 'rgba(33, 150, 243, 0.1)',
    p4_bg: 'transparent',
  },
  dark: {
    // General
    text: '#ECEDEE',
    textSecondary: '#888888',
    background: '#181818',
    card: '#222222',
    cardSecondary: '#292929',
    border: '#333333',
    tint: primary,

    // Tab Bar
    tabIconDefault: '#9BA1A6',
    tabIconSelected: primary,

    // Priority Colors
    p1,
    p2,
    p3,
    p4: '#bbb',
    p1_bg: 'rgba(228, 67, 50, 0.15)',
    p2_bg: 'rgba(255, 152, 0, 0.15)',
    p3_bg: 'rgba(33, 150, 243, 0.15)',
    p4_bg: 'transparent',
  },
};