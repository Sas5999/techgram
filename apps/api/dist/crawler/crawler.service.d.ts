import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';
import { PulseGateway } from '../pulse/pulse.gateway';
export declare class CrawlerService implements OnModuleInit, OnModuleDestroy {
    private readonly prisma;
    private readonly pulseGateway;
    private readonly logger;
    private readonly rssParser;
    private scrapeTimeout;
    private scrapeInterval;
    private readonly sources;
    constructor(prisma: PrismaService, pulseGateway: PulseGateway);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    scrapeAll(): Promise<{
        totalScraped: number;
    }>;
    private scrapeSource;
    private cleanHtml;
    private generateSlug;
    private detectCategory;
    private extractCompanies;
    private extractTechnologies;
    private extractFounders;
    private calculateMetrics;
    private generateStructuredSummaries;
    private extractImageUrl;
    private getDefaultImage;
}
