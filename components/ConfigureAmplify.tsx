// components/ConfigureAmplify.tsx
"use client"; // Amplify設定はクライアントサイドで行う

import { Amplify } from "aws-amplify";
import awsExports from "../lib/aws-exports";

Amplify.configure(awsExports);

export default function ConfigureAmplify() {
  // このコンポーネントは設定を実行するだけで何もレンダリングしない
  return null;
}