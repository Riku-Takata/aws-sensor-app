// app/page.tsx
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import RealtimeChart from '../components/RealtimeChart'; // クライアントコンポーネントをインポート

export default function HomePage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          リアルタイム温湿度モニター
        </Typography>
        <RealtimeChart />
      </Box>
    </Container>
  );
}
