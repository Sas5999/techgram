import { StoriesService } from './stories.service';
export declare class StoriesController {
    private readonly storiesService;
    constructor(storiesService: StoriesService);
    getFeed(cursor?: string, limit?: string, filter?: 'trending' | 'latest' | 'personalized' | 'founder_mode' | 'market_disruption', category?: string, tags?: string): Promise<{
        stories: {
            id: string;
            slug: string;
            originalUrl: string;
            headline: string;
            coverImageUrl: string | null;
            category: string;
            sourceName: string;
            sourceDomain: string;
            sourceLogoUrl: string | null;
            authorName: string | null;
            publishedAt: Date;
            credibility: import(".prisma/client").$Enums.CredibilityRating;
            enrichmentStatus: import(".prisma/client").$Enums.EnrichmentStatus;
            enrichmentError: string | null;
            enrichmentAttempts: number;
            quickSummary: string | null;
            detailedSummary: string | null;
            deepAnalysis: string | null;
            whyItMatters: import("@prisma/client/runtime/library").JsonValue | null;
            whatHappensNext: string | null;
            aiImpactScore: number | null;
            marketImpactScore: number | null;
            innovationScore: number | null;
            businessImpactScore: number | null;
            viralityScore: number | null;
            companyTags: string[];
            techTags: string[];
            founderTags: string[];
            createdAt: Date;
            updatedAt: Date;
        }[];
        nextCursor: string | null;
    }>;
    getStoryById(id: string): Promise<{
        id: string;
        slug: string;
        originalUrl: string;
        headline: string;
        coverImageUrl: string | null;
        category: string;
        sourceName: string;
        sourceDomain: string;
        sourceLogoUrl: string | null;
        authorName: string | null;
        publishedAt: Date;
        credibility: import(".prisma/client").$Enums.CredibilityRating;
        enrichmentStatus: import(".prisma/client").$Enums.EnrichmentStatus;
        enrichmentError: string | null;
        enrichmentAttempts: number;
        quickSummary: string | null;
        detailedSummary: string | null;
        deepAnalysis: string | null;
        whyItMatters: import("@prisma/client/runtime/library").JsonValue | null;
        whatHappensNext: string | null;
        aiImpactScore: number | null;
        marketImpactScore: number | null;
        innovationScore: number | null;
        businessImpactScore: number | null;
        viralityScore: number | null;
        companyTags: string[];
        techTags: string[];
        founderTags: string[];
        createdAt: Date;
        updatedAt: Date;
    }>;
    recordInteraction(id: string, action: 'like' | 'unlike' | 'save' | 'unsave', durationSeconds?: number, userIdHeader?: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        storyId: string;
        liked: boolean;
        saved: boolean;
        viewedDurationSeconds: number;
    } | {
        status: string;
        message: string;
    }>;
    getPulse(): Promise<{
        id: string;
        category: string;
        createdAt: Date;
        title: string;
        storyRefId: string | null;
    }[]>;
    search(q: string, category?: string): Promise<{
        id: string;
        slug: string;
        originalUrl: string;
        headline: string;
        coverImageUrl: string | null;
        category: string;
        sourceName: string;
        sourceDomain: string;
        sourceLogoUrl: string | null;
        authorName: string | null;
        publishedAt: Date;
        credibility: import(".prisma/client").$Enums.CredibilityRating;
        enrichmentStatus: import(".prisma/client").$Enums.EnrichmentStatus;
        enrichmentError: string | null;
        enrichmentAttempts: number;
        quickSummary: string | null;
        detailedSummary: string | null;
        deepAnalysis: string | null;
        whyItMatters: import("@prisma/client/runtime/library").JsonValue | null;
        whatHappensNext: string | null;
        aiImpactScore: number | null;
        marketImpactScore: number | null;
        innovationScore: number | null;
        businessImpactScore: number | null;
        viralityScore: number | null;
        companyTags: string[];
        techTags: string[];
        founderTags: string[];
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getAnalytics(): Promise<{
        totalStories: number;
        distribution: {
            category: string;
            count: number;
        }[];
        trends: {
            name: string;
            growth: number;
            activeCount: number;
        }[];
    }>;
    getConciergeResponse(message: string, contextStoryId?: string): Promise<{
        response: string;
    }>;
}
