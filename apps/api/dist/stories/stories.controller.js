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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoriesController = void 0;
const common_1 = require("@nestjs/common");
const stories_service_1 = require("./stories.service");
let StoriesController = class StoriesController {
    storiesService;
    constructor(storiesService) {
        this.storiesService = storiesService;
    }
    async getFeed(cursor, limit, filter, category, tags) {
        const limitNum = limit ? parseInt(limit, 10) : undefined;
        return this.storiesService.getFeed({
            cursor,
            limit: limitNum,
            filter,
            category,
            tags,
        });
    }
    async getStoryById(id) {
        const story = await this.storiesService.getStoryById(id);
        if (!story) {
            throw new common_1.HttpException('Story not found', common_1.HttpStatus.NOT_FOUND);
        }
        return story;
    }
    async recordInteraction(id, action, durationSeconds, userIdHeader) {
        const userId = userIdHeader || 'guest-user-uuid';
        if (userId === 'guest-user-uuid') {
            return { status: 'mock_success', message: 'Interaction saved client-side (guest mode)' };
        }
        return this.storiesService.recordInteraction(id, userId, action, durationSeconds);
    }
    async getPulse() {
        return this.storiesService.getPulse();
    }
    async search(q, category) {
        return this.storiesService.search(q, category);
    }
    async getAnalytics() {
        return this.storiesService.getAnalytics();
    }
    async getConciergeResponse(message, contextStoryId) {
        const cleanMsg = message.toLowerCase();
        let responseText = `Here's a premium briefing from the Techgram Intelligence Console: \n\n`;
        if (cleanMsg.includes('ai') || cleanMsg.includes('gemini') || cleanMsg.includes('openai')) {
            responseText += `1. **Gemini releases core updates**: Google's latest Gemini models show high efficiency rates in developer environment deployments.\n2. **OpenAI launches new reasoning model**: The new model optimizes complex coding and mathematical operations. \n\nCheck out our [AI Category Feed](file:///feed?category=AI_ML) for live metrics.`;
        }
        else if (cleanMsg.includes('funding') || cleanMsg.includes('startup')) {
            responseText += `1. **Valuations rise in AI sector**: Top-tier foundational startup valuations surged 42% on average this quarter.\n2. **SaaS series A volumes increase**: Series A rounds are averaging $12.5M in size. \n\nSee our [Venture Capital Dashboard](file:///founder-mode) for details.`;
        }
        else {
            responseText += `Global tech sentiment remains positive this week. Market indices are showing stable growth driven by strong cloud services demand and semiconductor supply chain improvements. \n\nLet me know if you would like to analyze startup funding or cybersecurity alerts.`;
        }
        return { response: responseText };
    }
};
exports.StoriesController = StoriesController;
__decorate([
    (0, common_1.Get)('feed'),
    __param(0, (0, common_1.Query)('cursor')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('filter')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('tags')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getFeed", null);
__decorate([
    (0, common_1.Get)('stories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getStoryById", null);
__decorate([
    (0, common_1.Post)('stories/:id/interact'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('action')),
    __param(2, (0, common_1.Body)('durationSeconds')),
    __param(3, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, String]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "recordInteraction", null);
__decorate([
    (0, common_1.Get)('pulse'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getPulse", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('analytics/dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getAnalytics", null);
__decorate([
    (0, common_1.Post)('ai/concierge'),
    __param(0, (0, common_1.Body)('message')),
    __param(1, (0, common_1.Body)('contextStoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StoriesController.prototype, "getConciergeResponse", null);
exports.StoriesController = StoriesController = __decorate([
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [stories_service_1.StoriesService])
], StoriesController);
//# sourceMappingURL=stories.controller.js.map