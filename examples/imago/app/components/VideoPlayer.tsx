"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useLanguage } from "../providers/LanguageProvider";
import { PUBLIC_CONFIG } from "@lib/publicEnv";

type VideoPlayerProps = {
    src: string;
    autoPlay?: boolean;
    loop?: boolean;
    poster?: string;
    className?: string; // Added className prop
};

export function VideoPlayer({ src, autoPlay = true, loop = true, poster, className }: VideoPlayerProps) {
    const { lang } = useLanguage();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const hideTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.volume = volume;
            videoRef.current.muted = isMuted;
        }
    }, [volume, isMuted]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handlePlayPause = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }, []);

    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        setCurrentTime(video.currentTime);
        if (!Number.isFinite(video.duration) || video.duration <= 0) {
            setProgress(0);
            return;
        }
        setProgress((video.currentTime / video.duration) * 100);
    }, []);

    const handleLoadedMetadata = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        setDuration(video.duration);
    }, []);

    const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        if (!video) return;
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
    }, []);

    const handleDownload = useCallback(async () => {
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${PUBLIC_CONFIG.downloadPrefix}-video-${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            window.open(src, "_blank");
        }
    }, [src]);

    const handleMouseMove = useCallback(() => {
        setShowControls(true);
        if (hideTimeoutRef.current) {
            window.clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = window.setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 2500);
    }, [isPlaying]);

    useEffect(() => {
        return () => {
            if (hideTimeoutRef.current) {
                window.clearTimeout(hideTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            className={`relative w-full h-full group ${className || ""}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={src}
                autoPlay={autoPlay}
                loop={loop}
                poster={poster}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={handlePlayPause}
            />

            
            <div
                className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 transition-opacity duration-300 ${showControls ? "opacity-100" : "opacity-0"
                    }`}
            >
                
                <div
                    className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-3 group/progress"
                    onClick={handleProgressClick}
                >
                    <div
                        className="h-full bg-white rounded-full relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                    </div>
                </div>

                
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        
                        <button
                            onClick={handlePlayPause}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? (
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <rect x="6" y="4" width="4" height="16" rx="1" />
                                    <rect x="14" y="4" width="4" height="16" rx="1" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                    <polygon points="5,3 19,12 5,21" />
                                </svg>
                            )}
                        </button>


                        
                        <span className="text-xs text-white/70 font-mono tracking-wider">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>

                        
                        <div className="flex items-center gap-2 group/volume relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const video = videoRef.current;
                                    if (!video) return;
                                    video.muted = !video.muted;
                                    setIsMuted(video.muted);
                                    if (!video.muted && volume === 0) {
                                        video.volume = 1;
                                        setVolume(1);
                                    }
                                }}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                            >
                                {isMuted || volume === 0 ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </svg>
                                ) : volume < 0.5 ? (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m-8.95-10.53L5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                )}
                            </button>

                            
                            <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                                <div
                                    className="h-8 flex items-center px-2 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const video = videoRef.current;
                                        if (!video) return;
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const newVolume = Math.max(0, Math.min(1, (e.clientX - rect.left - 8) / (rect.width - 16)));
                                        video.volume = newVolume;
                                        video.muted = newVolume === 0;
                                        setVolume(newVolume);
                                        setIsMuted(newVolume === 0);
                                    }}
                                >
                                    <div className="w-full h-1 bg-white/20 rounded-full relative">
                                        <div
                                            className="absolute left-0 top-0 h-full bg-white rounded-full"
                                            style={{ width: `${volume * 100}%` }}
                                        />
                                        <div
                                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md"
                                            style={{ left: `${volume * 100}%`, marginLeft: '-6px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <button
                        onClick={handleDownload}
                        className="group/btn flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white hover:text-black transition-all duration-300 text-xs text-white tracking-[0.15em] uppercase hover:scale-105 hover:shadow-lg"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        {lang === "zh" ? "下载" : "Download"}
                    </button>
                </div>
            </div>

            
            {!isPlaying && (
                <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={handlePlayPause}
                >
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <polygon points="5,3 19,12 5,21" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}