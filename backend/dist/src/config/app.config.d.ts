declare const _default: () => {
    port: number;
    nodeEnv: string;
    frontendUrl: string;
    database: {
        url: string;
    };
    redis: {
        url: string;
        password: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
    };
    telegram: {
        botToken: string;
        webhookUrl: string;
    };
    openai: {
        apiKey: string;
    };
    gemini: {
        apiKey: string;
    };
    anthropic: {
        apiKey: string;
    };
    groq: {
        apiKey: string;
    };
    huggingface: {
        apiKey: string;
    };
    replicate: {
        apiKey: string;
        modelId: string;
    };
    aws: {
        accessKeyId: string;
        secretAccessKey: string;
        region: string;
    };
    openrouter: {
        apiKey: string;
    };
    deepinfra: {
        apiKey: string;
    };
    fireworks: {
        apiKey: string;
    };
    anyscale: {
        apiKey: string;
    };
};
export default _default;
