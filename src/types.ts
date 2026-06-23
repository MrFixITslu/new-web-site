export interface SaaSApp {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  category: 'web' | 'desktop' | 'games' | 'training';
  pricingType: 'free' | 'free_trial' | 'premium';
  logoUrl: string;
  accessUrl: string;
  launchCount: number;
  createdAt?: string;
}

export type CategoryFilter = 'all' | 'web' | 'desktop' | 'games' | 'training';

export interface AppStatistics {
  totalLaunches: number;
  totalApps: number;
  webAppsCount: number;
  desktopAppsCount: number;
  gamesAppsCount: number;
  trainingAppsCount: number;
}

export interface SaaSAd {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  createdAt?: string;
}

