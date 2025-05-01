<img width="1907" alt="スクリーンショット 2025-05-01 131120" src="https://github.com/user-attachments/assets/407236a8-9eb6-4307-a61c-17fdf5791905" />

# [リアルタイム温湿度モニタリングアプリケーション](https://d1d1jrdxvypyze.cloudfront.net/)

## 概要
このアプリケーションは、IoTデバイス（M5Stack Core2）からAWS IoT Core経由で送信される温度・湿度データをリアルタイムで表示するWebアプリケーションです。AWS AppSyncを使用してGraphQLサブスクリプションを実装し、センサーデータをリアルタイムで受信・表示します。

## 技術スタック

### フロントエンド
- Next.js 15.3.1
- React
- TypeScript
- Material-UI (MUI)

### AWS サービス
- AWS Amplify
- AWS AppSync (GraphQL API)
- AWS IoT Core

### 開発環境
- Node.js

## 主な機能
- IoTデバイスからの温湿度データのリアルタイム受信
- 温度・湿度データの表形式での表示
- 接続状態のリアルタイムモニタリング
- 最新30件のデータ履歴保持

## プロジェクト構造
```
my-sensor-app/
├── components/          # Reactコンポーネント
│   ├── ConfigureAmplify.tsx  # Amplify設定
│   └── RealtimeChart.tsx     # データ表示コンポーネント
├── app/                 # Next.jsページ
├── public/             # 静的ファイル
└── package.json        # 依存関係の定義
```

## GraphQLスキーマ
アプリケーションで使用されているGraphQLスキーマの主要な型定義：

```graphql
type SensorRecord {
  thingId: String!
  ts: AWSDateTime!
  temperature: Float
  humidity: Float
  sentAt: AWSDateTime
  receivedAt: AWSDateTime
}

type Subscription {
  onNewRecord(thingId: String!): SensorRecord
}
```

## 注意事項
- AWS Amplifyの設定が必要です
- IoTデバイス（M5Stack Core2）のセットアップと設定が別途必要です
- AWS IoT CoreとAppSyncの適切な設定が必要です

## ライセンス
MIT

## 作者
Riku-Takata
