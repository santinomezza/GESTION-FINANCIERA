import { CategoryType } from '@prisma/client';
export declare class CreateCategoryDto {
    name: string;
    icon?: string;
    color?: string;
    type?: CategoryType;
}
