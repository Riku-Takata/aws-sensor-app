// lib/graphql/subscriptions.ts

// AppSync スキーマで定義した Subscription クエリ (実際のクエリ名はスキーマに合わせる)
// 例: publishNewRecord Mutation がトリガーとなる Subscription
export const onNewRecordSubscription = /* GraphQL */ `
  subscription OnNewRecord {
    onNewRecord {
      thingId
      ts
      temperature
      humidity
      # 他に必要なフィールド
    }
  }
`;

// --- 必要であれば Query や Mutation もここに定義 ---
// export const listSensorRecords = /* GraphQL */ ` ... `;