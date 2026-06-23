import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Download, 
  Search, 
  Info,
  Layers,
  TrendingUp,
  Package,
  AlertTriangle,
  Monitor,
  Globe,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Gamepad2,
  GraduationCap
} from "lucide-react";
import { SaaSApp, CategoryFilter, SaaSAd } from "./types";
import { AppLogo } from "./components/AppLogo";

export default function App() {
  const [apps, setApps] = useState<SaaSApp[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ad carousel variables
  const [ads, setAds] = useState<SaaSAd[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState<number>(0);

  // Fetch ads
  const fetchAds = async () => {
    try {
      const res = await fetch("/api/ads");
      if (res.ok) {
        const data = await res.json();
        setAds(data);
      }
    } catch (e) {
      console.error("Failed to load campaigns", e);
    }
  };

  // Theme Management
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("vision79-theme") as "light" | "dark") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("vision79-theme", theme);
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

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("all");

  // Counter animation tracking keys
  const [pulsingAppId, setPulsingAppId] = useState<number | null>(null);

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

  useEffect(() => {
    fetchApps();
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [ads]);

  // Handle Incrementation of dynamic triggers
  const handleAppLaunch = async (app: SaaSApp) => {
    try {
      setPulsingAppId(app.id);
      setTimeout(() => setPulsingAppId(null), 1000);

      const res = await fetch("/api/apps/increment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: app.id })
      });

      if (!res.ok) {
        throw new Error("Failed to record launch metric.");
      }

      const updatedRow = await res.json();
      setApps(apps.map(a => a.id === app.id ? updatedRow : a));

      // Redirect or launch after writing the log metric
      if (app.accessUrl) {
        window.open(app.accessUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err: any) {
      console.error("Increment error:", err);
    }
  };

  const handleAdminRedirect = () => {
    window.location.href = "/admin";
  };

  // Filters application dataset logic
  const filteredApps = apps.filter((app) => {
    const categoryMatches = selectedCategory === "all" || app.category === selectedCategory;
    const searchMatches = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatches && searchMatches;
  });

  return (
    <div className="flex flex-col min-h-screen border border-app-border bg-app-bg text-app-text selection:bg-app-border/40 antialiased">
      
      {/* PROFESSIONAL POLISH SYSTEM HEADER */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-app-border bg-app-header-bg backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}>
          <div className="w-8 h-8 rounded-md flex items-center justify-center font-black text-xs tracking-tighter bg-app-text text-app-bg">V7</div>
          <span className="font-bold text-lg tracking-tighter text-app-text font-display">VISION79</span>
          <div className="h-4 w-px bg-app-border mx-2"></div>
          <span className="text-xs text-app-text-muted font-mono tracking-widest uppercase">Marketplace</span>
        </div>
        
        <nav className="flex items-center gap-6 text-sm font-medium">
          <button 
            id="btn-explore"
            onClick={() => setSelectedCategory("all")}
            className="transition font-sans text-app-text font-semibold cursor-pointer"
          >
            Explore
          </button>

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

      {/* MID CONTAINER HOUSING SPLIT-PANEL */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT ASIDE BAR PANEL */}
        <aside className="w-64 border-r border-app-border p-6 flex flex-col gap-8 bg-app-aside-bg shrink-0 hidden md:flex">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-app-text-muted uppercase tracking-widest">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li 
                id="filter-all"
                onClick={() => setSelectedCategory("all")}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedCategory === "all"
                    ? "bg-app-btn-sec border border-app-border text-app-text font-medium"
                    : "text-app-text-sec hover:text-app-text hover:bg-app-btn-sec/55 border border-transparent"
                }`}
              >
                <Layers className="w-4 h-4 stroke-[1.8]" />
                All Tools
              </li>
              <li 
                id="filter-web"
                onClick={() => setSelectedCategory("web")}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedCategory === "web"
                    ? "bg-app-btn-sec border border-app-border text-app-text font-medium"
                    : "text-app-text-sec hover:text-app-text hover:bg-app-btn-sec/55 border border-transparent"
                }`}
              >
                <Globe className="w-4 h-4 stroke-[1.8]" />
                Web Apps
              </li>
              <li 
                id="filter-desktop"
                onClick={() => setSelectedCategory("desktop")}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedCategory === "desktop"
                    ? "bg-app-btn-sec border border-app-border text-app-text font-medium"
                    : "text-app-text-sec hover:text-app-text hover:bg-app-btn-sec/55 border border-transparent"
                }`}
              >
                <Monitor className="w-4 h-4 stroke-[1.8]" />
                Desktop
              </li>
              <li 
                id="filter-games"
                onClick={() => setSelectedCategory("games")}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedCategory === "games"
                    ? "bg-app-btn-sec border border-app-border text-app-text font-medium"
                    : "text-app-text-sec hover:text-app-text hover:bg-app-btn-sec/55 border border-transparent"
                }`}
              >
                <Gamepad2 className="w-4 h-4 stroke-[1.8]" />
                Games
              </li>
              <li 
                id="filter-training"
                onClick={() => setSelectedCategory("training")}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                  selectedCategory === "training"
                    ? "bg-app-btn-sec border border-app-border text-app-text font-medium"
                    : "text-app-text-sec hover:text-app-text hover:bg-app-btn-sec/55 border border-transparent"
                }`}
              >
                <GraduationCap className="w-4 h-4 stroke-[1.8]" />
                Training
              </li>
            </ul>
          </div>


        </aside>

        {/* RIGHT CORE CONTENT WRAPPER */}
        <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
          <div className="p-6 sm:p-10 flex-1">
            
            <AnimatePresence mode="wait">
              <motion.div
                key="explore"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-8"
              >
                {/* Hero Text Block */}
                <div className="flex flex-col gap-1 max-w-3xl">
                  <h1 className="text-4xl font-semibold tracking-tight font-display text-app-text">
                    Discover the Stack.
                  </h1>
                  <p className="text-app-text-sec text-lg font-light leading-snug">
                    Sleek, high-performance tools engineered for modern engineering teams.
                  </p>
                </div>

                {/* PROMOTION ADS HERO CAROUSEL */}
                {ads.length > 0 && (
                  <div className="relative overflow-hidden rounded-2xl border border-app-border bg-app-aside-bg/40 shadow-lg group">
                    <div className="relative h-[340px] sm:h-[180px] w-full select-none">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentAdIndex}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                          onClick={() => {
                            const link = ads[currentAdIndex]?.linkUrl;
                            if (link) {
                              window.open(link, "_blank", "noopener,noreferrer");
                            }
                          }}
                          className="absolute inset-0 flex flex-col sm:flex-row items-stretch cursor-pointer"
                        >
                          {/* Image side */}
                          <div className="relative w-full sm:w-2/5 h-48 sm:h-full bg-cover bg-center shrink-0 border-b sm:border-b-0 sm:border-r border-app-border overflow-hidden bg-zinc-800">
                            <img 
                              src={ads[currentAdIndex].imageUrl} 
                              alt={ads[currentAdIndex].title} 
                              className="w-full h-full object-cover group-hover:scale-102 transition duration-700" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded border border-white/20 text-[8px] font-mono font-bold tracking-widest text-emerald-400 uppercase flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              Spotlight
                            </div>
                          </div>

                          {/* Content side */}
                          <div className="p-6 flex-1 flex flex-col justify-center space-y-2 bg-gradient-to-r from-app-aside-bg/10 to-app-aside-bg/30 relative">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-500 font-semibold tracking-wider uppercase">
                              <Megaphone className="w-3.5 h-3.5" />
                              <span>Featured Solution</span>
                            </div>
                            <h2 className="text-xl font-bold tracking-tight text-app-text font-display leading-tight">
                              {ads[currentAdIndex].title}
                            </h2>
                            <p className="text-xs text-app-text-sec font-light max-w-xl leading-relaxed">
                              {ads[currentAdIndex].subtitle}
                            </p>
                            <div className="pt-2 text-[10px] font-mono text-app-text-muted group-hover:text-indigo-400 transition flex items-center gap-1.5">
                              Learn more <span className="text-xs">→</span>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Navigation overrides */}
                    {ads.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentAdIndex((prev) => (prev - 1 + ads.length) % ads.length);
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg border border-app-border bg-app-bg/80 text-app-text backdrop-blur-md hover:bg-app-btn-sec/90 cursor-pointer opacity-0 group-hover:opacity-100 transition duration-200"
                          title="Previous slide"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentAdIndex((prev) => (prev + 1) % ads.length);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg border border-app-border bg-app-bg/80 text-app-text backdrop-blur-md hover:bg-app-btn-sec/90 cursor-pointer opacity-0 group-hover:opacity-100 transition duration-200"
                          title="Next slide"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        <div className="absolute bottom-3 right-6 flex items-center gap-1.5">
                          {ads.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentAdIndex(idx);
                              }}
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                                idx === currentAdIndex ? "bg-indigo-500 w-3" : "bg-app-text-muted/40"
                              }`}
                              title={`Go to slide ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Enhanced Search Input */}
                <div className="relative flex items-center max-w-2xl">
                  <Search className="absolute left-4 text-app-text-muted w-5 h-5 placeholder-muted" />
                  <input 
                    id="search-input"
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tools, databases, frameworks, and extensions..." 
                    className="w-full bg-app-input border border-app-input-border rounded-full py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-app-border focus:border-app-border transition-all text-app-text placeholder:text-app-text-muted/60"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 text-app-text-muted hover:text-app-text text-xs font-mono font-bold cursor-pointer"
                    >
                      CLEAR
                    </button>
                  )}
                </div>

                {/* Apps Grid Layout */}
                <div className="pt-2">
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {[1, 2, 3].map((placeholder) => (
                        <div key={placeholder} className="glass p-5 rounded-2xl h-60 animate-pulse flex flex-col justify-between">
                          <div className="space-y-4">
                            <div className="w-12 h-12 bg-app-border/60 rounded-xl" />
                            <div className="h-4 bg-app-border/50 rounded w-2/3" />
                            <div className="h-3 bg-app-border/50 rounded w-1/2" />
                          </div>
                          <div className="h-9 bg-app-border/60 rounded w-full" />
                        </div>
                      ))}
                    </div>
                  ) : errorMsg ? (
                    <div className="text-center py-12 glass rounded-2xl border-app-border space-y-3">
                      <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                      <p className="text-xs text-app-text-muted font-mono">{errorMsg}</p>
                      <button onClick={fetchApps} className="px-3 py-1.5 bg-app-btn-sec border border-app-border rounded text-xs text-app-text">
                        Retry Sync
                      </button>
                    </div>
                  ) : filteredApps.length === 0 ? (
                    <div className="text-center py-16 bg-app-aside-bg rounded-2xl border border-app-border space-y-3 text-app-text-sec">
                      <Package className="w-10 h-10 mx-auto text-app-text-muted" />
                      <p className="text-sm">No SaaS matches your filter settings.</p>
                      <button 
                        onClick={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                        className="px-3 py-1 text-xs border border-app-border rounded bg-app-btn-sec text-app-text hover:bg-app-btn-sec/80 cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredApps.map((app) => {
                        const isPulsing = pulsingAppId === app.id;
                        const isWeb = app.category === "web";
                        const pricingText = 
                          app.pricingType === "free" ? "Free" : 
                          app.pricingType === "free_trial" ? "Free Trial" : "Subscription";

                        let badgeColor = "bg-app-btn-sec text-app-text-sec border border-app-border";
                        if (app.category === "desktop") {
                          badgeColor = "bg-blue-600/10 text-blue-500 font-medium border border-blue-500/20";
                        } else if (app.category === "games") {
                          badgeColor = "bg-amber-600/10 text-amber-500 font-medium border border-amber-500/20";
                        } else if (app.category === "training") {
                          badgeColor = "bg-emerald-600/10 text-emerald-500 font-medium border border-emerald-500/20";
                        }

                        return (
                          <div 
                            key={app.id}
                            className="glass p-5 rounded-2xl flex flex-col justify-between gap-4 group hover:border-app-text/30 transition-colors duration-300 shadow-sm hover:shadow"
                          >
                            <div className="space-y-4">
                              {/* Top Badges */}
                              <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-app-btn-sec rounded-xl flex items-center justify-center border border-app-border">
                                  <AppLogo logoUrl={app.logoUrl} />
                                </div>
                                <div className="flex flex-col items-end gap-1 font-mono">
                                  <span className={`text-[10px] px-2 py-0.5 rounded uppercase ${badgeColor}`}>
                                    {app.category}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 border border-app-border bg-app-btn-sec/50 text-app-text-muted uppercase">
                                    {pricingText}
                                  </span>
                                </div>
                              </div>

                              {/* Content titles */}
                              <div>
                                <h4 className="font-bold text-app-text transition font-display text-base">
                                  {app.name}
                                </h4>
                                <p className="text-[11px] text-app-text-sec font-mono mt-0.5 tracking-wide leading-tight">
                                  {app.subtitle}
                                </p>
                                <p className="text-xs text-app-text-muted mt-2.5 line-clamp-3 leading-relaxed">
                                  {app.description}
                                </p>
                              </div>
                            </div>

                            {/* Footer count action button block */}
                            <div className="flex items-center justify-between pt-1 border-t border-app-border/40 mt-2">
                              <div className="flex items-center space-x-1 font-mono text-[10px] text-app-text-sec">
                                <span className="font-semibold">{app.launchCount.toLocaleString()}</span>
                                <span className="text-app-text-muted font-normal">
                                  {isWeb ? "Launches" : "Downloads"}
                                </span>
                              </div>

                              <button
                                onClick={() => handleAppLaunch(app)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                                  isPulsing
                                    ? "bg-app-text text-app-bg scale-95 opacity-80"
                                    : "bg-app-text text-app-bg hover:opacity-90"
                                }`}
                              >
                                {app.pricingType === "premium" ? "Subscribe 🔒" : isWeb ? "Launch ↗" : "Download ↓"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
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
