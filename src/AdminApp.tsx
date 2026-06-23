import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Trash2, 
  Lock, 
  ArrowRight,
  TrendingUp,
  Package,
  AlertTriangle,
  Monitor,
  Globe,
  Sun,
  Moon,
  Image as ImageIcon,
  Megaphone
} from "lucide-react";
import { SaaSApp, AppStatistics, SaaSAd } from "./types";
import { AppLogo, PRESET_ICONS } from "./components/AppLogo";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

const safeSessionStorage = {
  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.warn("sessionStorage.getItem blocked:", e);
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.warn("sessionStorage.setItem blocked:", e);
    }
  },
  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn("sessionStorage.removeItem blocked:", e);
    }
  }
};

export default function AdminApp() {
  const [apps, setApps] = useState<SaaSApp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Theme Management
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      return (localStorage.getItem("vision79-theme") as "light" | "dark") || "dark";
    } catch (e) {
      return "dark";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("vision79-theme", theme);
    } catch (e) {}
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  // Security Verification session state
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return safeSessionStorage.getItem("admin-token");
  });
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Admin Form variables
  const [formName, setFormName] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState<"web" | "desktop" | "games" | "training">("web");
  const [formPricing, setFormPricing] = useState<"free" | "free_trial" | "premium">("free");
  const [formLogoType, setFormLogoType] = useState<"preset" | "url">("preset");
  const [formPresetIcon, setFormPresetIcon] = useState("lucide:ShieldCheck");
  const [formCustomUrl, setFormCustomUrl] = useState("");
  const [formAccessUrl, setFormAccessUrl] = useState("");
  const [adminNotification, setAdminNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Auto-dismiss notifications after 6 seconds
  useEffect(() => {
    if (!adminNotification) return;
    const t = setTimeout(() => setAdminNotification(null), 6000);
    return () => clearTimeout(t);
  }, [adminNotification]);

  useEffect(() => {
    if (!adNotification) return;
    const t = setTimeout(() => setAdNotification(null), 6000);
    return () => clearTimeout(t);
  }, [adNotification]);

  // Carousel Ads Management state & handlers
  const [ads, setAds] = useState<SaaSAd[]>([]);
  const [adsLoading, setAdsLoading] = useState<boolean>(false);
  const [adsError, setAdsError] = useState<string | null>(null);

  const [adTitle, setAdTitle] = useState("");
  const [adSubtitle, setAdSubtitle] = useState("");
  const [adImageUrl, setAdImageUrl] = useState("");
  const [adLinkUrl, setAdLinkUrl] = useState("");
  const [adSubmitting, setAdSubmitting] = useState(false);
  const [adNotification, setAdNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchAds = async () => {
    try {
      setAdsLoading(true);
      setAdsError(null);
      const res = await fetch("/api/ads");
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setAds(data);
    } catch (err: any) {
      console.error("Error fetching ads:", err);
      setAdsError(err.message || "Failed to load carousel ads");
    } finally {
      setAdsLoading(false);
    }
  };

  const handleCreateAd = async (e: any) => {
    e.preventDefault();
    setAdNotification(null);

    try {
      setAdSubmitting(true);
      const token = adminToken || safeSessionStorage.getItem("admin-token");
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: adTitle,
          subtitle: adSubtitle,
          imageUrl: adImageUrl,
          linkUrl: adLinkUrl
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to persist ad");
      }

      const newAd = await res.json();
      setAds([newAd, ...ads]);

      setAdTitle("");
      setAdSubtitle("");
      setAdImageUrl("");
      setAdLinkUrl("");
      setAdNotification({ type: "success", text: `"${newAd.title}" carousel ad successfully activated!` });
    } catch (err: any) {
      setAdNotification({ type: "error", text: err.message || "An exception occurred during ad creation" });
    } finally {
      setAdSubmitting(false);
    }
  };

  const handleDeleteAd = async (id: number) => {
    if (!confirm("Are you sure you want to permanently remove this Carousel Ad?")) {
      return;
    }

    try {
      const token = adminToken || safeSessionStorage.getItem("admin-token");
      const res = await fetch(`/api/ads/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) {
        let errMsg = "Unable to execute database delete command for ad";
        try {
          const errData = await res.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (je) {}
        throw new Error(errMsg);
      }

      setAds(ads.filter(ad => ad.id !== id));
    } catch (err: any) {
      alert(err.message || "Ad deletion error");
    }
  };

  const handleLogout = () => {
    setAdminToken(null);
    safeSessionStorage.removeItem("admin-token");
    setLoginPassword("");
    setLoginError(null);
  };

  const handleAdminLogin = async (e: any) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginPassword.trim() })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Incorrect password entered.");
      }

      const data = await res.json();
      setAdminToken(data.token);
      safeSessionStorage.setItem("admin-token", data.token);
      setLoginPassword("");
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || "Credential authentication failed.");
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Fetch applications list
  const fetchApps = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch("/api/apps");
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setApps(data);
    } catch (err: any) {
      console.error("Error fetching apps:", err);
      setErrorMsg(err.message || "Failed to load marketplace applications from standard database");
    } finally {
      setLoading(false);
    }
  };

  // Trend graph analytics states
  const [trendData, setTrendData] = useState<{ date: string; launches: number }[]>([]);
  const [trendsLoading, setTrendsLoading] = useState<boolean>(false);
  const [trendsError, setTrendsError] = useState<string | null>(null);

  const fetchTrends = async () => {
    try {
      setTrendsLoading(true);
      setTrendsError(null);
      const token = adminToken || safeSessionStorage.getItem("admin-token");
      const res = await fetch("/api/admin/launch-trends", {
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) {
        throw new Error("Failed to fetch launch count growth trend data");
      }
      const data = await res.json();
      setTrendData(data);
    } catch (err: any) {
      console.error("Error loading trends:", err);
      setTrendsError(err.message || "Failed to load growth trend details");
    } finally {
      setTrendsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
    fetchAds();
  }, []);

  useEffect(() => {
    if (adminToken) {
      fetchTrends();
    }
  }, [adminToken, apps.length]);

  // Handle Admin App Addition
  const handleCreateApp = async (e: any) => {
    e.preventDefault();
    setAdminNotification(null);

    const logoUrl = formLogoType === "preset" ? formPresetIcon : formCustomUrl;
    if (!logoUrl) {
      setAdminNotification({ type: "error", text: "Please enter a valid cover asset logo URL." });
      return;
    }

    try {
      setSubmitting(true);
      const token = adminToken || safeSessionStorage.getItem("admin-token");
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: formName,
          subtitle: formSubtitle,
          description: formDescription,
          category: formCategory,
          pricingType: formPricing,
          logoUrl,
          accessUrl: formAccessUrl
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to persist SaaS product");
      }

      const newApp = await res.json();
      setApps([newApp, ...apps]);

      setFormName("");
      setFormSubtitle("");
      setFormDescription("");
      setFormCustomUrl("");
      setFormAccessUrl("");
      setAdminNotification({ type: "success", text: `"${newApp.name}" has been certified and successfully published!` });
    } catch (err: any) {
      setAdminNotification({ type: "error", text: err.message || "An exception occurred during creation" });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Admin app deletes
  const handleDeleteApp = async (id: number) => {
    if (!confirm("Are you sure you want to permanently remove this SaaS application from VISION79 database?")) {
      return;
    }

    try {
      const token = adminToken || safeSessionStorage.getItem("admin-token");
      const res = await fetch(`/api/apps/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });

      if (!res.ok) {
        let errMsg = "Unable to execute database delete command";
        try {
          const errData = await res.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (je) {}
        throw new Error(errMsg);
      }

      setApps(apps.filter(app => app.id !== id));
      if (adminNotification?.text.includes("certified")) {
        setAdminNotification(null);
      }
    } catch (err: any) {
      alert(err.message || "Delete error");
    }
  };

  // Compute stats for admin panel cards
  const stats: AppStatistics = {
    totalLaunches: apps.reduce((accum, curr) => accum + curr.launchCount, 0),
    totalApps: apps.length,
    webAppsCount: apps.filter(a => a.category === "web").length,
    desktopAppsCount: apps.filter(a => a.category === "desktop").length,
    gamesAppsCount: apps.filter(a => a.category === "games").length,
    trainingAppsCount: apps.filter(a => a.category === "training").length
  };

  return (
    <div className="flex flex-col min-h-screen border border-app-border bg-app-bg text-app-text selection:bg-app-border/40 antialiased">
      
      {/* PROFESSIONAL POLISH SYSTEM HEADER */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-app-border bg-app-header-bg backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md flex items-center justify-center font-black text-xs tracking-tighter bg-app-text text-app-bg">V7</div>
          <span className="font-bold text-lg tracking-tighter text-app-text font-display">VISION79</span>
          <div className="h-4 w-px bg-app-border mx-2"></div>
          <span className="text-xs text-app-text-muted font-mono tracking-widest uppercase">Admin System</span>
        </div>
        
        <nav className="flex items-center gap-6 text-sm font-medium">
          <a 
            href="/"
            className="text-xs text-app-text-sec hover:text-app-text transition"
          >
            Explore Marketplace
          </a>

          {/* Theme Toggle Switcher */}
          <button
            id="btn-theme-toggle"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-app-border bg-app-btn-sec text-app-text hover:bg-app-btn-sec/80 transition-all duration-200 flex items-center justify-center cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </nav>
      </header>

      {/* CORE CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
          <div className="p-6 sm:p-10 flex-1">
            <AnimatePresence mode="wait">
              {!adminToken ? (
                // ==================== ADMIN SECURITY GATEWAY ====================
                <motion.div
                  key="admin-gate"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="max-w-md mx-auto my-8 sm:my-16"
                >
                  <div className="glass p-8 rounded-2xl border border-app-border bg-app-aside-bg/40 space-y-6 shadow-xl">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-500">
                        <Lock className="w-5 h-5 animate-pulse" />
                      </div>
                      <h2 className="text-xl font-bold tracking-tight text-app-text font-display">VISION79 Admin Authentication</h2>
                      <p className="text-xs text-app-text-sec">This page requires dynamic cryptographic authorization checks. Please verify your administrative credential token.</p>
                    </div>

                    <form onSubmit={handleAdminLogin} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-app-text-sec">Administration Password</label>
                        <input
                          id="login-password-field"
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••••••••"
                          className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-3 text-sm focus:outline-none focus:border-app-border/80"
                          autoFocus
                        />
                      </div>

                      {loginError && (
                        <div className="p-3 rounded-lg text-xs font-mono border bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
                          {loginError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loginSubmitting}
                        className="w-full py-2.5 text-xs rounded-lg bg-app-text text-app-bg font-bold cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        {loginSubmitting ? "Verifying..." : "Verify Credentials"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </form>

                    <div className="pt-4 border-t border-app-border/40 text-center text-[10px] text-app-text-muted font-mono leading-relaxed">
                      <span>Default password is <code className="px-1.5 py-0.5 bg-app-btn-sec rounded border border-app-border">vision79admin</code> if not overridden by env policies. All modifications undergo server-side token checks.</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                // ==================== ADMIN PANEL ACTIVE STRIP VIEW ====================
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-8 animate-fade-in-once"
                >
                  {/* Top Stats Box */}
                  <section className="glass rounded-2xl p-6 bg-app-aside-bg/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-xl font-bold font-display text-app-text tracking-tight">VISION79 Central Registrar</h2>
                        <p className="text-xs text-app-text-sec">Track clicks, deploy new SaaS tools, and clean up direct-hyperlinks saved inside local SQLite db.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href="/"
                          className="text-xs font-semibold bg-app-btn-sec border border-app-border hover:bg-app-btn-sec/80 px-4 py-2 rounded-xl text-app-text transition cursor-pointer"
                        >
                          Back to Explorer
                        </a>
                        <button
                          onClick={handleLogout}
                          className="text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 px-4 py-2 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 transition cursor-pointer flex items-center gap-1.5"
                          title="Destroy admin session"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Log Out
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="bg-app-btn-sec/30 p-4 rounded-xl border border-app-border space-y-1">
                        <span className="text-[10px] font-mono text-app-text-muted uppercase tracking-wider block">Total SaaS Tools</span>
                        <span id="stat-total-apps" className="text-2xl font-mono font-bold text-app-text block">{stats.totalApps}</span>
                      </div>
                      <div className="bg-app-btn-sec/30 p-4 rounded-xl border border-app-border space-y-1">
                        <span className="text-[10px] font-mono text-app-text-muted uppercase tracking-wider block">Web Platforms</span>
                        <span id="stat-web-apps" className="text-2xl font-mono font-bold text-app-text-sec block">{stats.webAppsCount}</span>
                      </div>
                      <div className="bg-app-btn-sec/30 p-4 rounded-xl border border-app-border space-y-1">
                        <span className="text-[10px] font-mono text-app-text-muted uppercase tracking-wider block">Desktop Binaries</span>
                        <span id="stat-desktop-apps" className="text-2xl font-mono font-bold text-app-text-sec block">{stats.desktopAppsCount}</span>
                      </div>
                      <div className="bg-app-btn-sec/30 p-4 rounded-xl border border-app-border space-y-1">
                        <span className="text-[10px] font-mono text-app-text-muted uppercase tracking-wider block">Game Platforms</span>
                        <span id="stat-games-apps" className="text-2xl font-mono font-bold text-app-text-sec block">{stats.gamesAppsCount}</span>
                      </div>
                      <div className="bg-app-btn-sec/30 p-4 rounded-xl border border-app-border space-y-1">
                        <span className="text-[10px] font-mono text-app-text-muted uppercase tracking-wider block">Training Suites</span>
                        <span id="stat-training-apps" className="text-2xl font-mono font-bold text-app-text-sec block">{stats.trainingAppsCount}</span>
                      </div>
                      <div className="bg-app-btn-sec/30 p-4 rounded-xl border border-app-border space-y-1">
                        <span className="text-[10px] font-mono text-app-text-muted uppercase tracking-wider block">Total Launches</span>
                        <span id="stat-total-launches" className="text-2xl font-mono font-bold text-emerald-500 dark:text-emerald-400 block">{stats.totalLaunches.toLocaleString()}</span>
                      </div>
                    </div>
                  </section>

                  {/* GROWTH TREND LINE CHART */}
                  <section className="glass rounded-2xl p-6 bg-app-aside-bg/50 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-indigo-500 animate-pulse" />
                          <h3 className="text-sm font-semibold uppercase tracking-wider font-display text-app-text">Total Launches Growth Trend</h3>
                        </div>
                        <p className="text-xs text-app-text-sec">Interactive visual tracking of direct-clicks and execution triggers across all SaaS products over the last 7 days.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={fetchTrends}
                          className="px-2.5 py-1 text-[10px] font-mono rounded border border-app-border bg-app-btn-sec text-app-text hover:bg-app-btn-sec/80 transition-colors cursor-pointer"
                          title="Refresh trend queries"
                        >
                          Sync Feed
                        </button>
                        <span className="text-[10px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded">
                          7-Day Dynamic Window
                        </span>
                      </div>
                    </div>

                    <div className="h-[240px] w-full mt-2 select-none">
                      {trendsLoading && trendData.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center font-mono text-xs text-app-text-muted">
                          Analyzing registrar logs & calculating offsets...
                        </div>
                      ) : trendsError ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-2">
                          <AlertTriangle className="w-8 h-8 text-rose-500" />
                          <p className="text-xs text-app-text-muted font-mono">{trendsError}</p>
                          <button
                            onClick={fetchTrends}
                            className="text-xs px-3 py-1 bg-app-btn-sec border border-app-border rounded text-app-text"
                          >
                            Retry Loading
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-full pr-4 pb-2">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={trendData}
                              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                            >
                              <CartesianGrid 
                                strokeDasharray="3 3" 
                                stroke={theme === "dark" ? "rgba(63, 63, 70, 0.4)" : "rgba(228, 228, 230, 0.6)"} 
                                vertical={false}
                              />
                              <XAxis 
                                dataKey="date" 
                                stroke={theme === "dark" ? "#71717a" : "#888888"} 
                                fontSize={10}
                                fontFamily="monospace"
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                              />
                              <YAxis 
                                stroke={theme === "dark" ? "#71717a" : "#888888"} 
                                fontSize={10}
                                fontFamily="monospace"
                                tickLine={false}
                                axisLine={false}
                                domain={['auto', 'auto']}
                                dx={-5}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
                                  borderColor: theme === "dark" ? "#27272a" : "#e4e4e7",
                                  borderRadius: "12px",
                                  color: theme === "dark" ? "#f4f4f5" : "#18181b",
                                  fontFamily: "monospace",
                                  fontSize: "11px",
                                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                                }}
                                itemStyle={{ color: "#818cf8", fontWeight: "bold" }}
                                cursor={{ stroke: theme === "dark" ? "rgba(63, 63, 70, 0.7)" : "rgba(212, 212, 216, 0.8)", strokeWidth: 1 }}
                              />
                              <Line
                                name="Total Launches"
                                type="monotone"
                                dataKey="launches"
                                stroke="#818cf8"
                                strokeWidth={3}
                                strokeLinecap="round"
                                dot={{ r: 4, stroke: "#818cf8", strokeWidth: 1.5, fill: theme === "dark" ? "#18181b" : "#ffffff" }}
                                activeDot={{ r: 6, strokeWidth: 0, fill: "#818cf8" }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Split Layout: Card list + Addition form */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Column Add Form */}
                    <div className="lg:col-span-5 glass p-6 rounded-2xl space-y-5 h-fit">
                      <div className="flex items-center gap-2 pb-3 border-b border-app-border">
                        <Plus className="w-5 h-5 text-app-text-sec" />
                        <h3 className="text-sm font-semibold uppercase tracking-wider font-display text-app-text">Add SaaS Product</h3>
                      </div>

                      <form id="add-app-form" onSubmit={handleCreateApp} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-app-text-sec uppercase">Application Name</label>
                          <input 
                            id="input-name"
                            type="text"
                            required
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="e.g. VISION79 Kubernetes Tracker"
                            className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2.5 text-xs placeholder:text-app-text-muted/65 focus:outline-none focus:border-app-border/80"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-app-text-sec uppercase">Catchy Subtitle</label>
                          <input 
                            id="input-subtitle"
                            type="text"
                            required
                            value={formSubtitle}
                            onChange={(e) => setFormSubtitle(e.target.value)}
                            placeholder="e.g. Zero-config clusters monitoring"
                            className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2.5 text-xs placeholder:text-app-text-muted/65 focus:outline-none focus:border-app-border/80"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-app-text-sec uppercase">Category</label>
                            <select 
                              id="select-category"
                              value={formCategory}
                              onChange={(e) => setFormCategory(e.target.value as any)}
                              className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2.5 text-xs focus:outline-none"
                            >
                              <option className="bg-app-bg text-app-text" value="web">Web App</option>
                              <option className="bg-app-bg text-app-text" value="desktop">Desktop App</option>
                              <option className="bg-app-bg text-app-text" value="games">Game App</option>
                              <option className="bg-app-bg text-app-text" value="training">Training</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-app-text-sec uppercase">Pricing Tier</label>
                            <select 
                              id="select-pricing"
                              value={formPricing}
                              onChange={(e) => setFormPricing(e.target.value as any)}
                              className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2.5 text-xs focus:outline-none"
                            >
                              <option className="bg-app-bg text-app-text" value="free">Free</option>
                              <option className="bg-app-bg text-app-text" value="free_trial">Free Trial</option>
                              <option className="bg-app-bg text-app-text" value="premium">Subscription</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-app-text-sec uppercase">Description</label>
                          <textarea 
                            id="textarea-description"
                            required
                            rows={3}
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2.5 text-xs resize-none focus:outline-none focus:border-app-border/80"
                            placeholder="Briefly detail what security scans or system solutions this tool runs..."
                          />
                        </div>

                        {/* Format Selection Selector Card */}
                        <div className="p-3 rounded-xl border bg-app-btn-sec/20 border-app-border space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-app-text-muted">Asset Logo Format</span>
                            <div className="flex rounded-md p-0.5 border bg-app-input border-app-input-border">
                              <button 
                                type="button" 
                                onClick={() => setFormLogoType("preset")}
                                className={`px-2 py-0.5 rounded text-[9px] font-mono cursor-pointer ${formLogoType === "preset" ? "bg-app-btn-sec text-app-text font-semibold" : "text-app-text-muted"}`}
                              >
                                presets
                              </button>
                              <button 
                                type="button" 
                                onClick={() => setFormLogoType("url")}
                                className={`px-2 py-0.5 rounded text-[9px] font-mono cursor-pointer ${formLogoType === "url" ? "bg-app-btn-sec text-app-text font-semibold" : "text-app-text-muted"}`}
                              >
                                custom URL
                              </button>
                            </div>
                          </div>

                          {formLogoType === "preset" ? (
                            <div className="space-y-1">
                              <select 
                                id="select-preset-icon"
                                value={formPresetIcon}
                                onChange={(e) => setFormPresetIcon(e.target.value)}
                                className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2 text-xs focus:outline-none"
                              >
                                {PRESET_ICONS.map(p => (
                                  <option className="bg-app-bg text-app-text" key={p.id} value={p.id}>{p.label}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <input 
                              id="input-logo-url"
                              type="url"
                              value={formCustomUrl}
                              onChange={(e) => setFormCustomUrl(e.target.value)}
                              placeholder="https://images.unsplash.com or /logo.png"
                              className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2 text-xs focus:outline-none"
                            />
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase text-app-text-sec">Hyperlink Endpoint / Repository URL</label>
                          <input 
                            id="input-access-url"
                            type="url"
                            required
                            value={formAccessUrl}
                            onChange={(e) => setFormAccessUrl(e.target.value)}
                            placeholder="https://app.vision79.com or installer.dmg"
                            className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2.5 text-xs focus:outline-none focus:border-app-border/80"
                          />
                        </div>

                        <button
                          id="submit-form-btn"
                          type="submit"
                          disabled={submitting}
                          className="w-full py-2.5 text-xs rounded-lg transition-all bg-app-text text-app-bg font-bold cursor-pointer"
                        >
                          {submitting ? "Writing SQLite..." : "Certify & Set Active ✨"}
                        </button>
                      </form>

                      {adminNotification && (
                        <div className={`p-3 rounded-lg text-xs font-mono border ${
                          adminNotification.type === "success" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25"
                        }`}>
                          {adminNotification.text}
                        </div>
                      )}
                    </div>

                    {/* Left Column Table registry list */}
                    <div className="lg:col-span-7 glass p-6 rounded-2xl space-y-4">
                      <div className="pb-3 border-b border-app-border flex justify-between items-center">
                        <h4 className="text-sm font-semibold uppercase tracking-wider font-display text-app-text">SQLite Tool Registry</h4>
                        <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">ONLINE</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-app-border text-app-text-muted font-mono text-[10px] uppercase">
                              <th className="pb-3 font-medium">SaaS app</th>
                              <th className="pb-3 font-medium">Metric clicks</th>
                              <th className="pb-3 font-medium">Status</th>
                              <th className="pb-3 font-medium text-right">Delete</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-app-border/50">
                            {loading ? (
                              <tr>
                                <td colSpan={4} className="py-10 text-center text-xs text-app-text-muted font-mono">
                                  Loading registry...
                                </td>
                              </tr>
                            ) : apps.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="py-10 text-center text-xs text-app-text-muted font-mono">
                                  No applications in registry. Add your first SaaS product above.
                                </td>
                              </tr>
                            ) : apps.map((app) => (
                              <tr key={app.id} className="hover:bg-app-btn-sec/20 transition-colors duration-150">
                                <td className="py-3 flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-lg bg-app-btn-sec flex items-center justify-center border border-app-border shrink-0">
                                    <AppLogo logoUrl={app.logoUrl} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-app-text truncate">{app.name}</p>
                                    <p className="text-[10px] text-app-text-muted font-mono truncate">{app.pricingType}</p>
                                  </div>
                                </td>
                                <td className="py-3 font-mono text-app-text-sec">
                                  {app.launchCount.toLocaleString()}
                                </td>
                                <td className="py-3">
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-app-btn-sec border border-app-border text-app-text-sec uppercase">
                                    {app.category}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  <button
                                    onClick={() => handleDeleteApp(app.id)}
                                    className="p-1.5 text-app-text-muted hover:text-rose-500 hover:bg-app-btn-sec rounded transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                  {/* CAROUSEL ADS CONTROL WORKSPACE */}
                  <div className="pt-8 border-t border-app-border/45 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Megaphone className="w-5 h-5 text-indigo-500 animate-pulse" />
                          <h3 className="text-base font-bold font-display text-app-text tracking-tight">Active Promotional Campaigns</h3>
                        </div>
                        <p className="text-xs text-app-text-sec">Organize spotlight slides, developer bootcamps, or enterprise upgrades placed inside the hero space of the explorer page.</p>
                      </div>
                      <button
                        onClick={fetchAds}
                        className="self-start sm:self-auto text-xs px-3 py-1.5 bg-app-btn-sec border border-app-border text-app-text hover:bg-app-btn-sec/80 rounded-lg cursor-pointer"
                      >
                        Synch Ads Database
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      
                      {/* Column Add Ad Form */}
                      <div className="lg:col-span-5 glass p-6 rounded-2xl space-y-5 h-fit bg-app-aside-bg/30">
                        <div className="flex items-center gap-2 pb-3 border-b border-app-border">
                          <Plus className="w-4 h-4 text-app-text-sec" />
                          <h4 className="text-xs font-semibold uppercase tracking-wider font-display text-app-text">Publish Custom Campaign</h4>
                        </div>

                        <form id="add-ad-form" onSubmit={handleCreateAd} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-app-text-sec uppercase">Campaign Slide Title</label>
                            <input 
                              id="ad-title"
                              type="text"
                              required
                              value={adTitle}
                              onChange={(e) => setAdTitle(e.target.value)}
                              placeholder="e.g. Save 30% on Sentinels Pro Scanner"
                              className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2.5 text-xs placeholder:text-app-text-muted/65 focus:outline-none focus:border-app-border/80"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-app-text-sec uppercase">Promo Offer Details / Subtitle</label>
                            <input 
                              id="ad-subtitle"
                              type="text"
                              required
                              value={adSubtitle}
                              onChange={(e) => setAdSubtitle(e.target.value)}
                              placeholder="e.g. Get zero-trust tunnels, instant audit reports and alerts"
                              className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2.5 text-xs placeholder:text-app-text-muted/65 focus:outline-none focus:border-app-border/80"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-app-text-sec uppercase">Cover Hero Image URL</label>
                            <input 
                              id="ad-image-url"
                              type="url"
                              required
                              value={adImageUrl}
                              onChange={(e) => setAdImageUrl(e.target.value)}
                              placeholder="https://images.unsplash.com/... or relative file path"
                              className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2.5 text-xs placeholder:text-app-text-muted/65 focus:outline-none focus:border-app-border/80"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-app-text-sec uppercase">Interactive Click link / Route URL</label>
                            <input 
                              id="ad-link-url"
                              type="url"
                              required
                              value={adLinkUrl}
                              onChange={(e) => setAdLinkUrl(e.target.value)}
                              placeholder="https://sentinel.vision79.example.com/demo"
                              className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2.5 text-xs placeholder:text-app-text-muted/65 focus:outline-none focus:border-app-border/80"
                            />
                          </div>

                          <button
                            id="submit-ad-btn"
                            type="submit"
                            disabled={adSubmitting}
                            className="w-full py-2.5 text-xs rounded-lg transition-all bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                          >
                            {adSubmitting ? "Writing SQLite..." : "Launch Spotlight Slide ✨"}
                          </button>
                        </form>

                        {adNotification && (
                          <div className={`p-3 rounded-lg text-xs font-mono border ${
                            adNotification.type === "success" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25"
                          }`}>
                            {adNotification.text}
                          </div>
                        )}
                      </div>

                      {/* Right Column Ads list */}
                      <div className="lg:col-span-7 glass p-6 rounded-2xl space-y-4 bg-app-aside-bg/30">
                        <div className="pb-3 border-b border-app-border flex justify-between items-center">
                          <h4 className="text-xs font-semibold uppercase tracking-wider font-display text-app-text">Registry database slides</h4>
                          <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                            {ads.length} CAMPAIGNS ACTIVE
                          </span>
                        </div>

                        {adsLoading ? (
                          <div className="text-xs text-app-text-muted font-mono py-8 text-center">
                            Refinding registries in sqlite entries...
                          </div>
                        ) : ads.length === 0 ? (
                          <div className="text-xs text-app-text-muted font-mono py-12 text-center bg-app-btn-sec/10 rounded-xl border border-dashed border-app-border">
                            No campaigns found in Database. Create beautiful spotlights above!
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-1">
                            {ads.map((ad) => (
                              <div key={ad.id} className="relative group overflow-hidden rounded-xl border border-app-border bg-app-btn-sec/15 p-4 flex gap-4 hover:border-indigo-500/40 transition">
                                <div className="w-24 h-16 rounded-lg bg-cover bg-center shrink-0 border border-app-border overflow-hidden bg-zinc-800">
                                  <img 
                                    src={ad.imageUrl} 
                                    alt={ad.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                                <div className="min-w-0 flex-1 flex flex-col justify-between">
                                  <div>
                                    <h5 className="font-semibold text-xs text-app-text truncate">{ad.title}</h5>
                                    <p className="text-[10px] text-app-text-sec line-clamp-2 mt-0.5 leading-relaxed">{ad.subtitle}</p>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className="text-[9px] font-mono text-app-text-muted truncate max-w-full block scrollbar-none">
                                      {ad.linkUrl}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end justify-center shrink-0 ml-2">
                                  <button
                                    onClick={() => handleDeleteAd(ad.id)}
                                    className="p-2 text-app-text-muted hover:text-rose-500 hover:bg-app-bg rounded-lg border border-transparent hover:border-app-border transition cursor-pointer"
                                    title="Delete Campaign"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SYSTEM FOOTER OF DESIGN SPEC */}
          <footer className="h-10 border-t border-app-border bg-app-header-bg flex items-center justify-between px-8 text-[10px] text-app-text-sec font-mono uppercase tracking-[0.2em] shrink-0 mt-auto">
            <div className="flex items-center gap-4">
              <span>System Status</span>
              <div className="flex items-center gap-2 text-app-text font-bold">
                <div className="status-dot"></div> Operational
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              <span>© 2026 VISION79 INC</span>
              <span>Secure Layer</span>
              <span>Terms API</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
