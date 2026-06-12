import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(email: string, fullName: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            tier: import(".prisma/client").$Enums.SubscriptionTier;
        };
    }>;
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            fullName: string;
            tier: import(".prisma/client").$Enums.SubscriptionTier;
        };
    }>;
    me(authHeader?: string): Promise<{
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
}
