import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, 
  Pause, 
  Volume2, 
  Lock, 
  CheckCircle2, 
  ArrowLeft, 
  Star, 
  BookOpen, 
  Clock, 
  Infinity, 
  CreditCard, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  MessageSquare, 
  Send, 
  Sparkles, 
  Code, 
  FileText,
  BadgeAlert
} from "lucide-react";
import { SaaSApp } from "../types";

interface CourseDetailPageProps {
  course: SaaSApp;
  onBack: () => void;
}

interface Lecture {
  id: string;
  title: string;
  duration: string;
  videoSimType: "intro" | "setup" | "deepdive" | "advanced";
  freePreview?: boolean;
}

interface Chapter {
  title: string;
  lectures: Lecture[];
}

export function CourseDetailPage({ course, onBack }: CourseDetailPageProps) {
  // Persistence state for course purchases
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  
  // Checking/resetting purchase state based on price/type
  const displayPrice = course.price !== undefined && course.price !== null ? Number(course.price) : 94.99;
  const isPaid = displayPrice > 0 || course.pricingType === "premium";

  useEffect(() => {
    if (!isPaid) {
      setIsEnrolled(true);
    } else {
      let stored = null;
      try {
        stored = localStorage.getItem(`vision79-enrolled-${course.id}`);
      } catch (e) {
        console.warn("Blocked accessing localStorage:", e);
      }
      if (stored === "true") {
        setIsEnrolled(true);
      }
    }
  }, [course.id, isPaid]);

  // Collapsible Chapters
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({
    0: true,
    1: false,
    2: false
  });

  // Active Info Tab: 'curriculum' | 'notes' | 'qa' | 'resources'
  const [activeTab, setActiveTab] = useState<"curriculum" | "notes" | "qa" | "resources">("curriculum");

  // Notes state
  const [studentNote, setStudentNote] = useState<string>(() => {
    try {
      return localStorage.getItem(`vision79-note-${course.id}`) || "";
    } catch (e) {
      console.warn("Blocked accessing localStorage:", e);
      return "";
    }
  });

  // QA State
  const [questions, setQuestions] = useState<Array<{ id: number; author: string; text: string; date: string; replies: Array<{ author: string; text: string; date: string; isInstructor?: boolean }> }>>([
    {
      id: 1,
      author: "Alex Rivers",
      text: "How do we handle environment secrets inside the sandbox middleware layer during hot-module swaps?",
      date: "2 hours ago",
      replies: [
        {
          author: course.instructor || "Expert Instructor",
          text: "Phenomenal question Alex! In production-grade apps, we never load secrets bare. It's recommended to mount them inside Node's process level context using lazy initialization to bypass hot swapper crashes.",
          date: "1 hour ago",
          isInstructor: true
        }
      ]
    },
    {
      id: 2,
      author: "Elena Petrova",
      text: "Does this course cover Zero-Copy buffer allocation schemas under low bandwidth latency simulations?",
      date: "Yesterday",
      replies: []
    }
  ]);
  const [newQuestionTxt, setNewQuestionTxt] = useState("");

  // Payment checkout states
  const [creditCardNum, setCreditCardNum] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  // Video media player simulated states
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [canvasModeText, setCanvasModeText] = useState("Hover play to stream secure masterclass canvas context...");

  const chapters: Chapter[] = [
    {
      title: "Block 1: Production Core Architecture Swaps & Setup",
      lectures: [
        { id: "1-1", title: "1. Core Framework Setup and Configuration Files", duration: "12:15", videoSimType: "intro", freePreview: true },
        { id: "1-2", title: "2. Structuring TypeScript Enums and Types Safely", duration: "18:40", videoSimType: "setup" },
        { id: "1-3", title: "3. Hot-Swapping Sandbox Server Port Inbound Channels", duration: "22:05", videoSimType: "setup" }
      ]
    },
    {
      title: "Block 2: High Concurrency State Engines & DB Mappings",
      lectures: [
        { id: "2-1", title: "4. SQLite schemas modeling & Dynamic Alter Migrations", duration: "32:10", videoSimType: "deepdive" },
        { id: "2-2", title: "5. Lazy-initializing SDK clients and handling failures", duration: "25:30", videoSimType: "deepdive" },
        { id: "2-3", title: "6. Handling CORS & OAuth flows inside Sandboxed iFrames", duration: "29:15", videoSimType: "deepdive" }
      ]
    },
    {
      title: "Block 3: Production Builds & Ingress Traffic Optimization",
      lectures: [
        { id: "3-1", title: "7. Compiling TypeScript output bundles via fast esbuild", duration: "44:00", videoSimType: "advanced" },
        { id: "3-2", title: "8. Deploying standalone Cloud Container ports safely", duration: "38:50", videoSimType: "advanced" }
      ]
    }
  ];

  // Set default initial active lecture
  useEffect(() => {
    if (!activeLecture) {
      setActiveLecture(chapters[0].lectures[0]);
    }
  }, [activeLecture]);

  // Video simulation animation logic
  useEffect(() => {
    let interval: any;
    if (isPlaying && activeLecture) {
      interval = setInterval(() => {
        setVideoProgress((v) => {
          if (v >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return v + (1.5 * playbackSpeed);
        });

        // Dynamic code simulator lines
        const lines = [
          "import { GoogleGenAI } from '@google/genai';",
          "const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });",
          "async function queryModel() { ... }",
          "const db = new sqliteModule.Database('./db.sqlite');",
          "app.listen(3000, '0.0.0.0', () => { console.log('Serving secure port') })",
          "ALTER TABLE saas_apps ADD COLUMN rating REAL DEFAULT 4.7;",
          "console.log('[SQLite Migrations] SUCCESSFUL!')",
          "localStorage.setItem('premium-access', JSON.stringify(enrolled));",
          "Refactoring categories to courses for Udemy layout sync..."
        ];
        const randomLine = lines[Math.floor(Math.random() * lines.length)];
        setCanvasModeText(`[STAMP: ${Math.floor(videoProgress)}%] -> ${randomLine}`);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeLecture, playbackSpeed, videoProgress]);

  const handleSelectLecture = (lec: Lecture) => {
    if (!isEnrolled && !lec.freePreview) {
      alert("This chapter is premium locked. Complete enrollment payment details on the right to access.");
      return;
    }
    setActiveLecture(lec);
    setVideoProgress(0);
    setIsPlaying(true);
  };

  const handleToggleChapter = (index: number) => {
    setExpandedChapters(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Submit payment handler
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayError(null);

    if (creditCardNum.length < 14 || cardExpiry.length < 4 || cardCvc.length < 3 || !cardName) {
      setPayError("Validation Alert: Please verify your 16-digit card number, expiry, and secure CVC.");
      return;
    }

    setIsPaying(true);

    // Simulate standard safe transaction delay
    setTimeout(() => {
      setIsPaying(false);
      setPaySuccess(true);
      setIsEnrolled(true);
      try {
        localStorage.setItem(`vision79-enrolled-${course.id}`, "true");
      } catch (e) {
        console.warn("Blocked writing to localStorage:", e);
      }
    }, 2200);
  };

  const saveNote = (txt: string) => {
    setStudentNote(txt);
    try {
      localStorage.setItem(`vision79-note-${course.id}`, txt);
    } catch (e) {
      console.warn("Blocked writing to localStorage:", e);
    }
  };

  const submitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionTxt.trim()) return;

    const newQ = {
      id: Date.now(),
      author: "You (Student)",
      text: newQuestionTxt,
      date: "Just now",
      replies: []
    };

    setQuestions([newQ, ...questions]);
    setNewQuestionTxt("");

    // Simulate instant witty reply from our Instructor AI
    setTimeout(() => {
      setQuestions(prev => prev.map(q => {
        if (q.id === newQ.id) {
          return {
            ...q,
            replies: [
              {
                author: course.instructor || "Expert Instructor",
                text: "Spot on query! That segment is detailed robustly in Block 3. Make sure to check resources tabs for sample configuration files to run in sandbox ports.",
                date: "A moment ago",
                isInstructor: true
              }
            ]
          };
        }
        return q;
      }));
    }, 2500);
  };

  return (
    <div id="course-details-layout" className="w-full flex flex-col min-h-screen text-app-text antialiased">
      
      {/* PROFESSIONAL TITLE BACK ACTION BAR */}
      <div className="flex items-center justify-between border-b border-app-border bg-app-aside-bg/30 p-4 sticky top-0 backdrop-blur-md z-40">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono font-medium hover:text-indigo-400 text-app-text-sec transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Courses Catalog
        </button>
        <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono tracking-wider px-2.5 py-0.5 rounded-full uppercase">
          Udemy Live Masterclass
        </span>
      </div>

      {/* MIDNIGHT GRANGE UDEMY HERO banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950 text-white p-6 sm:p-10 border-b border-indigo-950 flex flex-col gap-4 relative overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1),transparent_40%)]" />
        
        <div className="max-w-4xl relative z-10 space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-yellow-500 text-black font-extrabold uppercase px-2.5 py-0.5 rounded tracking-wide">
              Bestseller
            </span>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400">
              <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
              <span className="font-bold text-white text-sm">{course.rating || 4.9}</span>
              <span className="text-zinc-400 font-normal">(1,420 ratings) • 12,504 students</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4.5xl font-extrabold tracking-tight leading-tight text-white font-display">
            {course.name}
          </h1>
          
          <p className="text-sm sm:text-base text-zinc-300 font-light max-w-2xl">
            {course.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-mono text-zinc-400">
            <div>
              Instructor: <span className="text-indigo-400 underline font-semibold">{course.instructor || "Dr. Angela Yu"}</span>
            </div>
            <div>
              Last updated: <span className="text-zinc-300">June 2026</span>
            </div>
            <div>
              Language: <span className="text-zinc-300">English [CC]</span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE DOUBLE COLUMNS DETAIL WRAPPER */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CURRICULUM + VIDEO PLAYER + NOTES */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          
          {/* INTERACTIVE VIDEO LESSON SIMULATOR STREAM PLAYER */}
          <div className="relative overflow-hidden rounded-2xl border border-app-border bg-black shadow-2xl group flex flex-col">
            
            {/* STAGE HEADER METRICS */}
            <div className="p-3 bg-zinc-950 border-b border-app-border/40 flex items-center justify-between text-xs font-mono text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="truncate max-w-[240px] text-zinc-200">
                  Streaming {activeLecture ? activeLecture.title : "Initialization"}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500">{activeLecture?.duration} • SIMULATOR</span>
            </div>

            {/* LIVE DISPLAY VIDEO SCREEN CANVAS */}
            <div className="relative aspect-video w-full bg-gradient-to-b from-zinc-950 to-zinc-900 border-b border-app-border/20 flex flex-col items-center justify-center overflow-hidden p-6 text-center select-none">
              
              {/* Abstract futuristic grid backing */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
              
              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.div 
                    key="playing-state"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 w-full h-full flex flex-col justify-between pt-4"
                  >
                    <div className="flex items-center justify-center gap-1.5 text-zinc-500 text-xs font-mono bg-zinc-900/50 backdrop-blur border border-white/5 py-1 px-3.5 rounded-full select-none w-max mx-auto">
                      <Code className="w-3.5 h-3.5 text-indigo-400" />
                      Live Stream Simulation (ACTIVE)
                    </div>

                    <div className="flex-1 flex items-center justify-center flex-col px-4">
                      {/* Code Stream visualization waves */}
                      <div className="w-full max-w-lg p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 text-left font-mono text-[11px] leading-relaxed text-indigo-300 overflow-hidden shadow-lg">
                        <div className="flex items-center justify-between border-b border-indigo-500/10 pb-1.5 mb-2 text-[9px] text-indigo-400/80">
                          <span>$ node --experimental-typescript server.ts</span>
                          <span>Line: {Math.floor(videoProgress * 1.5)}</span>
                        </div>
                        <p className="font-semibold text-emerald-400 h-10 select-all font-mono break-all leading-normal">
                          {canvasModeText}
                        </p>
                      </div>

                      {/* Animated graphic viz */}
                      <div className="flex gap-1.5 h-6 items-end mt-4">
                        {[1, 2, 3, 4, 5, 4, 3, 2, 5, 1, 3, 4, 2, 1, 5, 4, 3, 2, 4].map((h, i) => (
                          <motion.div
                            key={i}
                            animate={{ height: isPlaying ? [10, h * 4, 10] : 10 }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.05 }}
                            className="w-1 bg-indigo-500 rounded"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="h-2 w-full bg-zinc-950 border border-zinc-900/50 rounded-full overflow-hidden mb-6 relative">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="paused-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 relative z-10 flex flex-col items-center justify-center p-8"
                  >
                    <div 
                      onClick={() => {
                        if (isEnrolled || activeLecture?.freePreview) {
                          setIsPlaying(true);
                        } else {
                          alert("Curriculum item is premium locked. Enroll to play.");
                        }
                      }}
                      className="w-16 h-16 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-xl hover:scale-110 transition duration-300 cursor-pointer border border-zinc-200"
                    >
                      <Play className="w-7 h-7 fill-zinc-950 translate-x-0.5" />
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-semibold tracking-wide text-zinc-100 uppercase font-mono">
                        {(!isEnrolled && !activeLecture?.freePreview) ? "Subscribe to unlock this Lecture 🔒" : "Click to Play Class Stream"}
                      </p>
                      <p className="text-xs text-zinc-400 max-w-md">
                        {(!isEnrolled && !activeLecture?.freePreview) 
                          ? `Unlock full lifetime access to all ${course.lessonsCount || 24} curriculum sections today.`
                          : `${activeLecture?.title || "Welcome lesson overview"} • ${activeLecture?.duration}`}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* VIDEO PLAYER METRIC CONTROLS FOOTER */}
            <div className="p-3.5 bg-zinc-950/90 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-300">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={!isEnrolled && !activeLecture?.freePreview}
                  className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  title={isPlaying ? "Pause Stream" : "Connect Stream"}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current text-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-current text-indigo-400" />
                  )}
                </button>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="text-[10px] font-mono uppercase bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded text-zinc-400 font-bold select-none">
                    Digital Out
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center p-0.5 rounded border border-zinc-800 bg-zinc-900">
                  {[1, 1.25, 1.5, 2].map((sp) => (
                    <button
                      key={sp}
                      onClick={() => setPlaybackSpeed(sp)}
                      className={`px-1.5 py-0.5 text-[9px] font-mono rounded cursor-pointer ${playbackSpeed === sp ? "bg-indigo-600 text-white font-bold" : "text-zinc-500"}`}
                    >
                      {sp}x
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-zinc-400 border border-zinc-800 rounded bg-zinc-900/60 px-2 py-0.5 select-none font-mono">
                  {isEnrolled ? "ENROLLED VIEW" : "PREVIEW MODE"}
                </div>
              </div>
            </div>
          </div>

          {/* LOWER SECTION TABS DECK */}
          <div className="border border-app-border bg-app-aside-bg/30 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex border-b border-app-border bg-app-btn-sec/20">
              {(["curriculum", "notes", "qa", "resources"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-xs font-mono font-medium tracking-wide uppercase transition-all duration-200 cursor-pointer ${
                    activeTab === tab
                      ? "border-b-2 border-indigo-500 text-app-text font-bold"
                      : "text-app-text-muted hover:text-app-text"
                  }`}
                >
                  {tab === "curriculum" ? "Curriculum" :
                   tab === "notes" ? "My Course Notes" :
                   tab === "qa" ? "Student Q&A Only" : "Free Resources"}
                </button>
              ))}
            </div>

            {/* TAB PANELS CONTAINER */}
            <div className="p-5 sm:p-6 min-h-[280px]">
              <AnimatePresence mode="wait">
                {activeTab === "curriculum" && (
                  <motion.div
                    key="curriculum-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs text-app-text-muted font-mono pb-2">
                      <span>Total lectures count: {course.lessonsCount || 24} Lectures</span>
                      <span>Total hours duration: {course.duration || "12 hrs"} total hours</span>
                    </div>

                    <div className="space-y-3.5">
                      {chapters.map((chapter, chapIdx) => {
                        const isOpen = expandedChapters[chapIdx];
                        return (
                          <div key={chapIdx} className="rounded-xl border border-app-border bg-app-btn-sec/10 overflow-hidden">
                            <button
                              onClick={() => handleToggleChapter(chapIdx)}
                              className="w-full flex items-center justify-between p-3.5 bg-app-btn-sec/20 hover:bg-app-btn-sec/30 text-left text-xs font-semibold text-app-text transition"
                            >
                              <span className="font-display pr-4 truncate font-bold text-app-text">{chapter.title}</span>
                              <div className="flex items-center gap-3 font-mono text-[10px] text-app-text-muted shrink-0">
                                <span>{chapter.lectures.length} Lectures</span>
                                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </button>
                            
                            {isOpen && (
                              <div className="divide-y divide-app-border/40 bg-app-bg/30">
                                {chapter.lectures.map((lec) => {
                                  const isLecActive = activeLecture?.id === lec.id;
                                  const isLocked = !isEnrolled && !lec.freePreview;
                                  return (
                                    <div 
                                      key={lec.id}
                                      onClick={() => handleSelectLecture(lec)}
                                      className={`flex items-center justify-between p-3.5 text-xs transition cursor-pointer ${
                                        isLecActive ? "bg-indigo-500/5 text-indigo-400" : "hover:bg-app-btn-sec/5 text-app-text-sec"
                                      }`}
                                    >
                                      <div className="flex items-center space-x-3 min-w-0 pr-4">
                                        {isLocked ? (
                                          <Lock className="w-3.5 h-3.5 text-app-text-muted/60 shrink-0" />
                                        ) : isLecActive ? (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                        ) : (
                                          <Play className="w-3.5 h-3.5 text-indigo-400/80 shrink-0" />
                                        )}
                                        <span className={`truncate font-medium ${isLocked ? "text-app-text-muted/70" : ""}`}>
                                          {lec.title}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-3 font-mono text-[10px] text-app-text-muted shrink-0">
                                        {lec.freePreview && !isLocked && (
                                          <span className="text-[8px] bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 font-bold px-1.5 py-0.5 rounded uppercase">
                                            Preview
                                          </span>
                                        )}
                                        <span>{lec.duration}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {activeTab === "notes" && (
                  <motion.div
                    key="notes-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-mono text-app-text-muted pb-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Take interactive notes that auto-save instantly to your local vault.</span>
                    </div>

                    <textarea
                      value={studentNote}
                      onChange={(e) => saveNote(e.target.value)}
                      placeholder="# Course Notes Setup...&#10;- Important secret swapper models go in process.env&#10;- Use ALTER TABLE statements dynamically in sqlite pre-loads&#10;- Deploying behind Nginx reverse-proxies require binding to host 0.0.0.0..."
                      rows={8}
                      className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-3 text-xs font-mono placeholder:text-app-text-muted/50 focus:outline-none focus:border-indigo-500 transition-all leading-relaxed"
                    />
                    <div className="flex items-center justify-between text-[10px] font-mono text-app-text-muted">
                      <span>Notes storage: Local secure sandbox browser vault</span>
                      <span>{studentNote.length} characters written</span>
                    </div>
                  </motion.div>
                )}

                {activeTab === "qa" && (
                  <motion.div
                    key="qa-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Add question form */}
                    <form onSubmit={submitQuestion} className="flex gap-2">
                      <input
                        type="text"
                        value={newQuestionTxt}
                        onChange={(e) => setNewQuestionTxt(e.target.value)}
                        placeholder="Ask deep architectural questions about this course layout..."
                        className="flex-1 bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs placeholder:text-app-text-muted/50 focus:outline-none focus:border-indigo-500"
                      />
                      <button 
                        type="submit"
                        className="bg-app-text text-app-bg px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 hover:opacity-90"
                      >
                        <Send className="w-3 h-3" />
                        Ask Q
                      </button>
                    </form>

                    {/* Questions loop */}
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                      {questions.map((q) => (
                        <div key={q.id} className="p-4 rounded-xl border border-app-border bg-app-btn-sec/5 space-y-3">
                          <div className="flex items-center justify-between text-[10px] font-mono">
                            <span className="font-semibold text-app-text-sec">{q.author}</span>
                            <span className="text-app-text-muted">{q.date}</span>
                          </div>
                          
                          <p className="text-xs text-app-text font-medium leading-relaxed">
                            {q.text}
                          </p>

                          {q.replies.map((rep, idx) => (
                            <div key={idx} className="pl-4 border-l-2 border-indigo-500 ml-2 space-y-1">
                              <div className="flex items-center gap-1 text-[9px] font-mono">
                                <span className="font-bold text-indigo-400">{rep.author}</span>
                                {rep.isInstructor && (
                                  <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[7px] px-1 py-0.2 rounded font-extrabold uppercase">
                                    Instructor Co-pilot
                                  </span>
                                )}
                                <span className="text-app-text-muted ml-auto">{rep.date}</span>
                              </div>
                              <p className="text-xs text-app-text-sec bg-app-btn-sec/10 p-2.5 rounded-lg border border-app-border/30 italic leading-relaxed">
                                "{rep.text}"
                              </p>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "resources" && (
                  <motion.div
                    key="resources-tab"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="p-4 rounded-xl border border-app-border bg-app-btn-sec/5 hover:border-indigo-500/40 transition flex items-start gap-3">
                        <Code className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div className="space-y-1 min-w-0">
                          <p className="text-xs font-semibold text-app-text truncate">VISION79 Core Stack Boilerplate</p>
                          <p className="text-[10px] text-app-text-muted leading-relaxed">Boilerplate template complete with dynamic SQLite setup schemas and port maps.</p>
                          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-400 font-mono inline-block pt-1 hover:underline">
                            Download Source .zip →
                          </a>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-app-border bg-app-btn-sec/5 hover:border-indigo-500/40 transition flex items-start gap-3">
                        <FileText className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-1 min-w-0">
                          <p className="text-xs font-semibold text-app-text truncate">Production Alter Migration Script</p>
                          <p className="text-[10px] text-app-text-muted leading-relaxed">Reference script compiling dynamic columns migration commands cleanly.</p>
                          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-400 font-mono inline-block pt-1 hover:underline">
                            View Raw TS Snippet →
                          </a>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STICKY PURCHASE WALL CHECKOUT */}
        <div className="lg:col-span-4 sticky top-24 h-max flex flex-col gap-6">
          
          <AnimatePresence mode="wait">
            {!isEnrolled ? (
              <motion.div
                key="checkout-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-app-aside-bg/40 border-2 border-indigo-500/25 p-5 sm:p-6 rounded-2xl space-y-5 shadow-xl relative overflow-hidden"
              >
                {/* Glow border element */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500" />
                
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded">
                    Enrollment Secure Portal
                  </span>
                  <div className="flex items-baseline justify-center sm:justify-start gap-2 pt-2">
                    <span className="text-3xl font-extrabold text-app-text font-display">${displayPrice.toFixed(2)}</span>
                    <span className="text-xs text-app-text-muted line-through font-mono">$199.99</span>
                    <span className="text-xs text-emerald-500 font-bold">52% OFF</span>
                  </div>
                  <p className="text-[10px] text-amber-500 font-mono tracking-normal block pt-1 font-bold">
                    ⚠️ 5 hours left at this certified rate!
                  </p>
                </div>

                {/* SECURE STRIPE CHECKOUT FORM GATEWAY */}
                <form onSubmit={handleCheckoutSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-app-text-muted uppercase">Cardholder Name</label>
                    <input 
                      type="text" 
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="e.g. Dr. Angela Yu"
                      className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-app-text-muted uppercase">16-Digit Card Number</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        maxLength={19}
                        value={creditCardNum}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/gi, "");
                          // Format with spaces
                          const chunks = val.match(/.{1,4}/g);
                          setCreditCardNum(chunks ? chunks.join(" ") : val);
                        }}
                        placeholder="4242 4242 4242 4242"
                        className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 pl-9 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <CreditCard className="w-4 h-4 text-app-text-muted absolute left-3 top-3.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-app-text-muted uppercase">Expiration (MM/YY)</label>
                      <input 
                        type="text" 
                        required
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/gi, "");
                          if (val.length >= 2) {
                            val = val.substring(0, 2) + "/" + val.substring(2, 4);
                          }
                          setCardExpiry(val);
                        }}
                        placeholder="MM/YY"
                        className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs text-center focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-app-text-muted uppercase">Security CVC</label>
                      <input 
                        type="text" 
                        required
                        maxLength={3}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/gi, ""))}
                        placeholder="123"
                        className="w-full bg-app-input border border-app-input-border text-app-text rounded-xl p-2.5 text-xs text-center focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  {payError && (
                    <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/10 text-[10px] text-red-500 leading-normal font-medium">
                      {payError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPaying}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl tracking-wide uppercase transition duration-200 cursor-pointer flex items-center justify-center gap-2 mt-2 shadow-lg disabled:opacity-40"
                  >
                    {isPaying ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying payment channel...
                      </>
                    ) : (
                      <>
                        Enroll Now for ${displayPrice.toFixed(2)}
                      </>
                    )}
                  </button>
                </form>

                <div className="border-t border-app-border/40 pt-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-[10px] text-app-text-sec">
                    <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Certified study duration: {course.duration || "12 hours"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-app-text-sec">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Lectures count: {course.lessonsCount || 24} downloadable files</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-app-text-sec">
                    <Infinity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Full Lifetime access with zero expiry</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-app-text-sec">
                    <Award className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>Verified certificate of V79 graduation</span>
                  </div>
                </div>

                <p className="text-[9px] text-center text-app-text-muted leading-tight font-mono pt-1">
                  100% Secure 256-bit AES Credit Card gateway encryption.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="enrolled-success-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-app-aside-bg/40 border-2 border-emerald-500/20 p-5 sm:p-6 rounded-2xl space-y-4 shadow-xl text-center relative"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-1">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-bold text-app-text text-base font-display">Enrollment Activated! ✅</h3>
                  <p className="text-[10px] text-app-text-muted leading-relaxed font-mono">
                    Full lifetime access authenticated successfully. Expand any curriculum block on the left and play the dynamic course stream!
                  </p>
                </div>

                <div className="bg-app-bg p-3.5 rounded-xl border border-app-border text-left space-y-2">
                  <div className="flex justify-between text-[9px] font-mono text-app-text-muted">
                    <span>STUDENT ID</span>
                    <span className="font-bold">v79-st-714a</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-app-text-muted">
                    <span>CERTIFICATE PATH</span>
                    <span className="font-bold text-emerald-400 uppercase">Aetherial Secure</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-app-text-muted">
                    <span>PROGRESS STATUS</span>
                    <span className="font-bold text-indigo-400">{Math.floor(videoProgress)}% Done</span>
                  </div>
                </div>

                <p className="text-[9px] text-app-text-muted font-mono leading-tight bg-zinc-500/5 p-2 rounded-lg">
                  💡 Tip: Use your notes tab on the left. It updates dynamically with your workspace.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
