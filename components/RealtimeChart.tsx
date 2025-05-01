// components/RealtimeChart.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { CONNECTION_STATE_CHANGE, ConnectionState } from 'aws-amplify/api';
import { Hub } from 'aws-amplify/utils';
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface SensorRecord {
  thingId: string;
  ts: string;
  temperature?: number | null;
  humidity?: number | null;
  sentAt?: string | null;
  receivedAt?: string | null;
}

const onNewRecordSubscription = /* GraphQL */ `
  subscription OnNewRecord($thingId: String!) {
    onNewRecord(thingId: $thingId) {
      thingId
      ts
      temperature
      humidity
      sentAt
      receivedAt
    }
  }
`;

const RealtimeChart: React.FC = () => {
  const [rawData, setRawData] = useState<SensorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState | null>(null);
  const MAX_DATA_POINTS = 30;
  const THING_ID = "M5StackCore2";

  // Y軸の範囲を計算する関数
  const calculateYAxisDomain = (
    data: { temperature?: number | null; humidity?: number | null }[],
    key: 'temperature' | 'humidity'
  ): [number, number] => {
    const values = data
      .map(d => d[key])
      .filter((v): v is number => v !== null && v !== undefined && !isNaN(v));

    if (values.length === 0) {
      return key === 'temperature' ? [15, 30] : [0, 100];
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    if (key === 'temperature') {
      // 温度は±1℃の余裕を持たせる
      return [
        Math.max(0, Math.floor(min - 1)),
        Math.ceil(max + 1)
      ];
    } else {
      // 湿度は±1%の余裕を持たせる
      return [
        Math.max(0, Math.floor(min - 1)),
        Math.min(100, Math.ceil(max + 1))
      ];
    }
  };

  useEffect(() => {
    const client = generateClient();

    // Hub で接続状態を監視
    const hubListener = Hub.listen('api', ({ payload }: { 
      payload: { 
        event: string; 
        data: { connectionState: ConnectionState } 
      } 
    }) => {
      if (payload.event === CONNECTION_STATE_CHANGE) {
        const newState = payload.data.connectionState;
        setConnectionState(newState);
        switch (newState) {
          case ConnectionState.Connecting:
            setError('接続中…');
            break;
          case ConnectionState.ConnectionDisrupted:
            setError('接続が切断されました。再接続中…');
            break;
          case ConnectionState.ConnectionDisruptedPendingNetwork:
            setError('ネットワーク未接続。再接続中…');
            break;
          case ConnectionState.Disconnected:
            setError('切断されました。リロードしてください。');
            break;
          case ConnectionState.Connected:
            setError(null);
            break;
        }
      }
    });

    // サブスクリプション設定
    let subscription: { unsubscribe: () => void } | null = null;
    (async () => {
      try {
        const observable = await client.graphql({
          query: onNewRecordSubscription,
          variables: { thingId: THING_ID },
        });

        if ('subscribe' in observable) {
          subscription = observable.subscribe({
            next: ({ data }) => {
              const record: SensorRecord = data.onNewRecord;
              if (record?.ts) {
                setRawData(prev => {
                  const next = [...prev, record];
                  return next.length > MAX_DATA_POINTS
                    ? next.slice(next.length - MAX_DATA_POINTS)
                    : next;
                });
              }
            },
            error: (err: Error) => {
              console.error(err);
              setError(`サブスクリプションエラー: ${err.message}`);
            },
          });
        } else {
          setError('サブスクリプション設定に失敗しました');
        }
      } catch (err) {
        console.error(err);
        setError(`サブスクリプション設定エラー: ${err instanceof Error ? err.message : '不明なエラー'}`);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      subscription?.unsubscribe();
      hubListener();
    };
  }, []);

  // グラフ用に ts を数値（ms）に変換
  const chartData = rawData.map(r => ({
    ts: new Date(r.ts).getTime(),
    temperature: r.temperature ?? null,
    humidity: r.humidity ?? null,
  }));

  // Y軸の範囲を計算
  const temperatureDomain = calculateYAxisDomain(chartData, 'temperature');
  const humidityDomain = calculateYAxisDomain(chartData, 'humidity');

  // X軸・ツールチップ用フォーマット
  const formatTime = (ms: number) => {
    return new Date(ms).toLocaleString('ja-JP', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 1, sm: 2 },  // スマホでは余白を小さく
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden'
      }}
    >
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{
          fontSize: { xs: '1.1rem', sm: '1.25rem' },
          textAlign: { xs: 'center', sm: 'left' }
        }}
      >
        リアルタイム温湿度グラフ
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="error">{error}</Typography>
          {connectionState && (
            <Typography variant="caption" color="text.secondary">
              接続状態: {connectionState}
            </Typography>
          )}
        </Box>
      ) : (
        <>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              mb: 1,
              textAlign: { xs: 'center', sm: 'left' },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            接続状態: {connectionState || '不明'}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: { xs: 2, sm: 4 }
          }}>
            <Box>
              <Typography 
                variant="subtitle1" 
                gutterBottom
                sx={{
                  textAlign: { xs: 'center', sm: 'left' },
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }}
              >
                温度 (°C)
              </Typography>
              <ResponsiveContainer 
                width="100%" 
                height={300}
                minWidth={300}
              >
                <LineChart 
                  data={chartData} 
                  margin={{ 
                    top: 10, 
                    right: 30, 
                    left: 20, 
                    bottom: 5 
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="ts"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={formatTime}
                    scale="time"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={temperatureDomain}
                    label={{ 
                      value: '温度 (°C)', 
                      angle: -90, 
                      position: 'insideLeft',
                      offset: -5,
                      style: { 
                        textAnchor: 'middle',
                        fontSize: 12
                      }
                    }}
                    stroke="#ff7300"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    labelFormatter={formatTime}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)} °C`, '温度']}
                  />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#ff7300"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#ff7300" }}
                    activeDot={{ r: 6, fill: "#ff7300" }}
                    isAnimationActive={false}
                    name="温度"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>

            <Box>
              <Typography 
                variant="subtitle1" 
                gutterBottom
                sx={{
                  textAlign: { xs: 'center', sm: 'left' },
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }}
              >
                湿度 (%)
              </Typography>
              <ResponsiveContainer 
                width="100%" 
                height={300}
                minWidth={300}
              >
                <LineChart 
                  data={chartData} 
                  margin={{ 
                    top: 10, 
                    right: 30, 
                    left: 20, 
                    bottom: 5 
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="ts"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={formatTime}
                    scale="time"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={humidityDomain}
                    label={{ 
                      value: '湿度 (%)', 
                      angle: -90, 
                      position: 'insideLeft',
                      offset: -5,
                      style: { 
                        textAnchor: 'middle',
                        fontSize: 12
                      }
                    }}
                    stroke="#2196f3"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    labelFormatter={formatTime}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)} %`, '湿度']}
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#2196f3"
                    strokeWidth={2}
                    dot={{ r: 4, stroke: "#2196f3", fill: "white" }}
                    activeDot={{ r: 6, stroke: "#2196f3", fill: "white" }}
                    isAnimationActive={false}
                    name="湿度"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default RealtimeChart;
