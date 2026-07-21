import { ConfigService } from '@nestjs/config';
export declare class EmailService {
    private config;
    private readonly fromEmail;
    private readonly appUrl;
    constructor(config: ConfigService);
    sendPasswordResetEmail(email: string, name: string, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
