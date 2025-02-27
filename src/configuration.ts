import * as vscode from "vscode";
import OpenAI from "openai";
import https from "https";
import fs from "fs";

export class Configuration {
    // extension configs
    enabled = true;
    launch_completion = ""
    launch_chat = ""
    endpoint = "http=//127.0.0.1:8012";
    chatendpoint = "http=//127.0.0.1:8011";
    auto = true;
    api_key = "";
    self_signed_certificate = "";
    n_prefix = 256;
    n_suffix = 64;
    n_predict = 128;
    t_max_prompt_ms = 500;
    t_max_predict_ms = 2500;
    show_info = true;
    max_line_suffix = 8;
    max_cache_keys = 250;
    ring_n_chunks = 16;
    ring_chunk_size = 64;
    ring_scope = 1024;
    ring_update_ms = 1000;
    language = "en";

    // experimental - avoid using
    use_openai_endpoint = false;
    openai_client: OpenAI | null = null;
    openai_client_model: string = "";
    openai_prompt_template: string = "<|fim_prefix|>{inputPrefix}{prompt}<|fim_suffix|>{inputSuffix}<|fim_middle|>";

    // additional configs
    // TODO: change to snake_case for consistency
    axiosRequestConfig = {};
    disabledLanguages: string[] = [];
    languageSettings:Record<string, boolean> = {}

    // TODO: change to snake_case for consistency
    RING_UPDATE_MIN_TIME_LAST_COMPL = 3000;
    MIN_TIME_BETWEEN_COMPL = 600;
    MAX_LAST_PICK_LINE_DISTANCE = 32;
    MAX_QUEUED_CHUNKS = 16;
    DELAY_BEFORE_COMPL_REQUEST = 150;
    MAX_EVENTS_IN_LOG = 250;

    config: vscode.WorkspaceConfiguration;

    private languageBg = new Map<string, string>([
        ["no suggestion", "нямам предложение"],
        ["thinking...", "мисля..."],
    ]);
    private languageEn = new Map<string, string>([
        ["no suggestion", "no suggestion"],
        ["thinking...", "thinking..."],
    ]);
    private languageDe = new Map<string, string>([
        ["no suggestion", "kein Vorschlag"],
        ["thinking...", "Ich denke..."],
    ]);
    private languageRu = new Map<string, string>([
        ["no suggestion", "нет предложения"],
        ["thinking...", "думаю..."],
    ]);
    private languageEs = new Map<string, string>([
        ["no suggestion", "ninguna propuesta"],
        ["thinking...", "pensando..."],
    ]);
    private languageCn = new Map<string, string>([
        ["no suggestion", "无建议"],
        ["thinking...", "思考..."],
    ]);
    private languageFr = new Map<string, string>([
        ["no suggestion", "pas de suggestion"],
        ["thinking...", "pense..."],
    ]);

    languages = new Map<string, Map<string, string>>([
        ["bg", this.languageBg],
        ["en", this.languageEn],
        ["de", this.languageDe],
        ["ru", this.languageRu],
        ["es", this.languageEs],
        ["cn", this.languageCn],
        ["fr", this.languageFr],
    ]);

    constructor() {
        this.config = vscode.workspace.getConfiguration("llama-vscode");
        this.updateConfigs(this.config);
        this.setLlamaRequestConfig();
        this.setOpenAiClient();
    }

    private updateConfigs = (config: vscode.WorkspaceConfiguration) => {
        // TODO Handle the case of wrong types for the configuration values
        this.endpoint = this.trimTrailingSlash(String(config.get<string>("endpoint")));
        this.chatendpoint = this.trimTrailingSlash(String(config.get<string>("chatendpoint")));
        this.launch_completion = String(config.get<string>("launch_completion"));
        this.launch_chat = String(config.get<string>("launch_chat"));
        this.use_openai_endpoint = Boolean(config.get<boolean>("use_openai_endpoint"));
        this.openai_client_model = String(config.get<string>("openai_client_model"));
        this.openai_prompt_template = String(config.get<string>("openai_prompt_template"));
        this.auto = Boolean(config.get<boolean>("auto"));
        this.api_key = String(config.get<string>("api_key"));
        this.self_signed_certificate = String(config.get<string>("self_signed_certificate"));
        this.n_prefix = Number(config.get<number>("n_prefix"));
        this.n_suffix = Number(config.get<number>("n_suffix"));
        this.n_predict = Number(config.get<number>("n_predict"));
        this.t_max_prompt_ms = Number(config.get<number>("t_max_prompt_ms"));
        this.t_max_predict_ms = Number(config.get<number>("t_max_predict_ms"));
        this.show_info = Boolean(config.get<boolean>("show_info"));
        this.max_line_suffix = Number(config.get<number>("max_line_suffix"));
        this.max_cache_keys = Number(config.get<number>("max_cache_keys"));
        this.ring_n_chunks = Number(config.get<number>("ring_n_chunks"));
        this.ring_chunk_size = Number(config.get<number>("ring_chunk_size"));
        this.ring_scope = Number(config.get<number>("ring_scope"));
        this.ring_update_ms = Number(config.get<number>("ring_update_ms"));
        this.language = String(config.get<string>("language"));
        this.disabledLanguages = config.get<string[]>("disabledLanguages") || [];
        this.enabled = Boolean(config.get<boolean>("enabled", true));
        this.languageSettings = config.get<Record<string, boolean>>('languageSettings') || {};
    };

    getUiText = (uiText: string): string | undefined => {
        let langTexts = this.languages.get(this.language);
        if (langTexts == undefined) langTexts = this.languages.get("en");
        return langTexts?.get(uiText);
    };

    updateOnEvent = (event: vscode.ConfigurationChangeEvent, config: vscode.WorkspaceConfiguration) => {
        this.updateConfigs(config);
        if (event.affectsConfiguration("llama-vscode.api_key") || event.affectsConfiguration("llama-vscode.self_signed_certificate")) {
            this.setLlamaRequestConfig();
            this.setOpenAiClient();
        }
    };

    trimTrailingSlash = (s: string): string => {
        if (s.length > 0 && s[s.length - 1] === "/") {
            return s.slice(0, -1);
        }
        return s;
    };

    setLlamaRequestConfig = () => {
        this.axiosRequestConfig = {};
        if (this.api_key != undefined && this.api_key.trim() != "") {
            this.axiosRequestConfig = {
                headers: {
                    Authorization: `Bearer ${this.api_key.trim()}`,
                    "Content-Type": "application/json",
                },
            };
        }
        if (this.self_signed_certificate != undefined && this.self_signed_certificate.trim() != "") {
            const httpsAgent = new https.Agent({
                ca: fs.readFileSync(this.self_signed_certificate.trim()),
            });
            this.axiosRequestConfig = {
                ...this.axiosRequestConfig,
                httpsAgent,
            };
        }
    };

    setOpenAiClient = () => {
        this.openai_client = null;
        if (this.use_openai_endpoint) {
            this.openai_client = new OpenAI({
                apiKey: this.api_key || "empty",
                baseURL: this.endpoint,
            });
        }
    };

    isCompletionEnabled = (document?: vscode.TextDocument, language?: string): boolean =>  {
        if (!this.enabled) return false;

        const languageToCheck = language ?? document?.languageId;
        if (languageToCheck) {
            return this.languageSettings[languageToCheck] ?? true;
        }

        return true;
    }
}
