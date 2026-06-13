"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { isAdminEmail } from "@/lib/admin";
import {
  generateImage,
  generateVideo,
  animateLogo,
  uploadFile,
  type FalImageResult,
  type FalVideoResult,
  type ImageSize,
  type LogMessage,
} from "@/lib/fal";

type GenerationMode = "image" | "video" | "logo";
type GenerationStatus = "idle" | "generating" | "completed" | "error";

interface GenerationResult {
  type: "image" | "video";
  url: string;
  prompt: string;
  timestamp: Date;
  duration?: number;
  saved?: boolean;
  savedPath?: string;
}

export default function GenerateAssetsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<GenerationMode>("image");
  const [prompt, setPrompt] = useState("");
  const [imageSize, setImageSize] = useState<ImageSize>("square_hd");
  const [seed, setSeed] = useState<string>("");
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [recentGenerations, setRecentGenerations] = useState<GenerationResult[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    // Gate visibility by admin email; real enforcement lives in middleware/layout.
    isAdminEmail(user?.primaryEmailAddress?.emailAddress);
    setIsLoading(false);
  }, [isLoaded, user]);

  const handleLogMessage = useCallback((log: LogMessage) => {
    setLogs((prev) => [...prev, log.message]);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() && mode !== "logo") {
      setError("Please enter a prompt");
      return;
    }

    if (mode === "logo" && !uploadedFile && !uploadedImageUrl) {
      setError("Please upload an image or provide an image URL");
      return;
    }

    setStatus("generating");
    setLogs([]);
    setError(null);
    setResult(null);
    setStartTime(Date.now());

    try {
      const seedValue = seed ? parseInt(seed, 10) : undefined;

      if (mode === "image") {
        setLogs((prev) => [...prev, "Starting image generation with FLUX.1 [dev]..."]);
        const response = await generateImage(prompt, {
          size: imageSize,
          seed: seedValue,
        }, handleLogMessage);

        const data = response.data as FalImageResult;
        const duration = startTime ? (Date.now() - startTime) / 1000 : 0;

        const newResult: GenerationResult = {
          type: "image",
          url: data.images[0].url,
          prompt,
          timestamp: new Date(),
          duration,
        };

        setResult(newResult);
        setRecentGenerations((prev) => [newResult, ...prev].slice(0, 10));
        setLogs((prev) => [...prev, `Completed in ${duration.toFixed(1)}s`]);
        setStatus("completed");
      } else if (mode === "video") {
        setLogs((prev) => [...prev, "Starting video generation with WAN 2.1..."]);

        let imageUrl = uploadedImageUrl;
        if (uploadedFile && !uploadedImageUrl) {
          setLogs((prev) => [...prev, "Uploading image..."]);
          imageUrl = await uploadFile(uploadedFile);
          setLogs((prev) => [...prev, "Image uploaded successfully"]);
        }

        const response = await generateVideo({
          prompt,
          imageUrl: imageUrl || undefined,
          seed: seedValue,
        }, handleLogMessage);

        const data = response.data as FalVideoResult;
        const duration = startTime ? (Date.now() - startTime) / 1000 : 0;

        const newResult: GenerationResult = {
          type: "video",
          url: data.video.url,
          prompt,
          timestamp: new Date(),
          duration,
        };

        setResult(newResult);
        setRecentGenerations((prev) => [newResult, ...prev].slice(0, 10));
        setLogs((prev) => [...prev, `Completed in ${duration.toFixed(1)}s`]);
        setStatus("completed");
      } else if (mode === "logo") {
        setLogs((prev) => [...prev, "Starting logo animation..."]);

        let imageUrl = uploadedImageUrl;
        if (uploadedFile && !uploadedImageUrl) {
          setLogs((prev) => [...prev, "Uploading logo..."]);
          imageUrl = await uploadFile(uploadedFile);
          setLogs((prev) => [...prev, "Logo uploaded successfully"]);
        }

        const animationPrompt = prompt.trim() ||
          "Subtle animation, logo gently breathing and pulsing, professional motion graphics, seamless loop";

        const response = await animateLogo(imageUrl, animationPrompt, handleLogMessage);

        const data = response.data as FalVideoResult;
        const duration = startTime ? (Date.now() - startTime) / 1000 : 0;

        const newResult: GenerationResult = {
          type: "video",
          url: data.video.url,
          prompt: animationPrompt,
          timestamp: new Date(),
          duration,
        };

        setResult(newResult);
        setRecentGenerations((prev) => [newResult, ...prev].slice(0, 10));
        setLogs((prev) => [...prev, `Completed in ${duration.toFixed(1)}s`]);
        setStatus("completed");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Generation failed");
      setStatus("error");
      setLogs((prev) => [...prev, `Error: ${err instanceof Error ? err.message : "Unknown error"}`]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploadedImageUrl("");
    }
  };

  const handleSaveAsset = async () => {
    if (!result) return;

    try {
      const filename = `${result.type}-${Date.now()}`;
      const response = await fetch("/api/fal/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: result.url,
          filename,
          type: result.type,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({ ...result, saved: true, savedPath: data.publicUrl });
        setLogs((prev) => [...prev, `Saved to ${data.publicUrl}`]);
      } else {
        setError(data.error || "Failed to save asset");
      }
    } catch {
      setError("Failed to save asset");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#5F9468] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-[#5F9468] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-[#5F9468] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Title */}
      <h1 className="text-2xl font-bold text-[#1C1C1C] mb-6">Generate Assets</h1>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6">
        {(["image", "video", "logo"] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setResult(null);
              setError(null);
              setLogs([]);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m
                ? "bg-[#5F9468] text-white"
                : "bg-white border border-[#E8E6E1] text-[#666] hover:border-[#5F9468] hover:text-[#5F9468]"
            }`}
          >
            {m === "image" ? "Image" : m === "video" ? "Video" : "Animate Logo"}
          </button>
        ))}
      </div>

      {/* Generation Form */}
      <div className="bg-white border border-[#E8E6E1] rounded-xl p-6 mb-6">
        {/* Prompt */}
        <div className="mb-4">
          <label className="block text-sm text-[#666] mb-2">
            {mode === "logo" ? "Animation Prompt (optional)" : "Prompt"}
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === "logo"
                ? "Subtle animation, logo gently breathing and pulsing, professional motion graphics, seamless loop"
                : "Abstract flowing shapes in sage green #5F9468, soft gradients, minimal, professional..."
            }
            className="w-full bg-[#FAFAF8] border border-[#E8E6E1] rounded-xl px-4 py-3 text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468] transition-colors resize-none"
            rows={3}
          />
        </div>

        {/* Image Upload (for video and logo modes) */}
        {(mode === "video" || mode === "logo") && (
          <div className="mb-4">
            <label className="block text-sm text-[#666] mb-2">
              {mode === "logo" ? "Upload Logo" : "Upload Image (optional)"}
            </label>
            <div className="flex gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="flex-1 bg-[#FAFAF8] border border-[#E8E6E1] rounded-xl px-4 py-3 text-[#1C1C1C] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#5F9468]/10 file:text-[#5F9468] hover:file:bg-[#5F9468]/20 cursor-pointer"
              />
              <span className="text-[#999] self-center">or</span>
              <input
                type="text"
                value={uploadedImageUrl}
                onChange={(e) => {
                  setUploadedImageUrl(e.target.value);
                  setUploadedFile(null);
                }}
                placeholder="Paste image URL..."
                className="flex-1 bg-[#FAFAF8] border border-[#E8E6E1] rounded-xl px-4 py-3 text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468] transition-colors"
              />
            </div>
            {uploadedFile && (
              <p className="text-sm text-[#666] mt-2">
                Selected: {uploadedFile.name}
              </p>
            )}
          </div>
        )}

        {/* Options Row */}
        <div className="flex gap-4 mb-4">
          {mode === "image" && (
            <div className="flex-1">
              <label className="block text-sm text-[#666] mb-2">Size</label>
              <select
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value as ImageSize)}
                className="w-full bg-[#FAFAF8] border border-[#E8E6E1] rounded-xl px-4 py-3 text-[#1C1C1C] focus:outline-none focus:border-[#5F9468] transition-colors"
              >
                <option value="square_hd">Square HD (1024x1024)</option>
                <option value="square">Square (512x512)</option>
                <option value="landscape_16_9">Landscape 16:9</option>
                <option value="landscape_4_3">Landscape 4:3</option>
                <option value="portrait_16_9">Portrait 16:9</option>
                <option value="portrait_4_3">Portrait 4:3</option>
              </select>
            </div>
          )}
          <div className={mode === "image" ? "flex-1" : "w-48"}>
            <label className="block text-sm text-[#666] mb-2">Seed (optional)</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Random"
              className="w-full bg-[#FAFAF8] border border-[#E8E6E1] rounded-xl px-4 py-3 text-[#1C1C1C] placeholder-[#999] focus:outline-none focus:border-[#5F9468] transition-colors"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={status === "generating"}
          className="w-full bg-[#5F9468] text-white font-medium py-3 px-6 rounded-xl hover:bg-[#4F8357] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === "generating" ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </>
          ) : (
            `Generate ${mode === "image" ? "Image" : mode === "video" ? "Video" : "Animation"}`
          )}
        </button>
      </div>

      {/* Logs */}
      {logs.length > 0 && (
        <div className="bg-white border border-[#E8E6E1] rounded-xl p-4 mb-6">
          <h3 className="text-sm font-medium text-[#666] mb-2">Logs</h3>
          <div className="font-mono text-xs text-[#999] space-y-1 max-h-32 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {result && (
        <div className="bg-white border border-[#E8E6E1] rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-[#1C1C1C] mb-4">Preview</h3>
          <div className="flex justify-center mb-4">
            {result.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={result.url}
                alt="Generated image"
                className="max-w-full max-h-[500px] rounded-xl"
              />
            ) : (
              <video
                src={result.url}
                controls
                autoPlay
                loop
                muted
                className="max-w-full max-h-[500px] rounded-xl"
              />
            )}
          </div>
          <p className="text-sm text-[#666] mb-4">
            Completed in {result.duration?.toFixed(1)}s
            {result.saved && (
              <span className="text-[#5F9468] ml-2">
                Saved to {result.savedPath}
              </span>
            )}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleSaveAsset}
              disabled={result.saved}
              className="px-4 py-2 bg-[#FAFAF8] border border-[#E8E6E1] text-[#1C1C1C] rounded-lg hover:border-[#5F9468] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {result.saved ? "Saved" : "Save to /public"}
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(result.url)}
              className="px-4 py-2 bg-[#FAFAF8] border border-[#E8E6E1] text-[#1C1C1C] rounded-lg hover:border-[#5F9468] transition-colors"
            >
              Copy URL
            </button>
            <a
              href={result.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#FAFAF8] border border-[#E8E6E1] text-[#1C1C1C] rounded-lg hover:border-[#5F9468] transition-colors"
            >
              Download
            </a>
          </div>
        </div>
      )}

      {/* Recent Generations */}
      {recentGenerations.length > 0 && (
        <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E8E6E1]">
            <h2 className="text-lg font-semibold text-[#1C1C1C]">Recent Generations</h2>
          </div>
          <div className="divide-y divide-[#E8E6E1]">
            {recentGenerations.map((gen, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    gen.type === "image"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-purple-50 text-purple-700"
                  }`}>
                    {gen.type}
                  </span>
                  <span className="text-sm text-[#666] truncate max-w-md">
                    {gen.prompt.slice(0, 60)}{gen.prompt.length > 60 ? "..." : ""}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {gen.duration && (
                    <span className="text-xs text-[#999]">
                      {gen.duration.toFixed(1)}s
                    </span>
                  )}
                  <span className="text-xs text-[#999]">
                    ~${gen.type === "image" ? "0.025" : "0.25"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
