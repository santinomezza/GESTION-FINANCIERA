import { ReportsService } from './reports.service';
import { Response } from 'express';
export declare class ReportsController {
    private reportsService;
    private readonly logger;
    constructor(reportsService: ReportsService);
    exportCSV(userId: string, workspaceId: string, filters: any, res: Response): Promise<void>;
    exportExcel(userId: string, workspaceId: string, filters: any, res: Response): Promise<void>;
    exportInvoicesExcel(userId: string, workspaceId: string, filters: any, res: Response): Promise<void>;
}
