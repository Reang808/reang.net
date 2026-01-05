// 環境変数から本番APIのURLを取得、なければ開発環境のURLを使用
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export const API_BASE_URL = API_URL;

