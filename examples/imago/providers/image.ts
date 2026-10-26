import { buildTurboPrompt } from "@lib/turboPrompt";
import type { PromptJson } from "@lib/promptTypes";

const IMAGE_BASE_URL = process.env.IMAGE_API_URL || process.env.TURBO_API_URL || "";
const CREATE_TASK_PATH = process.env.IMAGE_CREATE_TASK_PATH || process.env.TURBO_CREATE_TASK_PATH || "/api/v1/jobs/createTask";
const QUERY_TASK_PATH = process.env.IMAGE_QUERY_TASK_PATH || process.env.TURBO_QUERY_TASK_PATH || "/api/v1/jobs/recordInfo";
const TASK_POLL_INTERVAL_MS = 5000;
const TASK_MAX_ATTEMPTS = 120;

type CreateTaskResponse = {
    code: number;
    msg: string;
    data?: {
        taskId?: string;
    };
};

type QueryTaskResponse = {
    code: number;
    msg?: string;
    data?: {
        taskId?: string;
        state?: string; // waiting, queuing, generating, success, fail
        resultJson?: string;
        failCode?: string;
        failMsg?: string;
    };
};

export async function callImageProvider({
    promptJson,
    referenceImageUrl,
    aspectRatio
}: {
    promptJson: PromptJson;
    referenceImageUrl?: string | null;
    aspectRatio?: string;
}) {
    const prompt = buildTurboPrompt(promptJson);
    console.log(`[Image] Generated prompt (${prompt.length} chars):`, prompt.slice(0, 200) + "...");

    const token = getImageToken();

    const supportedRatios = ["1:1", "4:3", "3:4", "16:9", "9:16"];
    const normalizedRatio = aspectRatio && supportedRatios.includes(aspectRatio) ? aspectRatio : "9:16";


    const inputPayload: Record<string, unknown> = {
        prompt: prompt,
        aspect_ratio: normalizedRatio
    };

    if (referenceImageUrl) {
        inputPayload.image_urls = [referenceImageUrl];
    }

    const createPayload = {
        model: "z-image", // Legacy model string the API expects? Or should this be configurable?
        input: inputPayload
    };

    const createEndpoint = `${IMAGE_BASE_URL}${CREATE_TASK_PATH}`;
    const createResponse = await requestJson<CreateTaskResponse>(createEndpoint, token, createPayload);

    if (createResponse.code !== 200 || !createResponse.data?.taskId) {
        throw new Error(`Image create task failed: ${createResponse.msg || "unknown error"}`);
    }

    const taskId = createResponse.data.taskId;
    console.log(`[Image] Task created: ${taskId}`);

    const result = await pollForResult(token, taskId);

    if (!result.imageUrl) {
        throw new Error("Image response missing image URL");
    }

    return { image_url: result.imageUrl };
}

async function pollForResult(token: string, taskId: string): Promise<{ imageUrl: string }> {
    const queryEndpoint = `${IMAGE_BASE_URL}${QUERY_TASK_PATH}?taskId=${encodeURIComponent(taskId)}`;

    for (let attempt = 0; attempt < TASK_MAX_ATTEMPTS; attempt++) {
        const response = await requestGet<QueryTaskResponse>(queryEndpoint, token);

        if (response.code === 200 && response.data) {
            const { state, resultJson, failCode, failMsg } = response.data;

            if (state === "success") {
                const imageUrl = parseResultUrl(resultJson);
                if (imageUrl) return { imageUrl };
                throw new Error("Image success but no result URL found");
            }

            if (state === "fail") {
                const errorMessage = failMsg || failCode || "Generation failed";
                throw new Error(errorMessage);
            }
        }

        await delay(TASK_POLL_INTERVAL_MS);
    }

    throw new Error("Image polling timed out");
}

function parseResultUrl(resultJson?: string): string | undefined {
    if (!resultJson) return undefined;
    try {
        const parsed = JSON.parse(resultJson);
        if (parsed.resultUrls?.[0]) return parsed.resultUrls[0];
        if (parsed.results?.[0]?.url) return parsed.results[0].url;
        if (parsed.url) return parsed.url;
        if (parsed.output?.url) return parsed.output.url;
        if (typeof parsed === "string" && parsed.startsWith("http")) return parsed;
    } catch {
        return undefined;
    }
    return undefined;
}

function getImageToken(): string {
    const token = process.env.IMAGE_API_TOKEN || process.env.TURBO_API_TOKEN;
    if (!token) {
        throw new Error("Missing required environment variable: IMAGE_API_TOKEN");
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

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}