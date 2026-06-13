export interface SaaSApp {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  category: 'web' | 'desktop' | 'games';
  pricingType: 'free' | 'free_trial' | 'premium';
  logoUrl: string;
  accessUrl: string;
  launchCount: number;
  createdAt?: string;
}

export type CategoryFilter = 'all' | 'web' | 'desktop' | 'games';

export interface AppStatistics {
  totalLaunches: number;
  totalApps: number;
  webAppsCount: number;
  desktopAppsCount: number;
  gamesAppsCount: number;
}

export interface SaaSAd {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  createdAt?: string;
}

