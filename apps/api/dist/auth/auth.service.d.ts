import { PrismaService } from '../db/prisma.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtSecret;
    constructor(prisma: PrismaService);
    register(email: string, fullName: string, passwordHash: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            tier: import(".prisma/client").$Enums.SubscriptionTier;
        };
    }>;
    login(email: string, passwordHash: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            tier: import(".prisma/client").$Enums.SubscriptionTier;
        };
    }>;
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        tier: import(".prisma/client").$Enums.SubscriptionTier;
        preferences: {
            userId: string;
            followedCategories: string[];
            followedCompanies: string[];
            followedTechnologies: string[];
            founderModeEnabled: boolean;
            notificationsEnabled: boolean;
            notificationFilters: string[];
        } | null;
    }>;
    private generateJwt;
    verifyJwt(token: string): any;
}
