
const VIDEO_BASE_URL = process.env.VIDEO_API_URL || "";
const CREATE_TASK_PATH = process.env.VIDEO_CREATE_TASK_PATH || "/api/v1/jobs/createTask";
const QUERY_TASK_PATH = process.env.VIDEO_QUERY_TASK_PATH || "/api/v1/jobs/recordInfo";

const MODEL_TEXT_TO_VIDEO = "wan/2-6-text-to-video";
const MODEL_IMAGE_TO_VIDEO = "wan/2-6-image-to-video";

type CreateTaskResponse = {
    code: number;
    msg: string;
    data?: {
        taskId?: string;
    };
};

type QueryTaskResponse = {
    code: number;
    msg?: string; // Standard
    message?: string; // Occasional
    data?: {
        taskId?: string;
        model?: string;
        state?: string; // waiting, queueing, generating, success, fail
        param?: string;
        resultJson?: string;
        failCode?: string;
        failMsg?: string;
    };
};

export interface VideoTaskStatus {
    state: "waiting" | "generating" | "success" | "fail";
    videoUrl?: string; // If success
    error?: string; // If fail
    progress?: number;
    input?: {
        prompt?: string;
        duration?: string;
        resolution?: string;
    };
    failMsg?: string;
}

export async function createVideoTask({
    prompt,
    imageUrls,
    duration = "5",
    resolution = "1080p",
    multiShots = false
}: {
    prompt: string;
    imageUrls?: string[];
    duration?: string;
    resolution?: string;
    multiShots?: boolean;
}): Promise<{ taskId: string }> {
    const token = await getVideoToken();

    const isImageToVideo = imageUrls && imageUrls.length > 0;
    const model = isImageToVideo ? MODEL_IMAGE_TO_VIDEO : MODEL_TEXT_TO_VIDEO;

    console.log(`[Video] Creating task with model: ${model}`);

    const inputPayload: Record<string, unknown> = {
        prompt: prompt,
        duration: duration,
        resolution: resolution,
        multi_shots: multiShots
    };

    if (isImageToVideo) {
        inputPayload.image_urls = imageUrls;
    }

    const createPayload = {
        model: model,
        input: inputPayload
    };

    const createEndpoint = `${VIDEO_BASE_URL}${CREATE_TASK_PATH}`;
    const createResponse = await requestJson<CreateTaskResponse>(createEndpoint, token, createPayload);

    if (createResponse.code !== 200 || !createResponse.data?.taskId) {
        throw new Error(`Video create task failed: ${createResponse.msg || "unknown error"}`);
    }

    const taskId = createResponse.data.taskId;
    console.log(`[Video] Task created: ${taskId}`);

    return { taskId };
}

export async function queryVideoTaskStatus(taskId: string): Promise<VideoTaskStatus> {
    const token = await getVideoToken();
    const queryEndpoint = `${VIDEO_BASE_URL}${QUERY_TASK_PATH}?taskId=${encodeURIComponent(taskId)}`;

    const response = await requestGet<QueryTaskResponse>(queryEndpoint, token);

    if (response.code !== 200) {
        const errorMsg = response.msg || response.message || `code ${response.code}`;
        if (response.code === 429 || response.code === 202) {
            console.warn(`[Video] Transient error (${response.code}), treating as waiting`);
            return { state: "waiting" };
        }
        return { state: "fail", error: errorMsg };
    }

    if (!response.data) {
        return { state: "fail", error: "Empty response data" };
    }

    const { state, resultJson, failCode, failMsg, param } = response.data;
    const input = parseTaskInput(param);

    const normalizedState = normalizeState(state);

    if (normalizedState === "success") {
        const videoUrl = parseVideoUrl(resultJson);
        if (!videoUrl) {
            return { state: "fail", error: "Success but no video URL found" };
        }
        return { state: "success", videoUrl, input };
    }

    if (normalizedState === "fail") {
        return { state: "fail", error: failMsg || failCode || "Generation failed", input, failMsg };
    }

    return { state: normalizedState, input };
}

export async function callVideoProvider({
    promptJson,
    referenceImageUrl,
    aspectRatio,
    imageSize
}: any) {

    const prompt = typeof promptJson === 'string' ? promptJson : (promptJson.positive || "");
    const imageUrls = referenceImageUrl ? [referenceImageUrl] : undefined;

    const { taskId } = await createVideoTask({
        prompt,
        imageUrls
    });

    return await pollForResult(taskId);
}

async function pollForResult(taskId: string): Promise<{ video_url: string }> {
    const maxAttempts = 120; // 10 mins
    for (let i = 0; i < maxAttempts; i++) {
        const status = await queryVideoTaskStatus(taskId);
        if (status.state === "success" && status.videoUrl) {
            return { video_url: status.videoUrl };
        }
        if (status.state === "fail") {
            throw new Error(status.error || "Video generation failed");
        }
        await delay(5000);
    }
    throw new Error("Video generation timed out");
}

function normalizeState(state?: string): "waiting" | "generating" | "success" | "fail" {
    if (!state) return "waiting";
    const s = state.toLowerCase();
    if (s === "success" || s === "succeeded") return "success";
    if (s === "fail" || s === "failed" || s === "failure") return "fail";
    if (s === "generating" || s === "running" || s === "processing") return "generating";
    return "waiting";
}

function parseVideoUrl(resultJson?: string): string | undefined {
    if (!resultJson) return undefined;
    try {
        const parsed = JSON.parse(resultJson);
        if (parsed.videoUrl) return parsed.videoUrl;
        if (parsed.url) return parsed.url;
        if (Array.isArray(parsed) && parsed[0]?.url) return parsed[0].url;
        if (parsed.results?.[0]?.url) return parsed.results[0].url;
        if (typeof parsed === 'string' && parsed.startsWith('http')) return parsed;
    } catch {
    }
    return undefined;
}

function parseTaskInput(param?: string) {
    if (!param) return undefined;
    try {
        return JSON.parse(param);
    } catch {
        return undefined;
    }
}

async function getVideoToken(): Promise<string> {
    const token = process.env.VIDEO_API_TOKEN;
    if (!token) {
        throw new Error("Missing required environment variable: VIDEO_API_TOKEN");
    }
    return token;
}

async function requestJson<T>(url: string, token: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
    });
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
    }
}

async function requestGet<T>(url: string, token: string): Promise<T> {
    const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        throw new Error(`Invalid JSON response: ${text.slice(0, 200)}`);
    }
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}