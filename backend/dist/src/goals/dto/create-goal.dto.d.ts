export declare class CreateGoalDto {
    name: string;
    description?: string;
    targetAmount: string;
    category?: string;
    targetDate?: string;
    isActive?: boolean;
}
export declare class UpdateGoalDto {
    name?: string;
    description?: string;
    targetAmount?: string;
    category?: string;
    targetDate?: string;
    isCompleted?: boolean;
    isActive?: boolean;
}
