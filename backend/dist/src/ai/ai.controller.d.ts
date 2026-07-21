import { UploadedFile } from '@nestjs/common';
import { AiService } from './ai.service';
interface UploadedFile {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}
export declare class AiController {
    private aiService;
    constructor(aiService: AiService);
    extractInvoice(file: UploadedFile): Promise<import("./ai.service").ExtractedInvoice>;
}
export {};
