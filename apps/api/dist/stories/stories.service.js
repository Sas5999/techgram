"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StoriesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../db/prisma.service");
let StoriesService = StoriesService_1 = class StoriesService {
    prisma;
    logger = new common_1.Logger(StoriesService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFeed(params) {
        const limit = params.limit ? Math.min(params.limit, 50) : 10;
        const filter = params.filter || 'latest';
        const category = params.category;
        const tags = params.tags ? params.tags.split(',') : [];
        const where = {};
        if (category) {
            where.category = category;
        }
        if (tags.length > 0) {
            where.OR = [
                { companyTags: { hasSome: tags } },
                { techTags: { hasSome: tags } },
            ];
        }
        if (filter === 'founder_mode') {
            where.category = {
                in: ['FUNDING', 'PRODUCT_LAUNCH', 'DEVELOPER_TOOLS', 'ENTERPRISE', 'HARDWARE'],
            };
        }
        else if (filter === 'market_disruption') {
            where.category = {
                in: ['FUNDING', 'POLICY', 'CYBERSECURITY'],
            };
        }
        let cursorObj = undefined;
        if (params.cursor) {
            cursorObj = { id: params.cursor };
        }
        let orderBy = { publishedAt: 'desc' };
        if (filter === 'trending') {
            orderBy = [
                { viralityScore: 'desc' },
                { publishedAt: 'desc' }
            ];
        }
        const stories = await this.prisma.story.findMany({
            where,
            take: limit + 1,
            cursor: cursorObj,
            skip: cursorObj ? 1 : 0,
            orderBy,
        });
        let nextCursor = null;
        if (stories.length > limit) {
            const nextItem = stories.pop();
            nextCursor = nextItem.id;
        }
        return {
            stories,
            nextCursor,
        };
    }
    async getStoryById(id) {
        return this.prisma.story.findUnique({
            where: { id },
        });
    }
    async recordInteraction(storyId, userId, action, durationSeconds) {
        const data = {};
        if (action === 'like')
            data.liked = true;
        if (action === 'unlike')
            data.liked = false;
        if (action === 'save')
            data.saved = true;
        if (action === 'unsave')
            data.saved = false;
        if (durationSeconds)
            data.viewedDurationSeconds = { increment: durationSeconds };
        return this.prisma.storyInteraction.upsert({
            where: {
                userId_storyId: { userId, storyId },
            },
            create: {
                userId,
                storyId,
                liked: action === 'like',
                saved: action === 'save',
                viewedDurationSeconds: durationSeconds || 0,
            },
            update: data,
        });
    }
    async search(q, category) {
        const where = {};
        if (category) {
            where.category = category;
        }
        if (q) {
            where.OR = [
                { headline: { contains: q, mode: 'insensitive' } },
                { quickSummary: { contains: q, mode: 'insensitive' } },
                { sourceName: { contains: q, mode: 'insensitive' } },
                { companyTags: { hasSome: [q] } },
                { techTags: { hasSome: [q] } },
            ];
        }
        return this.prisma.story.findMany({
            where,
            take: 20,
            orderBy: { publishedAt: 'desc' },
        });
    }
    async getAnalytics() {
        const totalStories = await this.prisma.story.count();
        const categoryGroups = await this.prisma.story.groupBy({
            by: ['category'],
            _count: {
                id: true,
            },
        });
        const trends = [
            { name: 'AI & ML', growth: 124, activeCount: 450 },
            { name: 'Venture Capital', growth: 42, activeCount: 180 },
            { name: 'Developer Tools', growth: 87, activeCount: 320 },
            { name: 'Cybersecurity', growth: 18, activeCount: 95 },
            { name: 'Hardware & Chips', growth: 95, activeCount: 140 },
        ];
        const distribution = categoryGroups.map((g) => ({
            category: g.category,
            count: g._count.id,
        }));
        return {
            totalStories,
            distribution,
            trends,
        };
    }
    async getPulse() {
        return this.prisma.pulseUpdate.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.StoriesService = StoriesService;
exports.StoriesService = StoriesService = StoriesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StoriesService);
//# sourceMappingURL=stories.service.js.map