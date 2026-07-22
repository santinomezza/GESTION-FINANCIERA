import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { WorkspacesService } from '../common/guards/workspaces.service';
import { EmailService } from '../common/services/email.service';
export declare class AuthService {
    private prisma;
    private usersService;
    private jwtService;
    private config;
    private workspacesService;
    private emailService;
    constructor(prisma: PrismaService, usersService: UsersService, jwtService: JwtService, config: ConfigService, workspacesService: WorkspacesService, emailService: EmailService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
    }>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: any;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    validateTelegramUser(telegramId: string): Promise<{
        id: string;
        email: string;
        telegramId: string | null;
        name: string;
        passwordHash: string;
        role: import(".prisma/client").$Enums.UserRole;
        avatarUrl: string | null;
        isActive: boolean;
        telegramUsername: string | null;
        telegramLinkedAt: Date | null;
        preferences: import("@prisma/client/runtime/library").JsonValue;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        lastLoginAt: Date | null;
    }>;
    private generateTokens;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    private generateSecureToken;
    private sanitizeUser;
}
