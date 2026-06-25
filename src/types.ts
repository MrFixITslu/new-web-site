export interface SaaSApp {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  category: 'web' | 'desktop' | 'games' | 'courses';
  pricingType: 'free' | 'free_trial' | 'premium';
  logoUrl: string;
  accessUrl: string;
  launchCount: number;
  createdAt?: string;
  
  // Custom courses telemetry fields
  price?: number;
  rating?: number;
  instructor?: string;
  duration?: string;
  lessonsCount?: number;
  curriculum?: string;
}

export type CategoryFilter = 'all' | 'web' | 'desktop' | 'games' | 'courses';

export interface AppStatistics {
  totalLaunches: number;
  totalApps: number;
  webAppsCount: number;
  desktopAppsCount: number;
  gamesAppsCount: number;
  coursesAppsCount: number;
}

export interface SaaSAd {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  createdAt?: string;
}

