import React, { useState, useEffect, ChangeEvent } from "react";
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
  Megaphone,
  Edit,
  X,
  MessageSquare,
  Star,
  CheckCircle,
  Sparkles,
  BookOpen,
  UploadCloud,
  Check,
  Loader2
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

interface LectureItemRowProps {
  key?: any;
  lecture: any;
  chapIdx: number;
  lecIdx: number;
  onUpdate: (chapIdx: number, lecIdx: number, fields: any) => void;
  onDelete: (chapIdx: number, lecIdx: number) => void;
  adminToken: string | null;
}

export function LectureItemRow({ lecture, chapIdx, lecIdx, onUpdate, onDelete, adminToken }: LectureItemRowProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>, type: "video" | "audio") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = adminToken || sessionStorage.getItem("admin-token");
      
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 150);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: formData
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(errData.error || "Upload failed");
      }

      const data = await res.json();
      setUploadProgress(100);

      if (type === "video") {
        onUpdate(chapIdx, lecIdx, { videoUrl: data.url, audioUrl: undefined });
      } else {
        onUpdate(chapIdx, lecIdx, { audioUrl: data.url, videoUrl: undefined });
      }
    } catch (err: any) {
      setUploadError(err.message || "An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = () => {
    onUpdate(chapIdx, lecIdx, { videoUrl: undefined, audioUrl: undefined });
  };

  return (
    <div className="bg-app-input/20 p-4 rounded-xl border border-app-border/30 space-y-3">
      {/* Top Main Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-5 flex items-center gap-2">
          <span className="text-[10px] font-mono text-app-text-muted shrink-0 w-8">{lecIdx + 1}.</span>
          <input
            type="text"
            value={lecture.title || ""}
            onChange={(e) => onUpdate(chapIdx, lecIdx, { title: e.target.value })}
            placeholder="Lesson Title"
            className="w-full bg-app-input border border-app-input-border text-app-text text-xs p-2 rounded-lg focus:outline-none focus:border-indigo-500/40 animate-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block md:hidden text-[9px] font-mono text-app-text-muted mb-0.5">Duration</label>
          <input
            type="text"
            value={lecture.duration || ""}
            onChange={(e) => onUpdate(chapIdx, lecIdx, { duration: e.target.value })}
            placeholder="12:15"
            className="w-full bg-app-input border border-app-input-border text-app-text text-xs p-2 rounded-lg text-center font-mono focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block md:hidden text-[9px] font-mono text-app-text-muted mb-0.5">Sim Type</label>
          <select
            value={lecture.videoSimType || "setup"}
            onChange={(e) => onUpdate(chapIdx, lecIdx, { videoSimType: e.target.value })}
            className="w-full bg-app-input border border-app-input-border text-app-text text-[11px] p-2 rounded-lg focus:outline-none"
          >
            <option value="intro">Intro Video</option>
            <option value="setup">Setup Walkthrough</option>
            <option value="deepdive">Deep Dive Session</option>
            <option value="advanced">Advanced Topic</option>
          </select>
        </div>

        <div className="md:col-span-2 flex items-center gap-1.5 justify-center">
          <input
            type="checkbox"
            id={`inline-preview-${chapIdx}-${lecIdx}`}
            checked={!!lecture.freePreview}
            onChange={(e) => onUpdate(chapIdx, lecIdx, { freePreview: e.target.checked })}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
          />
          <label htmlFor={`inline-preview-${chapIdx}-${lecIdx}`} className="text-[10px] font-mono text-app-text-muted select-none cursor-pointer">
            Preview?
          </label>
        </div>

        <div className="md:col-span-1 flex justify-end">
          <button
            onClick={() => onDelete(chapIdx, lecIdx)}
            className="p-1.5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 text-app-text-muted hover:text-rose-500 rounded-lg transition cursor-pointer"
            title="Delete Lesson"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Upload/Attachment Row */}
      <div className="pt-2.5 border-t border-app-border/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono uppercase text-app-text-muted tracking-wider">Lesson Material:</span>
          {lecture.videoUrl ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-mono">
              <Check className="w-3 h-3" />
              <span>🎥 Video Loaded ({lecture.videoUrl.split("/").pop()})</span>
            </div>
          ) : lecture.audioUrl ? (
            <div className="flex items-center gap-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full text-[10px] font-mono">
              <Check className="w-3 h-3" />
              <span>🎧 Audio Loaded ({lecture.audioUrl.split("/").pop()})</span>
            </div>
          ) : (
            <span className="text-[10px] font-mono text-app-text-muted italic bg-app-input/40 px-2 py-0.5 rounded-md">
              (No custom file uploaded. Falling back to active Code Simulator stream)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {uploading ? (
            <div className="flex items-center gap-2 text-[11px] font-mono text-indigo-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Uploading ({uploadProgress}%)</span>
            </div>
          ) : (
            <>
              {(lecture.videoUrl || lecture.audioUrl) ? (
                <button
                  type="button"
                  onClick={removeMedia}
                  className="text-[10px] font-mono text-rose-400 hover:text-rose-300 transition hover:bg-rose-500/5 px-2 py-1 rounded border border-rose-500/15 cursor-pointer"
                >
                  Remove Material
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 px-2.5 py-1 rounded transition cursor-pointer">
                    <UploadCloud className="w-3 h-3" />
                    <span>Upload Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "video")}
                    />
                  </label>
                  <label className="flex items-center gap-1 text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 px-2.5 py-1 rounded transition cursor-pointer">
                    <UploadCloud className="w-3 h-3" />
                    <span>Upload Audio</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, "audio")}
                    />
                  </label>
                </div>
              )}
            </>
          )}
          {uploadError && (
            <span className="text-[10px] font-mono text-rose-500 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
              ⚠️ {uploadError}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [formCategory, setFormCategory] = useState<"web" | "desktop" | "games" | "courses">("web");
  const [formPricing, setFormPricing] = useState<"free" | "free_trial" | "premium">("free");
  const [formLogoType, setFormLogoType] = useState<"preset" | "url">("preset");
  const [formPresetIcon, setFormPresetIcon] = useState("lucide:ShieldCheck");
  const [formCustomUrl, setFormCustomUrl] = useState("");
  const [formAccessUrl, setFormAccessUrl] = useState("");
  
  // Custom courses admin form states
  const [formPrice, setFormPrice] = useState("49.99");
  const [formInstructor, setFormInstructor] = useState("");
  const [formDuration, setFormDuration] = useState("12.5 hrs");
  const [formLessonsCount, setFormLessonsCount] = useState("24");
  const [formRating, setFormRating] = useState("4.8");

  const [adminNotification, setAdminNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingAppId, setEditingAppId] = useState<number | null>(null);

  // Curriculum Management states
  const [selectedCurriculumCourse, setSelectedCurriculumCourse] = useState<SaaSApp | null>(null);
  const [curriculumChapters, setCurriculumChapters] = useState<any[]>([]);

  const handleManageCurriculum = (app: SaaSApp) => {
    setSelectedCurriculumCourse(app);
    if (app.curriculum) {
      try {
        const parsed = JSON.parse(app.curriculum);
        if (Array.isArray(parsed)) {
          setCurriculumChapters(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse app curriculum:", e);
      }
    }
    // Fallback default chapters so they have a template if empty
    setCurriculumChapters([
      {
        title: "Block 1: Introduction and Core Concepts",
        lectures: [
          { id: "1-1", title: "1. Welcome and Course Overview", duration: "10:15", videoSimType: "intro", freePreview: true }
        ]
      }
    ]);
  };

  const handleAddChapter = () => {
    setCurriculumChapters([
      ...curriculumChapters,
      {
        title: `Block ${curriculumChapters.length + 1}: New Chapter Title`,
        lectures: []
      }
    ]);
  };

  const handleUpdateChapterTitle = (chapIdx: number, title: string) => {
    const updated = [...curriculumChapters];
    updated[chapIdx].title = title;
    setCurriculumChapters(updated);
  };

  const handleDeleteChapter = (chapIdx: number) => {
    const updated = curriculumChapters.filter((_, idx) => idx !== chapIdx);
    setCurriculumChapters(updated);
  };

  const handleAddLecture = (chapIdx: number) => {
    const updated = [...curriculumChapters];
    const nextLecNum = (updated[chapIdx].lectures || []).length + 1;
    if (!updated[chapIdx].lectures) {
      updated[chapIdx].lectures = [];
    }
    updated[chapIdx].lectures.push({
      id: `${chapIdx + 1}-${nextLecNum}-${Date.now()}`,
      title: `${nextLecNum}. New Lesson Title`,
      duration: "10:00",
      videoSimType: "setup",
      freePreview: false
    });
    setCurriculumChapters(updated);
  };

  const handleUpdateLecture = (chapIdx: number, lecIdx: number, fields: any) => {
    const updated = [...curriculumChapters];
    updated[chapIdx].lectures[lecIdx] = {
      ...updated[chapIdx].lectures[lecIdx],
      ...fields
    };
    setCurriculumChapters(updated);
  };

  const handleDeleteLecture = (chapIdx: number, lecIdx: number) => {
    const updated = [...curriculumChapters];
    updated[chapIdx].lectures = updated[chapIdx].lectures.filter((_: any, idx: number) => idx !== lecIdx);
    setCurriculumChapters(updated);
  };

  const handleSaveCurriculum = async () => {
    if (!selectedCurriculumCourse) return;
    setSubmitting(true);
    setAdminNotification(null);
    try {
      const token = adminToken || safeSessionStorage.getItem("admin-token");
      
      // Calculate total lessonsCount and set it automatically
      const totalLessons = curriculumChapters.reduce((acc, chap) => acc + (chap.lectures?.length || 0), 0);

      const res = await fetch(`/api/apps/${selectedCurriculumCourse.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...selectedCurriculumCourse,
          curriculum: JSON.stringify(curriculumChapters),
          lessonsCount: totalLessons
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update course curriculum.");
      }

      const updatedCourse = await res.json();
      setApps(apps.map(a => a.id === selectedCurriculumCourse.id ? updatedCourse : a));
      setAdminNotification({ type: "success", text: `Curriculum and lessons successfully saved for "${updatedCourse.name}"!` });
      setSelectedCurriculumCourse(null);
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (app: SaaSApp) => {
    setEditingAppId(app.id);
    setFormName(app.name || "");
    setFormSubtitle(app.subtitle || "");
    setFormDescription(app.description || "");
    setFormCategory(app.category || "web");
    setFormPricing(app.pricingType || "free");
    setFormAccessUrl(app.accessUrl || "");
    setFormPrice(app.price !== undefined ? app.price.toString() : "49.99");
    setFormInstructor(app.instructor || "");
    setFormDuration(app.duration || "12.5 hrs");
    setFormLessonsCount(app.lessonsCount !== undefined ? app.lessonsCount.toString() : "24");
    setFormRating(app.rating !== undefined ? app.rating.toString() : "4.8");
    
    if (app.logoUrl && app.logoUrl.startsWith("lucide:")) {
      setFormLogoType("preset");
      setFormPresetIcon(app.logoUrl);
      setFormCustomUrl("");
    } else {
      setFormLogoType("url");
      setFormCustomUrl(app.logoUrl || "");
      setFormPresetIcon("lucide:ShieldCheck");
    }
    
    // Scroll smoothly to the edit form
    const formElement = document.getElementById("add-app-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleCancelEdit = () => {
    setEditingAppId(null);
    setFormName("");
    setFormSubtitle("");
    setFormDescription("");
    setFormCategory("web");
    setFormPricing("free");
    setFormLogoType("preset");
    setFormPresetIcon("lucide:ShieldCheck");
    setFormCustomUrl("");
    setFormAccessUrl("");
    setFormPrice("49.99");
    setFormInstructor("");
    setFormDuration("12.5 hrs");
    setFormLessonsCount("24");
    setFormRating("4.8");
    setAdminNotification(null);
  };

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

  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [onboardComments, setOnboardComments] = useState<Record<number, string>>({});
  const [submittingOnboardId, setSubmittingOnboardId] = useState<number | null>(null);

  const fetchAllFeedbacks = async () => {
    try {
      setFeedbacksLoading(true);
      const token = adminToken || safeSessionStorage.getItem("admin-token");
      const res = await fetch("/api/admin/feedback", {
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        }
      });
      if (res.ok) {
        const data = await res.json();
        setFeedbacks(data);
      }
    } catch (e) {
      console.error("Failed to load feedbacks:", e);
    } finally {
      setFeedbacksLoading(false);
    }
  };

  const handleOnboardFeedback = async (id: number) => {
    const comment = onboardComments[id] || "";
    if (!comment.trim()) {
      alert("Please enter a response/comment to describe how this feedback was onboarded.");
      return;
    }

    try {
      setSubmittingOnboardId(id);
      const token = adminToken || safeSessionStorage.getItem("admin-token");
      const res = await fetch(`/api/admin/feedback/${id}/onboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ onboardedComment: comment.trim() })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to onboard feedback.");
      }

      const updated = await res.json();
      setFeedbacks(feedbacks.map(f => f.id === id ? updated : f));
      setOnboardComments(prev => ({ ...prev, [id]: "" }));
    } catch (err: any) {
      alert(err.message || "An error occurred during onboarding.");
    } finally {
      setSubmittingOnboardId(null);
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
      fetchAllFeedbacks();
    }
  }, [adminToken, apps.length]);

  // Handle Admin App Addition or Update
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
      const isEditing = editingAppId !== null;
      const url = isEditing ? `/api/apps/${editingAppId}` : "/api/apps";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
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
          accessUrl: formAccessUrl || "#",
          price: formPricing === "free" ? 0 : parseFloat(formPrice) || 0,
          instructor: formCategory === "courses" ? formInstructor : "",
          rating: formCategory === "courses" ? parseFloat(formRating) || 4.7 : 4.7,
          duration: formCategory === "courses" ? formDuration : "",
          lessonsCount: formCategory === "courses" ? parseInt(formLessonsCount, 10) || 10 : 0
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? "update" : "persist"} SaaS product`);
      }

      const updatedOrNewApp = await res.json();
      if (isEditing) {
        setApps(apps.map(a => a.id === editingAppId ? updatedOrNewApp : a));
        setAdminNotification({ type: "success", text: `"${updatedOrNewApp.name}" has been successfully updated!` });
        handleCancelEdit();
      } else {
        setApps([updatedOrNewApp, ...apps]);
        setFormName("");
        setFormSubtitle("");
        setFormDescription("");
        setFormCustomUrl("");
        setFormAccessUrl("");
        setFormPrice("49.99");
        setFormInstructor("");
        setFormDuration("12.5 hrs");
        setFormLessonsCount("24");
        setFormRating("4.8");
        if (formCategory === "courses") {
          setAdminNotification({ 
            type: "success", 
            text: `"${updatedOrNewApp.name}" has been successfully published! A 50% promotional campaign for the next 30 days has been automatically generated.` 
          });
          fetchAds();
        } else {
          setAdminNotification({ type: "success", text: `"${updatedOrNewApp.name}" has been certified and successfully published!` });
        }
      }
    } catch (err: any) {
      setAdminNotification({ type: "error", text: err.message || "An exception occurred during operation" });
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
    totalLaunches: apps.reduce((accum, curr) => accum + (curr.launchCount || 0), 0),
    totalApps: apps.length,
    webAppsCount: apps.filter(a => a.category === "web").length,
    desktopAppsCount: apps.filter(a => a.category === "desktop").length,
    gamesAppsCount: apps.filter(a => a.category === "games").length,
    coursesAppsCount: apps.filter(a => a.category === "courses").length
  };

  return (
    <div className="flex flex-col min-h-screen border border-app-border bg-app-bg text-app-text selection:bg-app-border/40 antialiased">
      
      {/* PROFESSIONAL POLISH SYSTEM HEADER */}
      <header className="h-16 flex items-center justify-between px-8 border-b border-app-border bg-app-header-bg backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md flex items-center justify-center font-black text-xs tracking-tighter bg-app-text text-app-bg">V79</div>
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
                        <span className="text-[10px] font-mono text-app-text-muted uppercase tracking-wider block">Premium Courses</span>
                        <span id="stat-courses-apps" className="text-2xl font-mono font-bold text-app-text-sec block">{stats.coursesAppsCount}</span>
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
                      <div className="flex items-center gap-2 pb-3 border-b border-app-border justify-between">
                        <div className="flex items-center gap-2">
                          {editingAppId !== null ? (
                            <Edit className="w-5 h-5 text-indigo-400" />
                          ) : (
                            <Plus className="w-5 h-5 text-app-text-sec" />
                          )}
                          <h3 className="text-sm font-semibold uppercase tracking-wider font-display text-app-text">
                            {editingAppId !== null ? "Edit SaaS Product" : "Add SaaS Product"}
                          </h3>
                        </div>
                        {editingAppId !== null && (
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-[10px] font-mono px-2 py-1 bg-app-btn-sec hover:bg-rose-500/10 hover:text-rose-400 border border-app-border hover:border-rose-500/30 rounded flex items-center gap-1 text-app-text-muted transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                            Cancel Edit
                          </button>
                        )}
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
                              <option className="bg-app-bg text-app-text" value="courses">SaaS Course</option>
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
                              <option className="bg-app-bg text-app-text" value="premium">Subscription / Premium</option>
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
                            placeholder="Briefly detail what security scans, system solutions, or comprehensive curriculums this item hosts..."
                          />
                        </div>

                        {formCategory === "courses" && (
                          <div id="course-details-form-section" className="bg-violet-500/5 p-3.5 rounded-xl border border-violet-500/15 space-y-3.5 my-3">
                            <span className="text-[10px] font-mono uppercase text-violet-500 dark:text-violet-400 block tracking-wider font-bold">Course Meta Fields (Vision79 Style)</span>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-app-text-sec uppercase">Course Price ($ USD)</label>
                                <input 
                                  type="text" 
                                  value={formPrice} 
                                  onChange={(e) => setFormPrice(e.target.value)} 
                                  placeholder="19.99"
                                  className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2 text-xs focus:outline-none focus:border-app-border"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-app-text-sec uppercase">Instructor Name</label>
                                <input 
                                  type="text" 
                                  value={formInstructor} 
                                  onChange={(e) => setFormInstructor(e.target.value)} 
                                  placeholder="e.g. Kent C. Dodds"
                                  className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2 text-xs focus:outline-none focus:border-app-border"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-app-text-sec uppercase">Rating (0-5)</label>
                                <input 
                                  type="text" 
                                  value={formRating} 
                                  onChange={(e) => setFormRating(e.target.value)} 
                                  placeholder="4.8"
                                  className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2 text-xs focus:outline-none focus:border-app-border"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-app-text-sec uppercase">Course Duration</label>
                                <input 
                                  type="text" 
                                  value={formDuration} 
                                  onChange={(e) => setFormDuration(e.target.value)} 
                                  placeholder="e.g. 18.5 hours"
                                  className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2 text-xs focus:outline-none focus:border-app-border"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono text-app-text-sec uppercase">Lectures Count</label>
                                <input 
                                  type="text" 
                                  value={formLessonsCount} 
                                  onChange={(e) => setFormLessonsCount(e.target.value)} 
                                  placeholder="e.g. 42"
                                  className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2 text-xs focus:outline-none focus:border-app-border"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {formCategory !== "courses" && formPricing !== "free" && (
                          <div id="app-pricing-form-section" className="bg-indigo-500/5 p-3.5 rounded-xl border border-indigo-500/15 space-y-2 my-2">
                            <span className="text-[10px] font-mono uppercase text-indigo-500 dark:text-indigo-400 block tracking-wider font-bold">App Pricing Settings</span>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-app-text-sec uppercase">App Price ($ USD / One-time or Monthly)</label>
                              <input 
                                type="text"
                                required
                                value={formPrice}
                                onChange={(e) => setFormPrice(e.target.value)}
                                placeholder="e.g. 19.99"
                                className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2.5 text-xs placeholder:text-app-text-muted/65 focus:outline-none focus:border-app-border/80"
                              />
                              <p className="text-[9px] text-app-text-muted leading-tight font-mono">
                                Set the dynamic price for this SaaS app. Enter 0 if free tier applies.
                              </p>
                            </div>
                          </div>
                        )}

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
                          className={`w-full py-2.5 text-xs rounded-lg transition-all font-bold cursor-pointer ${
                            editingAppId !== null 
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                              : "bg-app-text text-app-bg"
                          }`}
                        >
                          {submitting 
                            ? "Writing SQLite..." 
                            : editingAppId !== null 
                              ? "Save Changes ✨" 
                              : "Certify & Set Active ✨"}
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
                              <th className="pb-3 font-medium text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-app-border/50">
                            {apps.map((app) => (
                              <tr key={app.id} className="hover:bg-app-btn-sec/20 transition-colors duration-150">
                                <td className="py-3 flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-lg bg-app-btn-sec flex items-center justify-center border border-app-border shrink-0">
                                    <AppLogo logoUrl={app.logoUrl} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold text-app-text truncate">{app.name}</p>
                                    <div className="flex items-center gap-1.5 font-mono text-[10px] truncate select-none">
                                      <span className="text-app-text-muted lowercase">{app.pricingType}</span>
                                      <span className="text-app-text-muted/50">•</span>
                                      {app.price !== undefined && app.price !== null && Number(app.price) > 0 ? (
                                        <span className="text-indigo-400 font-bold">USD ${Number(app.price).toFixed(2)}</span>
                                      ) : (
                                        <span className="text-emerald-500 font-medium">Free</span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 font-mono text-app-text-sec">
                                  {(app.launchCount !== undefined && app.launchCount !== null ? app.launchCount : 0).toLocaleString()}
                                </td>
                                <td className="py-3">
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-app-btn-sec border border-app-border text-app-text-sec uppercase">
                                    {app.category}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  <div className="flex items-center justify-end space-x-1.5">
                                    {app.category === "courses" && (
                                      <button
                                        onClick={() => handleManageCurriculum(app)}
                                        title="Manage Course Materials"
                                        className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/30 rounded transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                                      >
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <span className="text-[9px] font-mono font-bold tracking-wider uppercase hidden md:inline">Materials 📚</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleStartEdit(app)}
                                      title="Edit App Details"
                                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                                        editingAppId === app.id
                                          ? "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20"
                                          : "text-app-text-muted hover:text-indigo-400 hover:bg-app-btn-sec"
                                      }`}
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteApp(app.id)}
                                      title="Delete App"
                                      className="p-1.5 text-app-text-muted hover:text-rose-500 hover:bg-app-btn-sec rounded transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                  {/* COMPREHENSIVE CURRICULUM & MATERIALS MANAGER */}
                  <section id="curriculum-manager-section" className="glass rounded-2xl p-6 bg-indigo-500/5 border border-indigo-500/10 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-app-border/65">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-indigo-400" />
                          <h3 className="text-base font-bold font-display text-app-text tracking-tight">Vision79 Comprehensive Curriculum & Materials Manager</h3>
                        </div>
                        <p className="text-xs text-app-text-sec">Create, edit, and organize multi-chapter structures, video simulations, and lesson modules for your custom Vision79 courses.</p>
                      </div>
                      
                      {/* Course Selector Dropdown */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-app-text-muted select-none">Active Course:</span>
                        <select
                          value={selectedCurriculumCourse?.id || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setSelectedCurriculumCourse(null);
                              setCurriculumChapters([]);
                            } else {
                              const courseApp = apps.find(a => a.id === Number(val));
                              if (courseApp) {
                                handleManageCurriculum(courseApp);
                              }
                            }
                          }}
                          className="bg-app-input border border-app-input-border text-app-text text-xs rounded-lg p-2 focus:outline-none focus:border-indigo-500/50 min-w-[200px]"
                        >
                          <option value="">-- Choose Course --</option>
                          {apps.filter(app => app.category === "courses").map(course => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Editor Space */}
                    {!selectedCurriculumCourse ? (
                      <div className="text-center py-12 px-4 rounded-xl border border-dashed border-app-border/60 bg-app-aside-bg/10 flex flex-col items-center justify-center space-y-3 animate-fade-in-once">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-semibold text-app-text">No course selected</p>
                        <p className="text-xs text-app-text-muted max-w-md mx-auto">Select a course from the dropdown menu above (or click "Materials 📚" in the registrar table below) to edit its curriculum, add lessons, set video playback lengths, and custom previews.</p>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-fade-in-once">
                        {/* Selected Course summary banner */}
                        <div className="flex items-center justify-between p-3.5 bg-indigo-500/5 rounded-xl border border-indigo-500/15">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">Currently Modifying:</span>
                            <span className="text-xs font-bold text-app-text">{selectedCurriculumCourse.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedCurriculumCourse(null);
                                setCurriculumChapters([]);
                              }}
                              className="px-3 py-1.5 border border-app-border hover:bg-app-btn-sec rounded-lg text-[11px] font-semibold text-app-text transition cursor-pointer"
                            >
                              Close Editor
                            </button>
                            <button
                              onClick={handleSaveCurriculum}
                              disabled={submitting}
                              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-[11px] transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              {submitting ? "Saving..." : "Save Materials"}
                            </button>
                          </div>
                        </div>

                        {/* Curriculum chapter builder */}
                        <div className="space-y-6">
                          {curriculumChapters.length === 0 ? (
                            <div className="text-center py-8 space-y-3">
                              <p className="text-xs text-app-text-muted font-mono">This course does not have any curriculum sections yet.</p>
                              <button
                                onClick={handleAddChapter}
                                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold font-mono transition cursor-pointer"
                              >
                                ➕ Add First Chapter Block
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {curriculumChapters.map((chapter, chapIdx) => (
                                <div key={chapIdx} className="border border-app-border/70 rounded-xl bg-app-aside-bg/10 p-4 space-y-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-app-border/40">
                                    <div className="flex items-center gap-3 flex-1">
                                      <span className="text-xs font-mono font-bold text-indigo-400 shrink-0">Block {chapIdx + 1}</span>
                                      <input
                                        type="text"
                                        value={chapter.title}
                                        onChange={(e) => handleUpdateChapterTitle(chapIdx, e.target.value)}
                                        placeholder="Block Title (e.g., Chapter 1: Foundations)"
                                        className="flex-1 bg-app-input border border-app-input-border text-app-text font-bold text-xs p-2 rounded-lg focus:outline-none focus:border-indigo-500/50"
                                      />
                                    </div>
                                    <button
                                      onClick={() => handleDeleteChapter(chapIdx)}
                                      className="text-[10px] font-mono text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 border border-rose-500/10 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                                    >
                                      Delete Block
                                    </button>
                                  </div>

                                  {/* Lectures inside chapter */}
                                  <div className="space-y-3 pl-2 sm:pl-4">
                                    {chapter.lectures && chapter.lectures.map((lecture: any, lecIdx: number) => (
                                      <LectureItemRow
                                        key={lecture.id || lecIdx}
                                        lecture={lecture}
                                        chapIdx={chapIdx}
                                        lecIdx={lecIdx}
                                        onUpdate={handleUpdateLecture}
                                        onDelete={handleDeleteLecture}
                                        adminToken={adminToken}
                                      />
                                    ))}

                                    <button
                                      onClick={() => handleAddLecture(chapIdx)}
                                      className="w-full py-2 border border-dashed border-app-border hover:border-indigo-500/40 hover:bg-indigo-500/5 text-indigo-400 rounded-xl text-xs font-mono transition flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                      ➕ Add Lecture / Lesson Material
                                    </button>
                                  </div>
                                </div>
                              ))}

                              <button
                                onClick={handleAddChapter}
                                className="w-full py-3 bg-app-btn-sec/30 hover:bg-app-btn-sec border border-app-border text-app-text font-bold rounded-xl text-xs font-mono transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                ➕ Add New Block / Chapter
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </section>

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

                  {/* USER FEEDBACK & ONBOARDING WORKSPACE */}
                  <div className="pt-8 border-t border-app-border/45 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-indigo-500 animate-pulse" />
                          <h3 className="text-base font-bold font-display text-app-text tracking-tight">User Feedback & Rating Management</h3>
                        </div>
                        <p className="text-xs text-app-text-sec font-mono">
                          Review suggestions, view overall quality stars, and type your response to show they are "onboarded" and "implemented" inside V79.
                        </p>
                      </div>
                      <button
                        onClick={fetchAllFeedbacks}
                        className="self-start sm:self-auto text-xs px-3 py-1.5 bg-app-btn-sec border border-app-border text-app-text hover:bg-app-btn-sec/80 rounded-lg cursor-pointer"
                      >
                        Synch Feedbacks
                      </button>
                    </div>

                    <div className="glass p-6 rounded-2xl bg-app-aside-bg/30">
                      {feedbacksLoading ? (
                        <div className="text-xs text-app-text-muted font-mono py-8 text-center">
                          Refinding feedbacks in SQLite registries...
                        </div>
                      ) : feedbacks.length === 0 ? (
                        <div className="text-xs text-app-text-muted font-mono py-12 text-center bg-app-btn-sec/10 rounded-xl border border-dashed border-app-border">
                          No user feedback items found in the database.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {feedbacks.map((f) => (
                            <div
                              key={f.id}
                              className={`p-4 rounded-xl border text-xs space-y-3.5 flex flex-col justify-between ${
                                f.onboarded === 1
                                  ? "bg-emerald-500/5 border-emerald-500/20"
                                  : "bg-app-btn-sec/15 border-app-border/60 hover:border-app-border"
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <span className="font-bold text-app-text text-[13px] block">
                                      {f.userName || "Anonymous student"}
                                    </span>
                                    <span className="text-[10px] text-indigo-400 font-medium font-mono">
                                      App: {f.appName || `App #${f.appId}`}
                                    </span>
                                  </div>

                                  <div className="flex gap-0.5 text-amber-400 shrink-0">
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                      <Star
                                        key={idx}
                                        className={`w-3.5 h-3.5 ${idx < f.rating ? "fill-amber-400 text-amber-400" : "text-zinc-600"}`}
                                      />
                                    ))}
                                  </div>
                                </div>

                                <p className="text-app-text-sec text-[11px] leading-relaxed italic">
                                  "{f.comment}"
                                </p>

                                <span className="text-[9px] text-app-text-muted font-mono block">
                                  Received: {new Date(f.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>

                              <div className="pt-3 border-t border-app-border/40 space-y-2">
                                {f.onboarded === 1 ? (
                                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 space-y-1">
                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 font-mono uppercase tracking-wide">
                                      <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                                      Onboarded & Implemented ✅
                                    </div>
                                    <p className="text-[10px] text-app-text-sec leading-relaxed italic font-mono pl-5">
                                      "{f.onboardedComment}"
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <textarea
                                      value={onboardComments[f.id] || ""}
                                      onChange={(e) => setOnboardComments({ ...onboardComments, [f.id]: e.target.value })}
                                      placeholder="Explain how this feedback is onboarded/implemented in V79..."
                                      rows={2}
                                      className="w-full bg-app-input border border-app-input-border text-app-text rounded-lg p-2 text-[10px] placeholder:text-app-text-muted/65 focus:outline-none focus:border-app-border/80 leading-normal resize-none font-mono"
                                    />
                                    <button
                                      onClick={() => handleOnboardFeedback(f.id)}
                                      disabled={submittingOnboardId === f.id}
                                      className="w-full py-1.5 text-[10px] font-mono tracking-wider uppercase font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer transition flex items-center justify-center gap-1"
                                    >
                                      {submittingOnboardId === f.id ? (
                                        <>
                                          <div className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin"></div>
                                          Processing...
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-3 h-3 text-indigo-200" />
                                          Mark as Onboarded
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>

                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedCurriculumCourse && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 15 }}
                    className="bg-app-bg border border-app-border rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-app-text"
                  >
                    {/* Header */}
                    <div className="p-5 border-b border-app-border flex items-center justify-between bg-app-aside-bg/40">
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-5 h-5 text-indigo-400" />
                        <div>
                          <h3 className="font-bold font-display text-base tracking-tight">Curriculum & Course Materials</h3>
                          <p className="text-xs text-app-text-muted">{selectedCurriculumCourse.name}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedCurriculumCourse(null)}
                        className="p-1.5 hover:bg-app-btn-sec/50 border border-app-border/40 rounded-lg text-app-text-muted hover:text-app-text transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content Scroll */}
                    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-app-bg/50">
                      {curriculumChapters.length === 0 ? (
                        <div className="text-center py-10 space-y-3">
                          <p className="text-sm text-app-text-muted font-mono">This course does not have any curriculum sections yet.</p>
                          <button
                            onClick={handleAddChapter}
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold font-mono transition cursor-pointer"
                          >
                            ➕ Add First Chapter
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {curriculumChapters.map((chapter, chapIdx) => (
                            <div key={chapIdx} className="border border-app-border/70 rounded-xl bg-app-aside-bg/20 p-4 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-app-border/40">
                                <div className="flex items-center gap-3 flex-1">
                                  <span className="text-xs font-mono font-bold text-indigo-400 shrink-0">Chapter {chapIdx + 1}</span>
                                  <input
                                    type="text"
                                    value={chapter.title}
                                    onChange={(e) => handleUpdateChapterTitle(chapIdx, e.target.value)}
                                    placeholder="Chapter Title"
                                    className="flex-1 bg-app-input border border-app-input-border text-app-text font-bold text-xs p-2 rounded-lg focus:outline-none focus:border-indigo-500/50"
                                  />
                                </div>
                                <button
                                  onClick={() => handleDeleteChapter(chapIdx)}
                                  className="text-[10px] font-mono text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 border border-rose-500/10 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                                >
                                  Delete Chapter
                                </button>
                              </div>

                              {/* Lectures inside chapter */}
                              <div className="space-y-3 pl-2 sm:pl-4">
                                {chapter.lectures && chapter.lectures.map((lecture: any, lecIdx: number) => (
                                  <LectureItemRow
                                    key={lecture.id || lecIdx}
                                    lecture={lecture}
                                    chapIdx={chapIdx}
                                    lecIdx={lecIdx}
                                    onUpdate={handleUpdateLecture}
                                    onDelete={handleDeleteLecture}
                                    adminToken={adminToken}
                                  />
                                ))}

                                <button
                                  onClick={() => handleAddLecture(chapIdx)}
                                  className="w-full py-2 border border-dashed border-app-border hover:border-indigo-500/40 hover:bg-indigo-500/5 text-indigo-400 rounded-xl text-xs font-mono transition flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  ➕ Add Lecture / Lesson Material
                                </button>
                              </div>
                            </div>
                          ))}

                          <button
                            onClick={handleAddChapter}
                            className="w-full py-3 bg-app-btn-sec/50 hover:bg-app-btn-sec border border-app-border text-app-text font-bold rounded-xl text-xs font-mono transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            ➕ Add New Chapter / Section
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-app-border flex items-center justify-between bg-app-aside-bg/40">
                      <p className="text-xs text-app-text-muted font-mono">
                        Total curriculum lessons: {curriculumChapters.reduce((acc, chap) => acc + (chap.lectures?.length || 0), 0)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedCurriculumCourse(null)}
                          className="px-4 py-2 border border-app-border hover:bg-app-btn-sec rounded-xl text-xs font-semibold text-app-text transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveCurriculum}
                          disabled={submitting}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {submitting ? "Saving material..." : "Save Materials Curriculum ✨"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
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
            <div className="flex items-center gap-6 hidden sm:flex">
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
