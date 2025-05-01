// lib/theme.ts
"use client"; // createTheme はクライアントサイドでの使用が推奨される場合がある

import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    // mode: 'light', // ライトモード or ダークモード
  },
  typography: {
    // フォント設定など
  },
});

export default theme;