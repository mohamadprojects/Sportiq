export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'admin' | 'user';
  isApproved: boolean;
  usdtTxHash?: string;
  submittedAt?: string;
  approvedUntil?: string;
}

export interface MoneylineOdds {
  homeWin: number; // percentage e.g. 55
  draw: number;    // percentage e.g. 25
  awayWin: number; // percentage e.g. 20
}

export interface BTTSPrediction {
  prediction: 'Yes' | 'No';
  probability: number; // e.g. 78
}

export interface OverUnderPrediction {
  line: string; // e.g. "2.5 Goals"
  prediction: 'Over' | 'Under';
  probability: number; // e.g. 82
}

export interface PredictionResult {
  id: string;
  matchTitle: string;
  competition: string;
  matchDate?: string;
  uploadedImage?: string; // base64 thumbnail
  favorite: string;
  favoriteReason: string;
  moneyline: MoneylineOdds;
  btts: BTTSPrediction;
  overUnder: OverUnderPrediction;
  recommendedBet: string;
  confidenceScore: number; // 0 - 100
  keyTacticalAnalysis: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  createdAt: string;
  createdBy: string;
}

export interface AdminSettings {
  usdtAddress: string;
  weeklyFeeUsdt: number;
  aiModel: string;
  systemPrompt: string;
  noticeBanner: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
