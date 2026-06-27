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

  // Constants based on VISION79 MSP service catalogs
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
              Official <strong>VISION79</strong> Catalogs
            </span>
            <span className="text-zinc-400 text-xs font-mono select-none">|</span>
            <span className="text-[10px] text-zinc-300 font-mono">Saint Lucia Registry Registration Compliance</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white font-display">
            ICT Managed Services & Solutions
          </h1>
          
          <p className="text-sm sm:text-base text-zinc-300 font-light max-w-3xl leading-relaxed">
            Engineered specifically to support SMEs in Saint Lucia and the wider Caribbean. Every service tier guarantees professional SLA management, regional data sovereignty compliance, robust cloud backup integration, and proactive technical assistance tailored directly to your team's operational needs.
          </p>

          {/* CALL TO ACTION DIRECTIVES */}
          <div className="pt-4 flex flex-wrap items-center gap-4 relative z-10">
            <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1.5 rounded-lg font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Custom Quotes & Consultation Active
            </div>
            
            <a 
              href="tel:+17587260035"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-md flex items-center gap-2 border border-indigo-500"
            >
              📞 Call <strong>VISION79</strong>: 1 758 726 0035
            </a>

            <a 
              href="mailto:vision79slu@gmail.com"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-all cursor-pointer shadow-md flex items-center gap-2 border border-zinc-700"
            >
              ✉️ Email: vision79slu@gmail.com
            </a>
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

                    <div className="space-y-2 py-4 border-y border-app-border/40 font-sans">
                      <div className="text-sm font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-1 rounded w-max">
                        Custom Quoted Contract
                      </div>
                      <p className="text-[11px] text-app-text-sec leading-relaxed">
                        Pricing customized based on seat-count and SLA needs. Contact <strong>VISION79</strong> for a tailored quote.
                      </p>
                      <div className="flex items-center justify-between text-[10px] pt-1 text-app-text-muted font-mono">
                        <span>Contract terms:</span>
                        <span className="font-semibold text-app-text">{tier.minTerm}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-app-text-muted font-mono">
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

                  {/* Removed select for estimator buttons */}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: AD-HOC HOURLY AND PROJECT SERVICES */}
        <div id="project-break-fix" className="pt-2">
          
          {/* HOURLY & PROJECT EXPLAINER */}
          <div className="p-6 sm:p-8 rounded-2xl border border-app-border bg-app-aside-bg/15 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1 px-2 text-[9px] font-mono uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md font-bold font-semibold">Project Services Catalog</span>
                <span className="text-[10px] text-app-text-muted font-mono">Saint Lucia On-Site & Remote dispatch</span>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight">2. Project Work & Out-of-Scope Rates</h2>
              <p className="text-xs sm:text-sm text-app-text-sec leading-relaxed max-w-3xl">
                For non-retaining clients or massive scale-out procedures like full hybrid-cloud active directory migrations, workspace transitions, and localized network deployments.
              </p>

              <div className="space-y-3.5 divide-y divide-app-border/30 pt-2 text-xs">
                {/* Out of scope item 1 */}
                <div className="flex justify-between items-center py-2.5">
                  <div className="space-y-0.5 pr-4">
                    <p className="font-bold text-app-text">Standard Break-Fix Hourly Support</p>
                    <p className="text-[10px] text-app-text-muted font-normal leading-relaxed">General troubleshooting within normal business hours (8am–5pm AST weekdays).</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded shrink-0">Quote on Request</span>
                </div>

                {/* Out of scope item 2 */}
                <div className="flex justify-between items-center py-2.5">
                  <div className="space-y-0.5 pr-4">
                    <p className="font-bold text-app-text">Emergency Weekend & Holiday SLA Dispatch</p>
                    <p className="text-[10px] text-app-text-muted font-normal leading-relaxed">Urgent out-of-hours technician onsite/remote response requirements.</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded shrink-0">Call <strong>VISION79</strong> Directly</span>
                </div>

                {/* Out of scope item 3 */}
                <div className="flex justify-between items-center py-2.5">
                  <div className="space-y-0.5 pr-4">
                    <p className="font-bold text-app-text">Add-on Services: Storage / GB Cloud Backup</p>
                    <p className="text-[10px] text-app-text-muted font-normal leading-relaxed">Daily robust managed cloud backups storage blocks.</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded shrink-0">Custom Sizing Quote</span>
                </div>

                {/* Out of scope item 4 */}
                <div className="flex justify-between items-center py-2.5">
                  <div className="space-y-0.5 pr-4">
                    <p className="font-bold text-app-text">Saint Lucia TIN/NIC Jurisdictional GDPR Compliance Audit</p>
                    <p className="text-[10px] text-app-text-muted font-normal leading-relaxed">Comprehensive review aligning SME operations with local data compliance regimes.</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded shrink-0">Proposal Custom-Drafted</span>
                </div>
              </div>
            </div>

            {/* Note and currency guidance */}
            <div className="border-t border-app-border/40 pt-5 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-zinc-950/20 p-5 rounded-xl border border-app-border/50">
              <div className="space-y-1 max-w-xl">
                <span className="text-[9px] font-mono uppercase bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded w-max select-none block font-semibold tracking-wider">
                  Invoicing & Custom Engagements
                </span>
                <p className="text-[10px] text-app-text-sec leading-snug">
                  Saint Lucian clients are standard billed in Eastern Caribbean Dollars (XCD). Regional partners can mandate USD. Invoices default to a 14-day payment grace term.
                </p>
              </div>
              <div className="shrink-0 flex gap-2">
                <a href="tel:+17587260035" className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-4 py-2 rounded-lg cursor-pointer transition">
                  Call <strong>VISION79</strong>
                </a>
                <a href="mailto:vision79slu@gmail.com" className="bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] font-bold px-4 py-2 rounded-lg cursor-pointer transition border border-zinc-700">
                  Email
                </a>
              </div>
            </div>
          </div>

          {/* LARGE DIRECT CALL-TO-ACTION CARD FOR MARKETING ICT SERVICES */}
          <div className="bg-gradient-to-br from-indigo-950/50 via-slate-900/60 to-zinc-950 border-2 border-indigo-500/30 p-6 sm:p-10 rounded-2xl space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Coins className="w-48 h-48 text-indigo-400" />
            </div>
            <div className="max-w-3xl relative z-10 space-y-4">
              <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest font-extrabold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Direct Consultations Open
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                Secure, Resilient & Customized ICT Engineering for Your Business
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                At <strong>VISION79</strong>, we understand that off-the-shelf pricing models do not capture the actual operational realities of Saint Lucian and Caribbean SMEs. <strong>VISION79</strong> provides personalized, high-performance ICT setups, secure cloud backup nodes, and enterprise-grade SLA defense.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <a 
                  href="tel:+17587260035" 
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-400/50 hover:bg-white/[0.08] transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    <span className="text-sm">📞</span>
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider font-semibold">Call <strong>VISION79</strong></p>
                    <p className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-400 transition">1 758 726 0035</p>
                  </div>
                </a>

                <a 
                  href="mailto:vision79slu@gmail.com" 
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-400/50 hover:bg-white/[0.08] transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <span className="text-sm">✉️</span>
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider font-semibold">Email Inquiry</p>
                    <p className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-400 transition font-mono">vision79slu@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: DETAILED RESPONSIVE SLA TARGET MATRIX TABLE */}
        <div className="border border-app-border rounded-2xl bg-app-aside-bg/15 overflow-hidden">
          <button
            onClick={() => setShowSlaMatrix(!showSlaMatrix)}
            className="w-full flex items-center justify-between p-4 bg-app-btn-sec/20 hover:bg-app-btn-sec/30 text-left text-sm font-semibold transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span className="font-display font-bold">3. SLA Priority Matrix & Response/Resolution Target SLA schedules</span>
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
              <h2 className="text-xl sm:text-2xl font-bold font-display mt-0.5">3. SaaS Applications Licensing Structure</h2>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-app-text-sec max-w-3xl leading-relaxed">
            We provide comprehensive design, hosting, and SLA maintenance tiers for our proprietary custom-built SaaS applications. Select your desired deployment model below to understand continuous licensing boundaries. All solutions are custom budgeted based on volume.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* TIER 1: WEB APPS */}
            <div className="border border-app-border rounded-xl p-5 bg-app-btn-sec/10 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-[9px] font-mono uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 w-max block font-bold">
                  Web Platforms
                </span>
                <h3 className="font-bold text-base text-app-text font-display">SaaS Web Service</h3>
                <p className="text-xs text-app-text-muted leading-relaxed">
                  Centrally hosted responsive dashboards, database sync setups, dynamic API integrations, and secure SSL.
                </p>
                
                <div className="pt-2 divide-y divide-app-border/35 text-[11px] text-app-text-sec space-y-2">
                  <div className="flex justify-between py-1 border-transparent">
                    <span className="font-mono">Starter Tier</span>
                    <span className="font-bold text-indigo-400">Custom Quoted</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 border-app-border/20">
                    <span className="font-mono">Growth Tier</span>
                    <span className="font-bold text-indigo-400 font-semibold">Custom Quoted</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 border-app-border/20">
                    <span className="font-mono">Enterprise Node</span>
                    <span className="font-bold text-indigo-400">Custom Quoted</span>
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
                <span className="text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 w-max block font-bold">
                  Desktop Binaries
                </span>
                <h3 className="font-bold text-base text-app-text font-display">Client-Seat Installer</h3>
                <p className="text-xs text-app-text-muted leading-relaxed">
                  Cross-compiled client executable binaries built for macOS, Windows, and Linux. No persistent cloud cost.
                </p>
                
                <div className="pt-2 divide-y divide-app-border/35 text-[11px] text-app-text-sec space-y-2">
                  <div className="flex justify-between py-1 border-transparent">
                    <span className="font-mono">Single Seat License</span>
                    <span className="font-bold text-indigo-400 font-semibold">Custom Quoted</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 border-app-border/20">
                    <span className="font-mono">Team License (10 pack)</span>
                    <span className="font-bold text-indigo-400 font-semibold">Custom Quoted</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 border-app-border/20">
                    <span className="font-mono">Site-Wide Access</span>
                    <span className="font-bold text-indigo-400 font-semibold">Custom Quoted</span>
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
                <span className="text-[9px] font-mono uppercase bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 w-max block font-bold">
                  Interactive Games
                </span>
                <h3 className="font-bold text-base text-app-text font-display">Virtual Experiences</h3>
                <p className="text-xs text-app-text-muted leading-relaxed">
                  Multiplayer HTML5 canvas systems, immersive training simulations, and high-performance low-latency modules.
                </p>
                
                <div className="pt-2 divide-y divide-app-border/35 text-[11px] text-app-text-sec space-y-2">
                  <div className="flex justify-between py-1 border-transparent">
                    <span className="font-mono">Indie Play License</span>
                    <span className="font-bold text-indigo-400 font-semibold">Custom Quoted</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 border-app-border/20">
                    <span className="font-mono">Lobby Hosting Addon</span>
                    <span className="font-bold text-indigo-400 font-semibold">Custom Quoted</span>
                  </div>
                  <div className="flex justify-between py-1 pt-2 border-app-border/20">
                    <span className="font-mono">Corporate Team Buy</span>
                    <span className="font-bold text-indigo-400 font-semibold">Contact sales desk</span>
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
