"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

export interface ScheduledPost {
  id: string;
  platform: string;
  text: string;
  image_url: string | null;
  markdown_content: string | null;
  as_organization: boolean;
  scheduled_at: string;
  status: "pending" | "published" | "failed" | "cancelled";
  error_message: string | null;
  post_id: string | null;
  created_at: string;
  published_at: string | null;
}

interface DocumentEditorProps {
  content: string;
  onChange: (content: string) => void;
  isAgentWriting: boolean;
  connectedPlatforms?: string[];
  onPostToSocial?: (platform: string, text: string, imageUrl?: string, asOrganization?: boolean, markdownContent?: string) => Promise<void>;
  linkedInOrgName?: string | null;
  onSchedulePost?: (platform: string, text: string, scheduledAt: string, imageUrl?: string, asOrganization?: boolean, markdownContent?: string) => Promise<void>;
  scheduledPosts?: ScheduledPost[];
  onCancelScheduled?: (id: string) => Promise<void>;
  onRefreshScheduled?: () => Promise<void>;
}

export default function DocumentEditor({ content, onChange, isAgentWriting, connectedPlatforms = [], onPostToSocial, linkedInOrgName, onSchedulePost, scheduledPosts = [], onCancelScheduled, onRefreshScheduled }: DocumentEditorProps) {
  const [copied, setCopied] = useState<"text" | "md" | null>(null);
  const [showSource, setShowSource] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"success" | null>(null);
  const [postingState, setPostingState] = useState<Record<string, "idle" | "posting" | "posted" | "error">>({});
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [showScheduledList, setShowScheduledList] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when agent writes
  useEffect(() => {
    if (isAgentWriting && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isAgentWriting]);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  // Extract image URLs from markdown content
  const imageUrls = Array.from(content.matchAll(/!\[.*?\]\((.*?)\)/g)).map((m) => m[1]);

  const copyAsText = () => {
    const plain = content
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/^\s*[-*]\s+/gm, "- ")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      .replace(/^---+$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    navigator.clipboard.writeText(plain);
    setCopied("text");
    setTimeout(() => setCopied(null), 2000);
  };

  const copyAsMarkdown = () => {
    navigator.clipboard.writeText(content);
    setCopied("md");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSourceChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert("Image too large. Max size: 50MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/fal/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success && data.url) {
        const imageMarkdown = `\n\n![${file.name}](${data.url})`;
        onChange(content + imageMarkdown);
        setUploadStatus("success");
        setTimeout(() => setUploadStatus(null), 3000);
        // Scroll to bottom after image renders
        setTimeout(() => {
          if (contentRef.current) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
          }
        }, 100);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith("image/")) return;

      if (file.size > 50 * 1024 * 1024) {
        alert("Image too large. Max size: 50MB");
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/fal/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (data.success && data.url) {
          const imageMarkdown = `\n\n![${file.name}](${data.url})`;
          onChange(content + imageMarkdown);
          setUploadStatus("success");
          setTimeout(() => setUploadStatus(null), 3000);
          setTimeout(() => {
            if (contentRef.current) {
              contentRef.current.scrollTop = contentRef.current.scrollHeight;
            }
          }, 100);
        } else {
          alert(data.error || "Upload failed");
        }
      } catch {
        alert("Upload failed");
      } finally {
        setIsUploading(false);
      }
    },
    [content, onChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeImage = (url: string) => {
    // Remove the markdown image line containing this URL
    const updated = content.replace(new RegExp(`\\n?!\\[.*?\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)\\n?`, "g"), "\n");
    onChange(updated.trim());
  };

  const getPlainText = useCallback(() => {
    let text = content
      // Strip markdown headings (# Title) but keep the text
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/`(.+?)`/g, "$1")
      .replace(/^\s*[-*]\s+/gm, "- ")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[(.+?)\]\(.+?\)/g, "$1")
      .replace(/^---+$/gm, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    // Strip title-like first line (e.g. "LinkedIn Post — Feb 21, 2026")
    // These are metadata headers the agent sometimes adds, not actual post content
    const lines = text.split("\n");
    if (lines.length > 1) {
      const firstLine = lines[0].trim();
      const isTitleLine = /^(LinkedIn|X|Twitter|Medium|Instagram|Facebook)\s+(Post|Thread|Article)/i.test(firstLine);
      if (isTitleLine) {
        text = lines.slice(1).join("\n").trim();
      }
    }
    return text;
  }, [content]);

  const handlePost = useCallback(async (platform: string, asOrganization?: boolean) => {
    if (!onPostToSocial || !content.trim()) return;
    const key = `${platform}${asOrganization ? "-org" : ""}`;
    setPostingState((prev) => ({ ...prev, [key]: "posting" }));

    const plainText = getPlainText();
    const firstImage = imageUrls[0] || undefined;

    try {
      // For Medium, send the raw markdown content so articles preserve formatting
      const mdContent = platform === "medium" ? content : undefined;
      await onPostToSocial(platform, plainText, firstImage, asOrganization, mdContent);
      setPostingState((prev) => ({ ...prev, [key]: "posted" }));
    } catch {
      setPostingState((prev) => ({ ...prev, [key]: "error" }));
    }
  }, [onPostToSocial, content, getPlainText, imageUrls]);

  const handleSchedule = useCallback(async (platform: string, asOrganization?: boolean) => {
    if (!onSchedulePost || !content.trim() || !scheduledAt) return;
    const key = `${platform}${asOrganization ? "-org" : ""}`;
    setPostingState((prev) => ({ ...prev, [key]: "posting" }));

    const plainText = getPlainText();
    const firstImage = imageUrls[0] || undefined;

    try {
      const mdContent = platform === "medium" ? content : undefined;
      // Convert local datetime-local value to UTC ISO string so the server gets the correct time
      const scheduledAtISO = new Date(scheduledAt).toISOString();
      await onSchedulePost(platform, plainText, scheduledAtISO, firstImage, asOrganization, mdContent);
      setPostingState((prev) => ({ ...prev, [key]: "posted" }));
      // Reset after 3s
      setTimeout(() => {
        setPostingState((prev) => ({ ...prev, [key]: "idle" }));
      }, 3000);
    } catch {
      setPostingState((prev) => ({ ...prev, [key]: "error" }));
    }
  }, [onSchedulePost, content, scheduledAt, getPlainText, imageUrls]);

  const pendingScheduled = scheduledPosts.filter((p) => p.status === "pending");
  const failedScheduled = scheduledPosts.filter((p) => p.status === "failed");

  const formatScheduledTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  };

  const platformLabel = (p: string) => {
    const labels: Record<string, string> = { x: "X", linkedin: "LinkedIn", linkedin_org: "Company Page", instagram: "Instagram", medium: "Medium", facebook: "Facebook" };
    return labels[p] || p;
  };

  const hasAnyPlatform = connectedPlatforms.length > 0;

  if (!content && !showSource) {
    return (
      <div
        className="flex flex-col h-full"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-10 h-10 text-[#E8E6E1] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-sm text-[#999]">No document yet</p>
            <p className="text-xs text-[#ccc] mt-1">Send a message to start drafting</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Slim toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#E8E6E1] shrink-0">
        <div className="flex items-center gap-2">
          {isAgentWriting && (
            <span className="flex items-center gap-1.5 text-xs text-[#5F9468] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#5F9468] animate-pulse" />
              Writing...
            </span>
          )}
          {isUploading && (
            <span className="flex items-center gap-1.5 text-xs text-[#5F9468] font-medium">
              <span className="w-3 h-3 border-2 border-[#5F9468] border-t-transparent rounded-full animate-spin" />
              Uploading image...
            </span>
          )}
          {uploadStatus === "success" && !isUploading && (
            <span className="flex items-center gap-1.5 text-xs text-[#5F9468] font-medium animate-in fade-in">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Image added
            </span>
          )}
          {!isAgentWriting && !isUploading && !uploadStatus && content && (
            <span className="text-xs text-[#999]">
              {wordCount} words · {charCount} chars
              {imageUrls.length > 0 && ` · ${imageUrls.length} image${imageUrls.length > 1 ? "s" : ""}`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Image upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#999] hover:text-[#5F9468] border border-transparent hover:border-[#E8E6E1] rounded-lg transition-all disabled:opacity-50"
            title="Add image"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </button>

          {/* Source toggle */}
          <button
            onClick={() => setShowSource(!showSource)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
              showSource
                ? "text-[#5F9468] bg-[#5F9468]/10 border border-[#5F9468]/30"
                : "text-[#999] hover:text-[#666] border border-transparent hover:border-[#E8E6E1]"
            }`}
            title="Toggle markdown source"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
          </button>

          {/* Copy Text */}
          <button
            onClick={copyAsText}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#999] hover:text-[#5F9468] border border-transparent hover:border-[#E8E6E1] rounded-lg transition-all"
            title="Copy as plain text"
          >
            {copied === "text" ? (
              <svg className="w-3 h-3 text-[#5F9468]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            )}
            Text
          </button>

          {/* Copy Markdown */}
          <button
            onClick={copyAsMarkdown}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#999] hover:text-[#5F9468] border border-transparent hover:border-[#E8E6E1] rounded-lg transition-all"
            title="Copy as markdown"
          >
            {copied === "md" ? (
              <svg className="w-3 h-3 text-[#5F9468]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
              </svg>
            )}
            MD
          </button>
        </div>
      </div>

      {/* Content — rendered markdown or source */}
      {showSource ? (
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleSourceChange}
          className="flex-1 min-h-0 p-4 text-sm text-[#1C1C1C] bg-white resize-none focus:outline-none font-mono leading-relaxed"
        />
      ) : (
        <div ref={contentRef} className="flex-1 min-h-0 overflow-y-auto p-4">
          <div className="prose prose-sm max-w-none prose-headings:text-[#1C1C1C] prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-p:text-[#444] prose-p:my-1.5 prose-p:leading-relaxed prose-a:text-[#5F9468] prose-strong:text-[#1C1C1C] prose-li:text-[#444] prose-li:my-0.5 prose-ul:my-2 prose-ol:my-2 prose-hr:border-[#E8E6E1] prose-hr:my-4 prose-code:text-[#5F9468] prose-code:bg-[#5F9468]/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:before:content-none prose-code:after:content-none prose-pre:bg-white prose-pre:border prose-pre:border-[#E8E6E1] prose-pre:rounded-lg prose-blockquote:border-[#5F9468] prose-blockquote:text-[#555]">
            <ReactMarkdown
              components={{
                p: ({ node, children, ...props }) => {
                  const hasImage = node?.children?.some(
                    (child) => "tagName" in child && child.tagName === "img"
                  );
                  if (hasImage) return <div {...props}>{children}</div>;
                  return <p {...props}>{children}</p>;
                },
                img: ({ src, alt }) => {
                  const imgSrc = typeof src === "string" ? src : "";
                  return (
                    <figure className="my-4 group relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgSrc}
                        alt={alt || ""}
                        className="w-full rounded-lg border border-[#E8E6E1]"
                      />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <a
                          href={imgSrc}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-white/90 border border-[#E8E6E1] text-[#666] hover:text-[#5F9468] transition-colors"
                          title="Download"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                          </svg>
                        </a>
                        <button
                          onClick={() => removeImage(imgSrc)}
                          className="p-1.5 rounded-lg bg-white/90 border border-[#E8E6E1] text-[#666] hover:text-red-500 transition-colors"
                          title="Remove image"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      {alt && alt !== "image" && (
                        <figcaption className="text-xs text-[#999] mt-1.5">{alt}</figcaption>
                      )}
                    </figure>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Post bar */}
      {content.trim() && (hasAnyPlatform || onPostToSocial) && (
        <div className="shrink-0 border-t border-[#E8E6E1] px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
          {/* Mode toggle */}
          <div className="flex items-center bg-[#F5F4F0] rounded-full p-0.5 mr-1">
            <button
              onClick={() => setScheduleMode(false)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] transition-all ${
                !scheduleMode ? "bg-white text-[#1C1C1C] shadow-sm" : "text-[#999] hover:text-[#666]"
              }`}
            >
              Post now
            </button>
            <button
              onClick={() => setScheduleMode(true)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.1em] transition-all flex items-center gap-1 ${
                scheduleMode ? "bg-white text-[#1C1C1C] shadow-sm" : "text-[#999] hover:text-[#666]"
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Schedule
            </button>
          </div>

          {/* Date/time picker when in schedule mode */}
          {scheduleMode && (
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
              className="px-2.5 py-1.5 text-xs border border-[#E8E6E1] rounded-lg bg-white text-[#1C1C1C] focus:outline-none focus:border-[#5F9468]"
            />
          )}

          {/* X / Twitter */}
          {connectedPlatforms.includes("x") && (
            <button
              onClick={() => scheduleMode ? handleSchedule("x") : handlePost("x")}
              disabled={postingState["x"] === "posting" || (scheduleMode && !scheduledAt)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                postingState["x"] === "posted"
                  ? "bg-[#5F9468]/10 text-[#5F9468] border border-[#5F9468]/30"
                  : postingState["x"] === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-white border border-[#E8E6E1] text-[#1C1C1C] hover:border-[#1C1C1C]/30 hover:bg-[#F5F4F0]"
              } disabled:opacity-60`}
            >
              {postingState["x"] === "posting" ? (
                <span className="w-3 h-3 border-2 border-[#1C1C1C] border-t-transparent rounded-full animate-spin" />
              ) : postingState["x"] === "posted" ? (
                scheduleMode ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              )}
              {postingState["x"] === "posted" ? (scheduleMode ? "Scheduled!" : "Posted") : postingState["x"] === "error" ? "Failed" : (scheduleMode ? "Schedule X" : "X")}
            </button>
          )}

          {/* LinkedIn Personal */}
          {connectedPlatforms.includes("linkedin") && (
            <button
              onClick={() => scheduleMode ? handleSchedule("linkedin") : handlePost("linkedin")}
              disabled={postingState["linkedin"] === "posting" || (scheduleMode && !scheduledAt)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                postingState["linkedin"] === "posted"
                  ? "bg-[#5F9468]/10 text-[#5F9468] border border-[#5F9468]/30"
                  : postingState["linkedin"] === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-white border border-[#E8E6E1] text-[#0077B5] hover:border-[#0077B5]/30 hover:bg-[#0077B5]/5"
              } disabled:opacity-60`}
            >
              {postingState["linkedin"] === "posting" ? (
                <span className="w-3 h-3 border-2 border-[#0077B5] border-t-transparent rounded-full animate-spin" />
              ) : postingState["linkedin"] === "posted" ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              )}
              {postingState["linkedin"] === "posted" ? (scheduleMode ? "Scheduled!" : "Posted") : postingState["linkedin"] === "error" ? "Failed" : (scheduleMode ? "Schedule LinkedIn" : "LinkedIn")}
            </button>
          )}

          {/* LinkedIn Company Page */}
          {connectedPlatforms.includes("linkedin_org") && (
            <button
              onClick={() => scheduleMode ? handleSchedule("linkedin", true) : handlePost("linkedin", true)}
              disabled={postingState["linkedin-org"] === "posting" || (scheduleMode && !scheduledAt)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                postingState["linkedin-org"] === "posted"
                  ? "bg-[#5F9468]/10 text-[#5F9468] border border-[#5F9468]/30"
                  : postingState["linkedin-org"] === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-white border border-[#E8E6E1] text-[#0077B5] hover:border-[#0077B5]/30 hover:bg-[#0077B5]/5"
              } disabled:opacity-60`}
            >
              {postingState["linkedin-org"] === "posting" ? (
                <span className="w-3 h-3 border-2 border-[#0077B5] border-t-transparent rounded-full animate-spin" />
              ) : postingState["linkedin-org"] === "posted" ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              )}
              {postingState["linkedin-org"] === "posted" ? (scheduleMode ? "Scheduled!" : "Posted") : postingState["linkedin-org"] === "error" ? "Failed" : (scheduleMode ? `Schedule ${linkedInOrgName || "Company"}` : (linkedInOrgName || "Company Page"))}
            </button>
          )}

          {/* Instagram */}
          {connectedPlatforms.includes("instagram") && (
            <button
              onClick={() => scheduleMode ? handleSchedule("instagram") : handlePost("instagram")}
              disabled={postingState["instagram"] === "posting" || !imageUrls.length || (scheduleMode && !scheduledAt)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                postingState["instagram"] === "posted"
                  ? "bg-[#5F9468]/10 text-[#5F9468] border border-[#5F9468]/30"
                  : postingState["instagram"] === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-white border border-[#E8E6E1] text-[#E1306C] hover:border-[#E1306C]/30 hover:bg-[#E1306C]/5"
              } disabled:opacity-60`}
              title={!imageUrls.length ? "Instagram requires an image" : undefined}
            >
              {postingState["instagram"] === "posting" ? (
                <span className="w-3 h-3 border-2 border-[#E1306C] border-t-transparent rounded-full animate-spin" />
              ) : postingState["instagram"] === "posted" ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              )}
              {postingState["instagram"] === "posted" ? (scheduleMode ? "Scheduled!" : "Posted") : postingState["instagram"] === "error" ? "Failed" : (scheduleMode ? "Schedule Instagram" : "Instagram")}
              {!imageUrls.length && postingState["instagram"] !== "posted" && postingState["instagram"] !== "error" && (
                <svg className="w-3 h-3 text-[#999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              )}
            </button>
          )}

          {/* Medium */}
          {connectedPlatforms.includes("medium") && (
            <button
              onClick={() => scheduleMode ? handleSchedule("medium") : handlePost("medium")}
              disabled={postingState["medium"] === "posting" || (scheduleMode && !scheduledAt)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                postingState["medium"] === "posted"
                  ? "bg-[#5F9468]/10 text-[#5F9468] border border-[#5F9468]/30"
                  : postingState["medium"] === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-white border border-[#E8E6E1] text-[#00AB6C] hover:border-[#00AB6C]/30 hover:bg-[#00AB6C]/5"
              } disabled:opacity-60`}
            >
              {postingState["medium"] === "posting" ? (
                <span className="w-3 h-3 border-2 border-[#00AB6C] border-t-transparent rounded-full animate-spin" />
              ) : postingState["medium"] === "posted" ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
                </svg>
              )}
              {postingState["medium"] === "posted" ? (scheduleMode ? "Scheduled!" : "Draft saved") : postingState["medium"] === "error" ? "Failed" : (scheduleMode ? "Schedule Medium" : "Medium")}
            </button>
          )}

          {/* Facebook Page */}
          {connectedPlatforms.includes("facebook") && (
            <button
              onClick={() => scheduleMode ? handleSchedule("facebook") : handlePost("facebook")}
              disabled={postingState["facebook"] === "posting" || (scheduleMode && !scheduledAt)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                postingState["facebook"] === "posted"
                  ? "bg-[#5F9468]/10 text-[#5F9468] border border-[#5F9468]/30"
                  : postingState["facebook"] === "error"
                  ? "bg-red-50 text-red-600 border border-red-200"
                  : "bg-white border border-[#E8E6E1] text-[#1877F2] hover:border-[#1877F2]/30 hover:bg-[#1877F2]/5"
              } disabled:opacity-60`}
            >
              {postingState["facebook"] === "posting" ? (
                <span className="w-3 h-3 border-2 border-[#1877F2] border-t-transparent rounded-full animate-spin" />
              ) : postingState["facebook"] === "posted" ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
              {postingState["facebook"] === "posted" ? (scheduleMode ? "Scheduled!" : "Posted") : postingState["facebook"] === "error" ? "Failed" : (scheduleMode ? "Schedule Facebook" : "Facebook")}
            </button>
          )}

          {/* No platforms connected hint */}
          {!hasAnyPlatform && (
            <span className="text-xs text-[#999]">Connect X, LinkedIn, or Instagram to post directly</span>
          )}
          </div>

          {/* Scheduled posts count & toggle */}
          {(pendingScheduled.length > 0 || failedScheduled.length > 0) && (
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  setShowScheduledList(!showScheduledList);
                  if (!showScheduledList && onRefreshScheduled) onRefreshScheduled();
                }}
                className="flex items-center gap-1.5 text-xs text-[#5F9468] hover:text-[#4F8357] font-medium transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {pendingScheduled.length} scheduled
                {failedScheduled.length > 0 && (
                  <span className="text-red-500">({failedScheduled.length} failed)</span>
                )}
                <svg className={`w-3 h-3 transition-transform ${showScheduledList ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}

          {/* Scheduled posts list */}
          {showScheduledList && (pendingScheduled.length > 0 || failedScheduled.length > 0) && (
            <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
              {pendingScheduled.map((post) => (
                <div key={post.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FAFAF8] border border-[#E8E6E1] text-xs">
                  <span className="font-medium text-[#1C1C1C]">{platformLabel(post.platform)}</span>
                  <span className="text-[#999] truncate flex-1 max-w-[200px]">{post.text.slice(0, 60)}{post.text.length > 60 ? "..." : ""}</span>
                  <span className="text-[#5F9468] whitespace-nowrap">{formatScheduledTime(post.scheduled_at)}</span>
                  {onCancelScheduled && (
                    <button
                      onClick={() => onCancelScheduled(post.id)}
                      className="text-[#999] hover:text-red-500 transition-colors shrink-0"
                      title="Cancel"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              {failedScheduled.map((post) => (
                <div key={post.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs">
                  <span className="font-medium text-red-600">{platformLabel(post.platform)}</span>
                  <span className="text-red-500 truncate flex-1">{post.error_message || "Failed"}</span>
                  <span className="text-[#999] whitespace-nowrap">{formatScheduledTime(post.scheduled_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
