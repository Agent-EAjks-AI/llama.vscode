export interface IAddStrategy {
    add(details: ModelTypeDetails): Promise<void>;
}

export interface ChatMessage {
  role: string; // or just 'string' if you need more roles
  content: string;
  tool_call_id?: string
}

export interface LlamaResponse {
    content?: string;
    generation_settings?: any;
    tokens_cached?: number;
    truncated?: boolean;
    timings?: {
        prompt_n?: number;
        prompt_ms?: number;
        prompt_per_second?: number;
        predicted_n?: number;
        predicted_ms?: number;
        predicted_per_second?: number;
    };
}

export interface LlamaChatResponse {
    choices: [{message:{content?: string}}];
}

export interface ChunkEntry {
    uri: string;
    content: string;
    firstLine: number;
    lastLine: number;
    hash: string;
    embedding: number[]
}

export interface LlmModel {
    name: string;
    aiModel?: string;
    isKeyRequired?: boolean;
    endpoint?: string;
    localStartCommand?: string
}

export interface Env {
    name: string,
    description?: string,
    completion?: LlmModel,
    chat?: LlmModel,
    embeddings?: LlmModel,
    tools?: LlmModel,
    agent?: Agent,
    ragEnabled?: boolean,
    envStartLastUsed?: boolean,
    complEnabled?: boolean
}

export interface Agent {
    name: string,
    description?: string,
    systemInstruction: string[]
    tools?: string[]
}

export interface AgentCommand {
    name: string,
    description?: string,
    prompt: string[]
    context?: string[]
}

export interface chatMessage {
    "role": string,
    "content": string
}

export interface Chat {
    name: string,
    description?: string,
    id: string,
    messages?: chatMessage[],
    log?: string,
    defaultAgent?: Agent
}

export interface HuggingfaceFile {
    type: string // file or directory
    size: number // in bytes
    path: string // relative to main
}

export interface HuggingfaceModel {
    createdAt: string
    downloads: number
    id: string // 'unsloth/gpt-oss-20b-GGUF'
    library_name: string // 'transformers'
    likes: number
    modelId: string // 'unsloth/gpt-oss-20b-GGUF'
    pipeline_tag: string // 'text-generation'
    private: boolean
    tags: string[] // (13) ['transformers', 'gguf', 'gpt_oss', 'text-generation', 'openai', 'unsloth', 'base_model:openai/gpt-oss-20b', 'base_model:quantized:openai/gpt-oss-20b', 'license:apache-2.0', 'autotrain_compatible', 'endpoints_compatible', 'region:us', 'conversational']
    trendingScore: number
}

export interface ModelTypeDetails {
    modelsList: LlmModel[]
    modelsListSettingName: string
    newModelPort: number
    newModelHost: string
    selModelPropName: string
    launchSettingName: string
    killCmd: () => void
    shellCmd: (message: string) => void
}

export interface ContextCustom {
    get_list: string
    get_item_context: string
}

