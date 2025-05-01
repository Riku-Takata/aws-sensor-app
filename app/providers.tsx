// app/providers.tsx (Material UI等の設定もまとめる)
"use client";

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../lib/theme'; // 前回作成したテーマファイル
import ConfigureAmplify from '../components/ConfigureAmplify';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ConfigureAmplify /> {/* Amplify設定を実行 */}
      {children}
    </ThemeProvider>
  );
}