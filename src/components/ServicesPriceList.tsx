import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  ShieldCheck, 
  Users, 
  Coins, 
  Calculator, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  Check, 
  Shield, 
  Flame, 
  Info,
  DollarSign,
  AlertCircle
} from "lucide-react";

interface ServicesPriceListProps {
  onBack: () => void;
}

interface ServiceTier {
  id: string;
  name: string;
  badge: string;
  description: string;
  xcdPricePerUser: number;
  minTerm: string;
  slaResponse: string;
  colorClass: string;
  features: string[];
  lucideIcon: any;
}

export function ServicesPriceList({ onBack }: ServicesPriceListProps) {
  // Toggle between XCD (Eastern Caribbean Dollars) and USD
  const [currency, setCurrency] = useState<"XCD" | "USD">("XCD");
  const XCD_TO_USD_PEG = 2.70; // Fixed peg: 2.70 XCD = 1 USD

  // Toggle VAT included in calculations (12.5% Saint Lucia VAT)
  const [includeVat, setIncludeVat] = useState<boolean>(true);

  // Expanded SLA sections state
  const [showSlaMatrix, setShowSlaMatrix] = useState<boolean>(true);

  // States for the Interactive Cost Estimator
  const [estimatorTier, setEstimatorTier] = useState<"essential" | "professional" | "enterprise">("professional");
  const [userCount, setUserCount] = useState<number>(15);
  const [includeBackupAddon, setIncludeBackupAddon] = useState<boolean>(true);
  const [includeMfaAddon, setIncludeMfaAddon] = useState<boolean>(false);
  const [includeComplianceAddon, setIncludeComplianceAddon] = useState<boolean>(false);
  const [backupStorageGb, setBackupStorageGb] = useState<number>(500); // Storage selection in GB

  // Hourly Rate and Project Services Info state
  const [activeHourlyCalculator, setActiveHourlyCalculator] = useState<boolean>(false);
  const [calcHours, setCalcHours] = useState<number>(8);
  const [calcRateType, setCalcRateType] = useState<"standard" | "emergency">("standard");

  // Constants based on fire lion MSP service catalogs
  const tierPricing = {
    essential: { xcd: 120, usd: 120 / 2.70 },
    professional: { xcd: 220, usd: 220 / 2.70 },
    enterprise: { xcd: 450, usd: 450 / 2.70 }
  };

  const serviceTiers: ServiceTier[] = [
    {
      id: "essential",
      name: "Essential Care",
      badge: "Core Operations Protection",
      description: "Best for small Caribbean teams needing dependable endpoint protection, remote helpdesk assistance, and system integrity maintenance.",
      xcdPricePerUser: 120,
      minTerm: "3 Months Minimum",
      slaResponse: "4 Hours (P1 Critical)",
      colorClass: "border-slate-300 dark:border-slate-800 bg-slate-500/5 hover:border-slate-400",
      lucideIcon: Shield,
      features: [
        "Remote Helpdesk Support (8am-5pm AST)",
        "Automated Security & OS Patch Management",
        "Core Endpoint Antivirus Protection",
        "Basic Software License Tracking",
        "Monthly System Integrity Reports",
        "Saint Lucia On-Site Dispatch (Out-of-scope rates)"
      ]
    },
    {
      id: "professional",
      name: "Professional Managed",
      badge: "Recommended Choice",
      description: "Comprehensive managed IT support with proactive monitoring, layered security controls, backup management, and priority SLA.",
      xcdPricePerUser: 220,
      minTerm: "6 Months Minimum",
      slaResponse: "2 Hours (P1 Critical)",
      colorClass: "border-indigo-500 dark:border-indigo-600/60 bg-indigo-500/5 hover:border-indigo-400 shadow-indigo-500/10 shadow-lg",
      lucideIcon: Flame,
      features: [
        "Everything in Essential Care Plus:",
        "Proactive Remote Monitoring & Management (RMM)",
        "Daily Controlled Cloud Backup Verification",
        "Multi-Factor Authentication (MFA) Enforcement",
        "Endpoint Detection & Response (EDR) upgrade",
        "SME Cybersecurity Awareness Training",
        "Priority Support Matrix (Escalated Dispatch)"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise Partner",
      badge: "Full vCIO & Strategy",
      description: "A complete dedicated outsourced IT partnership. Includes security compliance audits, inventory management, and strategic advisory.",
      xcdPricePerUser: 450,
      minTerm: "12 Months Minimum",
      slaResponse: "30 Minutes (P1 Critical)",
      colorClass: "border-violet-500/80 dark:border-violet-600/70 bg-violet-500/5 hover:border-violet-400",
      lucideIcon: Award,
      features: [
        "Everything in Professional Managed Plus:",
        "Designated Senior Primary Systems Engineer",
        "Quarterly Strategic vCIO Infrastructure Reviews",
        "Advanced SOC Managed Threat Detection",
        "Uncapped SLA & Service Uptime Credits",
        "Caribbean Jurisdictional Compliance Audits",
        "Full ICT Inventory & Asset Lifecycle Management"
      ]
    }
  ];

  // Helper pricing conversion calculations
  const getDisplayPrice = (xcdAmount: number) => {
    if (currency === "USD") {
      return `USD ${(xcdAmount / XCD_TO_USD_PEG).toFixed(2)}`;
    }
    return `EC$ ${xcdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Estimator Calculations
  const estimateBreakdowns = useMemo(() => {
    const baseRate = estimatorTier === "essential" 
      ? tierPricing.essential.xcd 
      : estimatorTier === "professional" 
        ? tierPricing.professional.xcd 
        : tierPricing.enterprise.xcd;
    
    const baseTotalXcd = baseRate * userCount;
    
    // Add-on components
    let backupTotalXcd = 0;
    if (includeBackupAddon) {
      // EC$ 95 / month per 100 GB
      backupTotalXcd = Math.ceil(backupStorageGb / 100) * 95;
    }

    let mfaTotalXcd = 0;
    if (includeMfaAddon) {
      // Flat setup of EC$ 35 per user / month
      mfaTotalXcd = userCount * 35;
    }

    let complianceTotalXcd = 0;
    if (includeComplianceAddon) {
      // EC$ 180 / Month flat audit retainer
      complianceTotalXcd = 180;
    }

    const subtotalXcd = baseTotalXcd + backupTotalXcd + mfaTotalXcd + complianceTotalXcd;
    const vatRate = 0.125; // Saint Lucia standard 12.5% VAT
    const vatXcd = includeVat ? subtotalXcd * vatRate : 0;
    const grandTotalXcd = subtotalXcd + vatXcd;

    return {
      baseRate,
      baseTotalXcd,
      backupTotalXcd,
      mfaTotalXcd,
      complianceTotalXcd,
      subtotalXcd,
      vatXcd,
      grandTotalXcd
    };
  }, [estimatorTier, userCount, includeBackupAddon, backupStorageGb, includeMfaAddon, includeComplianceAddon, includeVat]);

  // Break-Fix calculations
  const hourlyEstimate = useMemo(() => {
    // EC$ 150/hr Standard, EC$ 250/hr Emergency
    const hourlyRateXcd = calcRateType === "standard" ? 150 : 250;
    const subtotalXcd = hourlyRateXcd * calcHours;
    const vatXcd = includeVat ? subtotalXcd * 0.125 : 0;
    const grandTotalXcd = subtotalXcd + vatXcd;

    return {
      hourlyRateXcd,
      subtotalXcd,
      vatXcd,
      grandTotalXcd
    };
  }, [calcHours, calcRateType, includeVat]);

  return (
    <div id="services-pricing-layout" className="w-full flex flex-col min-h-screen text-app-text antialiased">
      
      {/* HEADER SECTION STICKY */}
      <div className="flex items-center justify-between border-b border-app-border bg-app-aside-bg/30 p-4 sticky top-0 backdrop-blur-md z-40">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono font-medium hover:text-indigo-400 text-app-text-sec transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Main Marketplace
        </button>
        <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono tracking-wider px-2.5 py-0.5 rounded-full uppercase">
          Service Catalogue Hub
        </span>
      </div>

      {/* MIDNIGHT CARIBBEAN BRAND HERO */}
      <div className="bg-gradient-to-r from-zinc-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-12 border-b border-app-border flex flex-col gap-4 relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_40%)]" />
        
        <div className="max-w-4xl relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-indigo-500 text-white font-extrabold uppercase px-2.5 py-0.5 rounded tracking-wide">
              Official Fire Lion Catalogs
            </span>
            <span className="text-zinc-400 text-xs font-mono select-none">|</span>
            <span className="text-[10px] text-zinc-300 font-mono">Saint Lucia Registry Registration Compliance</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white font-display">
            ICT Managed Services & Pricing List
          </h1>
          
          <p className="text-sm sm:text-base text-zinc-300 font-light max-w-3xl leading-relaxed">
            Engineered specifically to support SMEs in the Caribbean. Transparent pricing models in Eastern Caribbean Dollars (XCD) with exact fixed-peg USD conversion. Every tier guarantees professional SLA management, regional data sovereignty compliance, and secure digital defense.
          </p>

          {/* MASTER TOGGLES */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            {/* Currency convert switcher */}
            <div className="flex items-center p-0.5 rounded-xl border border-zinc-800 bg-zinc-900/90 shadow-md">
              <button
                onClick={() => setCurrency("XCD")}
                className={`px-4 py-2 text-xs font-mono rounded-lg transition-all cursor-pointer ${currency === "XCD" ? "bg-indigo-600 text-white font-bold" : "text-zinc-400"}`}
              >
                XCD (Eastern Caribbean peg)
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-4 py-2 text-xs font-mono rounded-lg transition-all cursor-pointer ${currency === "USD" ? "bg-indigo-600 text-white font-bold" : "text-zinc-400"}`}
              >
                USD Equivalent (2.70:1)
              </button>
            </div>

            {/* VAT control */}
            <button
              onClick={() => setIncludeVat(!includeVat)}
              className={`px-4 py-2 text-xs rounded-xl border font-mono transition duration-200 cursor-pointer flex items-center gap-2 ${includeVat ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold" : "border-zinc-800 bg-zinc-900 text-zinc-400"}`}
            >
              <span className={`w-2 h-2 rounded-full ${includeVat ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`}></span>
              Saint Lucia VAT (12.5%) : {includeVat ? "Included" : "Excluded"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-12">
        
        {/* SECTION 1: THE THREE STRYPES SIZES TIERS */}
        <div className="space-y-6">
          <div className="text-center sm:text-left space-y-1.5">
            <h2 className="text-2xl font-bold font-display tracking-tight">1. Managed Service Retainer Tiers</h2>
            <p className="text-sm text-app-text-sec max-w-2xl font-light">
              Proactive maintenance contracts structured monthly to minimize systems downtime.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {serviceTiers.map((tier) => {
              const Icon = tier.lucideIcon;
              const isRecommended = tier.id === "professional";
              return (
                <div 
                  key={tier.id}
                  className={`p-6 sm:p-8 rounded-2xl border flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${tier.colorClass} ${
                    isRecommended ? "ring-2 ring-indigo-500/50" : ""
                  }`}
                >
                  {isRecommended && (
                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-mono tracking-wider font-extrabold px-3 py-1 uppercase rounded-bl-xl shadow flex items-center gap-1">
                      <Flame className="w-3" /> Recommended
                    </div>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-app-btn-sec/30 flex items-center justify-center text-app-text">
                        <Icon className="w-6 h-6 stroke-[1.8]" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-indigo-500 uppercase font-bold tracking-wider">{tier.badge}</span>
                        <h3 className="text-xl font-bold font-display text-app-text mt-0.5">{tier.name}</h3>
                      </div>
                    </div>

                    <p className="text-xs text-app-text-sec font-light leading-relaxed min-h-[50px]">
                      {tier.description}
                    </p>

                    <div className="space-y-1 py-4 border-y border-app-border/40 font-mono">
                      <div className="text-3xl font-extrabold text-app-text">
                        {getDisplayPrice(tier.xcdPricePerUser)}
                        <span className="text-xs font-normal text-app-text-muted">/user/mo</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] pt-1 text-app-text-muted">
                        <span>Contract terms:</span>
                        <span className="font-semibold text-app-text">{tier.minTerm}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-app-text-muted">
                        <span>P1 SLA response:</span>
                        <span className="font-semibold text-indigo-400">{tier.slaResponse}</span>
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-mono uppercase text-app-text-muted tracking-wider">Features Included</p>
                      <ul className="space-y-2 text-xs">
                        {tier.features.map((feat, i) => {
                          const isHeading = feat.includes("Care Plus") || feat.includes("Managed Plus");
                          return (
                            <li key={i} className={`flex items-start gap-2.5 ${isHeading ? "font-bold text-indigo-400 pt-1" : "text-app-text-sec"}`}>
                              {isHeading ? (
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/20 shrink-0 mt-1" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              )}
                              <span>{feat}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-app-border/20">
                    <button
                      onClick={() => {
                        setEstimatorTier(tier.id as any);
                        const calculatorTarget = document.getElementById("interactive-estimator");
                        if (calculatorTarget) {
                          calculatorTarget.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="w-full py-2.5 bg-app-btn-sec border border-app-border text-app-text hover:bg-app-btn-sec/80 text-xs rounded-xl font-mono transition duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Select For Estimator <Calculator className="w-3.5 h-3.5 text-indigo-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: AD-HOC HOURLY AND PROJECT SERVICES */}
        <div id="project-break-fix" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-2">
          
          {/* HOURLY & PROJECT EXPLAINER */}
          <div className="p-6 sm:p-8 rounded-2xl border border-app-border bg-app-aside-bg/15 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1 px-2 text-[9px] font-mono uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md font-bold">Project Services Catalog</span>
                <span className="text-[10px] text-app-text-muted font-mono">Saint Lucia On-Site & Remote dispatch</span>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold font-dislay tracking-tight">Project Work & Out-of-Scope Rates</h2>
              <p className="text-xs text-app-text-sec leading-relaxed font-light">
                For non-retaining clients or massive scale-out procedures like full hybrid-cloud active directory migrations, workspace transitions, and localized network deployments.
              </p>

              <div className="space-y-3.5 divide-y divide-app-border/30 pt-2 text-xs">
                {/* Out of scope item 1 */}
                <div className="flex justify-between items-center py-2.5">
                  <div className="space-y-0.5 pr-4">
                    <p className="font-bold text-app-text">Standard Break-Fix Hourly Rate</p>
                    <p className="text-[10px] text-app-text-muted font-normal leading-relaxed">General troubleshooting within normal business hours (8am–5pm AST weekdays).</p>
                  </div>
                  <span className="font-mono font-bold text-app-text shrink-0">{getDisplayPrice(150)}/hr</span>
                </div>

                {/* Out of scope item 2 */}
                <div className="flex justify-between items-center py-2.5">
                  <div className="space-y-0.5 pr-4">
                    <p className="font-bold text-app-text">Emergency Weekend & Holiday Rate</p>
                    <p className="text-[10px] text-app-text-muted font-normal leading-relaxed">Urgent out-of-hours technician onsite/remote response requirements.</p>
                  </div>
                  <span className="font-mono font-bold text-amber-500 shrink-0">{getDisplayPrice(250)}/hr</span>
                </div>

                {/* Out of scope item 3 */}
                <div className="flex justify-between items-center py-2.5">
                  <div className="space-y-0.5 pr-4">
                    <p className="font-bold text-app-text">Add-on Services: Storage / GB Backup</p>
                    <p className="text-[10px] text-app-text-muted font-normal leading-relaxed">Daily robust managed cloud backups storage blocks.</p>
                  </div>
                  <span className="font-mono font-bold text-app-text shrink-0">{getDisplayPrice(95)}/mo per 100GB</span>
                </div>

                {/* Out of scope item 4 */}
                <div className="flex justify-between items-center py-2.5">
                  <div className="space-y-0.5 pr-4">
                    <p className="font-bold text-app-text">Saint Lucia TIN/NIC Jurisdictional GDPR Audit</p>
                    <p className="text-[10px] text-app-text-muted font-normal leading-relaxed">Comprehensive review aligning SME operations with local data compliance regimes.</p>
                  </div>
                  <span className="font-mono font-bold text-indigo-400 shrink-0">Flat {getDisplayPrice(1800)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-app-border/40 pt-5 space-y-1 bg-zinc-950/20 p-4 rounded-xl border border-app-border/50">
              <span className="text-[9px] font-mono uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded w-max select-none block font-extrabold tracking-wider">
                Note on invoicing currency
              </span>
              <p className="text-[10px] text-app-text-sec leading-snug">
                Saint Lucian clients are standard billed in Eastern Caribbean Dollars (XCD). Regional partners can mandate USD. Invoices default to a 14-day payment grace term.
              </p>
            </div>
          </div>

          {/* DYNAMIC ACCORDION HOURLY INTERACTIVE CALCULATOR */}
          <div className="p-6 sm:p-8 rounded-2xl border border-dashed border-app-border bg-app-aside-bg/5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-mono uppercase text-app-text-muted font-semibold tracking-wide">Dynamic Dispatch Calculator</span>
              </div>

              <h2 className="text-xl font-bold font-display">Ad-Hoc Hourly Job Estimator</h2>
              <p className="text-xs text-app-text-sec font-light">
                Select your required troubleshooting hours and rates to estimate in-scope dispatch bounds.
              </p>

              <div className="space-y-4 pt-2">
                {/* Hours Slider Input */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-app-text-sec uppercase">Troubleshooting Duration:</span>
                    <span className="font-extrabold text-app-text">{calcHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={40}
                    value={calcHours}
                    onChange={(e) => setCalcHours(Number(e.target.value))}
                    className="w-full h-1.5 bg-app-btn-sec border border-app-border rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between text-[9px] text-app-text-muted font-mono">
                    <span>1 hr</span>
                    <span>10 hrs</span>
                    <span>20 hrs</span>
                    <span>30 hrs</span>
                    <span>40 hrs (Full week)</span>
                  </div>
                </div>

                {/* Rate type selection buttons */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-app-text-sec block">Response Category rate</label>
                  <div className="grid grid-cols-2 gap-3.5">
                    <button
                      onClick={() => setCalcRateType("standard")}
                      className={`py-3 px-4 border rounded-xl text-xs font-mono transition duration-300 cursor-pointer flex flex-col items-center justify-center gap-1 leading-none ${
                        calcRateType === "standard" 
                          ? "bg-indigo-600 border-indigo-500 text-white font-bold" 
                          : "bg-app-btn-sec border-app-border text-app-text hover:bg-app-btn-sec/70"
                      }`}
                    >
                      <span>Standard Hours</span>
                      <span className="text-[9px] opacity-75 font-normal mt-0.5">{getDisplayPrice(150)}/hr</span>
                    </button>

                    <button
                      onClick={() => setCalcRateType("emergency")}
                      className={`py-3 px-4 border rounded-xl text-xs font-mono transition duration-300 cursor-pointer flex flex-col items-center justify-center gap-1 leading-none ${
                        calcRateType === "emergency" 
                          ? "bg-amber-600 border-amber-500 text-white font-bold" 
                          : "bg-app-btn-sec border-app-border text-app-text hover:bg-app-btn-sec/70"
                      }`}
                    >
                      <span>Emergency Work</span>
                      <span className="text-[9px] opacity-75 font-normal mt-0.5">{getDisplayPrice(250)}/hr</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Estimator output */}
            <div className="border border-app-border bg-app-btn-sec/15 p-4 rounded-xl mt-6 space-y-3 font-mono">
              <span className="text-[9px] font-mono text-app-text-muted uppercase">Dispatch Cost Summary</span>
              <div className="space-y-1.5 text-xs text-app-text-sec pt-1">
                <div className="flex justify-between">
                  <span>Ad-hoc Base hourly total:</span>
                  <span className="text-app-text font-bold">{getDisplayPrice(hourlyEstimate.subtotalXcd)}</span>
                </div>
                {includeVat && (
                  <div className="flex justify-between text-[10px] text-emerald-400">
                    <span>12.5% St. Lucia VAT:</span>
                    <span>+{getDisplayPrice(hourlyEstimate.vatXcd)}</span>
                  </div>
                )}
                <div className="border-t border-app-border/40 my-2 pt-2 flex justify-between text-base font-extrabold text-app-text leading-none">
                  <span>Grand Estimate:</span>
                  <span className="text-indigo-400">{getDisplayPrice(hourlyEstimate.grandTotalXcd)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 3: INTERACTIVE CONTRACT ESTIMATOR BUILDER */}
        <div id="interactive-estimator" className="bg-app-aside-bg/40 border border-indigo-500/20 p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-violet-500" />
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Fire Lion Interactive Calculator</span>
              <h2 className="text-xl sm:text-2xl font-bold font-display mt-0.5">Custom Retainer Plan Architect</h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-app-text-sec max-w-3xl leading-relaxed">
            Architect your ideal ICT support package. Select your operations base tier, input your company's active device/user count, and select custom SLA add-ons below for real-time itemized contract estimates.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            
            {/* LEFT INPUT CONTROLS Column - 7/12 */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Selector 1: Tier Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-app-text-sec block">Base Plan operations Tier</label>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {(["essential", "professional", "enterprise"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setEstimatorTier(t)}
                      className={`p-3 border rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer text-center leading-tight ${
                        estimatorTier === t 
                          ? "bg-indigo-600 border-indigo-500 text-white font-bold shadow-md scale-102" 
                          : "bg-app-btn-sec/50 border-app-border text-app-text hover:bg-app-btn-sec hover:border-app-text/30"
                      }`}
                    >
                      <span className="block truncate capitalize">{t}</span>
                      <span className="block text-[10px] opacity-75 font-normal mt-1">
                        {currency === "USD" 
                          ? `$${(tierPricing[t].xcd / XCD_TO_USD_PEG).toFixed(0)}` 
                          : `EC$ ${tierPricing[t].xcd}`
                        }/mo
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selector 2: User count */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-app-text-sec uppercase">SME Endpoint / User count:</span>
                  <span className="font-extrabold text-app-text">{userCount} Active Users</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={150}
                  step={5}
                  value={userCount}
                  onChange={(e) => setUserCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-app-btn-sec border border-app-border rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[9px] text-app-text-muted font-mono">
                  <span>5 Staff Members</span>
                  <span>50 Users</span>
                  <span>100 Users</span>
                  <span>150 (Enterprise Cap)</span>
                </div>
              </div>

              {/* Selector 3: Interactive additions Toggles */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-mono uppercase text-app-text-sec block">Custom SLA Retainer Additions</label>
                
                <div className="space-y-2.5">
                  {/* Backup verification add-on */}
                  <div className="p-3.5 rounded-xl border border-app-border bg-app-btn-sec/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        id="addon-backup"
                        checked={includeBackupAddon} 
                        onChange={(e) => setIncludeBackupAddon(e.target.checked)}
                        className="w-4 h-4 rounded border-app-border text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <label htmlFor="addon-backup" className="text-xs font-bold text-app-text cursor-pointer select-none">Daily Managed Hybrid Backup Storage</label>
                        <p className="text-[10px] text-app-text-muted leading-relaxed">Secure data snapshots verifying continuous redundancy blocks.</p>
                      </div>
                    </div>
                    
                    {includeBackupAddon && (
                      <div className="flex items-center gap-2 font-mono ml-7 sm:ml-0">
                        <span className="text-[10px] text-app-text-sec">Limit:</span>
                        <div className="flex items-center gap-1.5 border border-app-border bg-app-bg px-1.5 py-0.5 rounded">
                          {[100, 250, 500, 1000].map((gb) => (
                            <button
                              key={gb}
                              onClick={() => setBackupStorageGb(gb)}
                              className={`px-1 text-[9px] rounded font-bold cursor-pointer transition ${backupStorageGb === gb ? "bg-indigo-600 text-white" : "text-app-text-muted hover:text-app-text"}`}
                            >
                              {gb >= 1000 ? "1TB" : `${gb}GB`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MFA setup */}
                  <div className="p-3.5 rounded-xl border border-app-border bg-app-btn-sec/10 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        id="addon-mfa"
                        checked={includeMfaAddon} 
                        onChange={(e) => setIncludeMfaAddon(e.target.checked)}
                        className="w-4 h-4 rounded border-app-border text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <label htmlFor="addon-mfa" className="text-xs font-bold text-app-text cursor-pointer select-none">MFA Setup & Maintenance Protocol</label>
                        <p className="text-[10px] text-app-text-muted leading-relaxed">Continuous hardware key verification and remote lock bypass.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-app-text-sec shrink-0">{getDisplayPrice(35)}/user</span>
                  </div>

                  {/* Caribbean Compliance retention check */}
                  <div className="p-3.5 rounded-xl border border-app-border bg-app-btn-sec/10 flex items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <input 
                        type="checkbox" 
                        id="addon-compliance"
                        checked={includeComplianceAddon} 
                        onChange={(e) => setIncludeComplianceAddon(e.target.checked)}
                        className="w-4 h-4 rounded border-app-border text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer"
                      />
                      <div className="space-y-0.5">
                        <label htmlFor="addon-compliance" className="text-xs font-bold text-app-text cursor-pointer select-none">CARICOM GDPR / Local Compliance Audits</label>
                        <p className="text-[10px] text-app-text-muted leading-relaxed">Bi-monthly security logging matches to regional Caribbean privacy laws.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-app-text-sec shrink-0">{getDisplayPrice(180)}/mo</span>
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT SUMMARY ESTIMATE Column - 5/12 */}
            <div className="lg:col-span-5 flex-1 flex flex-col justify-between">
              <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950/40 border border-indigo-500/25 space-y-4">
                <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded block w-max select-none">
                  Estimate Recapitulation
                </span>

                <div className="space-y-3.5 divide-y divide-app-border/30 text-xs font-mono pt-1 text-app-text-sec">
                  {/* Base plan estimate row */}
                  <div className="flex justify-between py-1 border-transparent">
                    <span className="text-app-text-muted capitalize">{estimatorTier} Plan ({userCount} staff):</span>
                    <span className="text-app-text font-bold">{getDisplayPrice(estimateBreakdowns.baseTotalXcd)}</span>
                  </div>

                  {/* Backup cost row */}
                  {includeBackupAddon && (
                    <div className="flex justify-between py-2 pt-2 border-app-border/20">
                      <span className="text-app-text-muted">Backup storage ({backupStorageGb}GB):</span>
                      <span className="text-app-text">{getDisplayPrice(estimateBreakdowns.backupTotalXcd)}</span>
                    </div>
                  )}

                  {/* MFA setup row */}
                  {includeMfaAddon && (
                    <div className="flex justify-between py-2 border-app-border/20">
                      <span className="text-app-text-muted">MFA support setup ({userCount} staff):</span>
                      <span className="text-app-text">{getDisplayPrice(estimateBreakdowns.mfaTotalXcd)}</span>
                    </div>
                  )}

                  {/* Compliance audit row */}
                  {includeComplianceAddon && (
                    <div className="flex justify-between py-2 border-app-border/20">
                      <span className="text-app-text-muted">CARICOM Law Auditing retainer:</span>
                      <span className="text-app-text">{getDisplayPrice(estimateBreakdowns.complianceTotalXcd)}</span>
                    </div>
                  )}

                  {/* Subtotal row */}
                  <div className="flex justify-between py-2 pt-2 border-app-border/20 text-xs font-bold font-mono">
                    <span className="text-app-text-sec text-[10px] uppercase">Plan Net Subtotal:</span>
                    <span className="text-app-text">{getDisplayPrice(estimateBreakdowns.subtotalXcd)}</span>
                  </div>

                  {/* VAT row */}
                  {includeVat && (
                    <div className="flex justify-between py-2 border-app-border/20 text-emerald-400 font-bold">
                      <span className="text-[10px] uppercase">12.5% Saint Lucia VAT:</span>
                      <span>+{getDisplayPrice(estimateBreakdowns.vatXcd)}</span>
                    </div>
                  )}

                  {/* Contract Term info row */}
                  <div className="flex justify-between py-2 border-app-border/20 text-[10px]">
                    <span className="text-app-text-muted">Contract commitment term:</span>
                    <span className="font-extrabold text-amber-500 uppercase">
                      {estimatorTier === "essential" ? "3 Months" : estimatorTier === "professional" ? "6 Months" : "12 Months"}
                    </span>
                  </div>

                  {/* Grand total large scale block */}
                  <div className="border-t-2 border-indigo-500/30 pt-4 flex flex-col gap-1 text-center border-dashed">
                    <span className="text-[10px] text-app-text-muted uppercase">Estimated monthly rate</span>
                    <span className="text-3xl font-extrabold text-indigo-400 tracking-tight leading-none py-1 block">
                      {getDisplayPrice(estimateBreakdowns.grandTotalXcd)}
                    </span>
                    <p className="text-[9px] text-app-text-muted leading-tight font-normal pt-1 italic">
                      Estimate created automatically in reference. Final pricing can vary based on custom network switches scan count.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-start gap-2.5 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10 mt-4">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-app-text-sec leading-normal font-mono">
                  <strong>Standard SLA escalation criteria is applied.</strong> Emergency response is capped under Saint Lucian registered business operating parameters. Contact sales desk directly to activate SLA contracts.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 4: DETAILED RESPONSIVE SLA TARGET MATRIX TABLE */}
        <div className="border border-app-border rounded-2xl bg-app-aside-bg/15 overflow-hidden">
          <button
            onClick={() => setShowSlaMatrix(!showSlaMatrix)}
            className="w-full flex items-center justify-between p-4 bg-app-btn-sec/20 hover:bg-app-btn-sec/30 text-left text-sm font-semibold transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span className="font-display font-bold">4. SLA Priority Matrix & Response/Resolution Target SLA schedules</span>
            </div>
            {showSlaMatrix ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showSlaMatrix && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 sm:p-6 border-t border-app-border space-y-4">
                  <p className="text-xs text-app-text-sec leading-relaxed">
                    Response and resolution clocks start the instant a support ticket is entered in our portal. Clock pauses for delays resulting from client site-access restrictions.
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-app-border">
                    <table className="w-full text-xs text-left text-app-text-sec divide-y divide-app-border">
                      <thead className="text-[10px] font-mono uppercase bg-app-btn-sec/30 text-app-text-muted">
                        <tr>
                          <th className="px-4 py-3">Priority Level</th>
                          <th className="px-4 py-3">Criticality Description</th>
                          <th className="px-4 py-3">Essential Care Target</th>
                          <th className="px-4 py-3">Professional Managed Target</th>
                          <th className="px-4 py-3">Enterprise Partner Target</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-app-border/40 font-mono">
                        <tr>
                          <td className="px-4 py-3.5 font-bold text-red-500">P1 - Critical</td>
                          <td className="px-4 py-3.5">Core server outage, whole office offline, severe business blockade.</td>
                          <td className="px-4 py-3.5">4 hrs response<br/><span className="text-[10px] text-app-text-muted">12 hrs resolution</span></td>
                          <td className="px-4 py-3.5 text-indigo-400 font-semibold">2 hrs response<br/><span className="text-[10px] text-app-text-muted">6 hrs resolution</span></td>
                          <td className="px-4 py-3.5 text-emerald-400 font-bold">30 mins response<br/><span className="text-[10px] text-app-text-muted font-normal">2 hrs resolution</span></td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3.5 font-bold text-amber-500">P2 - High</td>
                          <td className="px-4 py-3.5">Key software module failed, workarounds exist but severely degraded.</td>
                          <td className="px-4 py-3.5">8 hrs response<br/><span className="text-[10px] text-app-text-muted">24 hrs resolution</span></td>
                          <td className="px-4 py-3.5">4 hrs response<br/><span className="text-[10px] text-app-text-muted">12 hrs resolution</span></td>
                          <td className="px-4 py-3.5">1 hr response<br/><span className="text-[10px] text-app-text-muted">4 hrs resolution</span></td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3.5 font-bold text-blue-400">P3 - Medium</td>
                          <td className="px-4 py-3.5">Single user client terminal down, software feature fails.</td>
                          <td className="px-4 py-3.5">24 hrs response<br/><span className="text-[10px] text-app-text-muted">2 days resolution</span></td>
                          <td className="px-4 py-3.5">8 hrs response<br/><span className="text-[10px] text-app-text-muted">24 hrs resolution</span></td>
                          <td className="px-4 py-3.5">4 hrs response<br/><span className="text-[10px] text-app-text-muted">8 hrs resolution</span></td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3.5 font-bold text-slate-400">P4 - Low</td>
                          <td className="px-4 py-3.5">Information request, credentials change, minor aesthetic tweaks.</td>
                          <td className="px-4 py-3.5">48 hrs response<br/><span className="text-[10px] text-app-text-muted">5 days resolution</span></td>
                          <td className="px-4 py-3.5">24 hrs response<br/><span className="text-[10px] text-app-text-muted">3 days resolution</span></td>
                          <td className="px-4 py-3.5">8 hrs response<br/><span className="text-[10px] text-app-text-muted">24 hrs resolution</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-2 p-3 bg-red-500/5 rounded-xl border border-red-500/10 text-[10px] leading-relaxed text-app-text-muted font-mono">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>SLA credits rule:</strong> Failure to hit response targets for P1 Critical incidents triggers formal service credits (typically 2% of the monthly retainer tier per hour elapsed past SLA deadline, capped at 15% cumulative maximum per contract invoice).
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SECTION 5: SAAS APPLICATIONS LICENSING & HOSTING PRICING STRUCTURE */}
        <div className="bg-app-aside-bg/40 border border-emerald-500/20 p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-indigo-500" />
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">Product Deployment & Hosting</span>
              <h2 className="text-xl sm:text-2xl font-bold font-display mt-0.5">SaaS Applications Pricing Structure</h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-app-text-sec max-w-3xl leading-relaxed">
            We provide comprehensive design, hosting, and SLA maintenance tiers for our proprietary custom-built SaaS applications. Select your desired deployment model below to understand continuous licensing boundaries.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* TIER 1: WEB APPS */}
            <div className="border border-app-border rounded-xl p-5 bg-app-btn-sec/10 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-[9px] font-mono uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 w-max block">
                  Web Platforms
                </span>
                <h3 className="font-bold text-base text-app-text font-display">SaaS Web Service</h3>
                <p className="text-xs text-app-text-muted leading-relaxed">
                  Centrally hosted responsive dashboards, database sync setups, dynamic API integrations, and secure SSL.
                </p>
                
                <div className="pt-2 divide-y divide-app-border/35 text-[11px] text-app-text-sec space-y-2">
                  <div className="flex justify-between py-1 border-transparent">
                    <span className="font-mono">Starter Tier</span>
                    <span className="font-bold text-app-text">{currency === "USD" ? "USD 29.00/mo" : "EC$ 80.00/mo"}</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 border-app-border/20">
                    <span className="font-mono">Growth Tier</span>
                    <span className="font-bold text-indigo-400">{currency === "USD" ? "USD 69.00/mo" : "EC$ 185.00/mo"}</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 border-app-border/20">
                    <span className="font-mono">Enterprise Node</span>
                    <span className="font-bold text-app-text">{currency === "USD" ? "USD 199.00/mo" : "EC$ 540.00/mo"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-app-border/30">
                <span className="text-[10px] font-mono text-app-text-muted block font-semibold uppercase">Included SLA Features:</span>
                <ul className="text-[10px] text-app-text-sec space-y-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3" />
                    <span>Dual DNS custom domains</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3" />
                    <span>Daily data snapshots</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3" />
                    <span>99.9% Uptime availability</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* TIER 2: DESKTOP APPS */}
            <div className="border border-indigo-500/25 rounded-xl p-5 bg-indigo-500/[0.02] flex flex-col justify-between space-y-4 shadow-lg shadow-indigo-500/5">
              <div className="space-y-3">
                <span className="text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 w-max block">
                  Desktop Binaries
                </span>
                <h3 className="font-bold text-base text-app-text font-display">Client-Seat Installer</h3>
                <p className="text-xs text-app-text-muted leading-relaxed">
                  Cross-compiled client executable binaries built for macOS, Windows, and Linux. No persistent cloud cost.
                </p>
                
                <div className="pt-2 divide-y divide-app-border/35 text-[11px] text-app-text-sec space-y-2">
                  <div className="flex justify-between py-1 border-transparent">
                    <span className="font-mono">Single Seat License</span>
                    <span className="font-bold text-app-text">{currency === "USD" ? "USD 49.00 one-off" : "EC$ 130.00 one-off"}</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 border-app-border/20">
                    <span className="font-mono">Team License (10 pack)</span>
                    <span className="font-bold text-indigo-400">{currency === "USD" ? "USD 349.00 one-off" : "EC$ 940.00 one-off"}</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 border-app-border/20">
                    <span className="font-mono">Site-Wide Access</span>
                    <span className="font-bold text-app-text">{currency === "USD" ? "USD 899.00 / yr" : "EC$ 2,425.00 / yr"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-app-border/30">
                <span className="text-[10px] font-mono text-app-text-muted block font-semibold uppercase">Included SLA Features:</span>
                <ul className="text-[10px] text-app-text-sec space-y-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3" />
                    <span>Offline-first database operations</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3" />
                    <span>Secure auto-update updater portal</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3" />
                    <span>Dedicated support helpdesk link</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* TIER 3: GAMES/INTERACTIVE */}
            <div className="border border-app-border rounded-xl p-5 bg-app-btn-sec/10 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-[9px] font-mono uppercase bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 w-max block">
                  Interactive Games
                </span>
                <h3 className="font-bold text-base text-app-text font-display">Virtual Experiences</h3>
                <p className="text-xs text-app-text-muted leading-relaxed">
                  Multiplayer HTML5 canvas systems, immersive training simulations, and high-performance low-latency modules.
                </p>
                
                <div className="pt-2 divide-y divide-app-border/35 text-[11px] text-app-text-sec space-y-2">
                  <div className="flex justify-between py-1 border-transparent">
                    <span className="font-mono">Indie Play licence</span>
                    <span className="font-bold text-app-text">{currency === "USD" ? "USD 9.99 lifetime" : "EC$ 27.00 lifetime"}</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 border-app-border/20">
                    <span className="font-mono">Lobby Hosting addon</span>
                    <span className="font-bold text-indigo-400">{currency === "USD" ? "USD 15.00/mo" : "EC$ 40.00/mo"}</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 border-app-border/20">
                    <span className="font-mono">Corporate Team Buy</span>
                    <span className="font-bold text-app-text">Contact sales desk</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-app-border/30">
                <span className="text-[10px] font-mono text-app-text-muted block font-semibold uppercase">Included SLA Features:</span>
                <ul className="text-[10px] text-app-text-sec space-y-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3" />
                    <span>Low-latency Saint Lucia ping relays</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3" />
                    <span>Standard REST telemetry API access</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3" />
                    <span>Continuous game server backups</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
