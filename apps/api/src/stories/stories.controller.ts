import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  Sse,
} from '@nestjs/common';
import { StoriesService } from './stories.service';
import { Observable, interval, map } from 'rxjs';

@Controller('api/v1')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get('feed')
  async getFeed(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('filter') filter?: 'trending' | 'latest' | 'personalized' | 'founder_mode' | 'market_disruption',
    @Query('category') category?: string,
    @Query('tags') tags?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.storiesService.getFeed({
      cursor,
      limit: limitNum,
      filter,
      category,
      tags,
    });
  }

  @Get('stories/:id')
  async getStoryById(@Param('id') id: string) {
    const story = await this.storiesService.getStoryById(id);
    if (!story) {
      throw new HttpException('Story not found', HttpStatus.NOT_FOUND);
    }
    return story;
  }

  @Post('stories/:id/interact')
  async recordInteraction(
    @Param('id') id: string,
    @Body('action') action: 'like' | 'unlike' | 'save' | 'unsave',
    @Body('durationSeconds') durationSeconds?: number,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = userIdHeader || 'guest-user-uuid';
    if (userId === 'guest-user-uuid') {
      // Return a message that login is required for full personalization, but allow it silently
      return { status: 'mock_success', message: 'Interaction saved client-side (guest mode)' };
    }
    return this.storiesService.recordInteraction(id, userId, action, durationSeconds);
  }

  @Get('pulse')
  async getPulse() {
    return this.storiesService.getPulse();
  }

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('category') category?: string,
  ) {
    return this.storiesService.search(q, category);
  }

  @Get('analytics/dashboard')
  async getAnalytics() {
    return this.storiesService.getAnalytics();
  }

  @Post('ai/concierge')
  async getConciergeResponse(
    @Body('message') message: string,
    @Body('contextStoryId') contextStoryId?: string,
  ) {
    // Return a mock chat response with tech details
    const cleanMsg = message.toLowerCase();
    let responseText = `Here's a premium briefing from the Techgram Intelligence Console: \n\n`;

    if (cleanMsg.includes('ai') || cleanMsg.includes('gemini') || cleanMsg.includes('openai')) {
      responseText += `1. **Gemini releases core updates**: Google's latest Gemini models show high efficiency rates in developer environment deployments.\n2. **OpenAI launches new reasoning model**: The new model optimizes complex coding and mathematical operations. \n\nCheck out our [AI Category Feed](file:///feed?category=AI_ML) for live metrics.`;
    } else if (cleanMsg.includes('funding') || cleanMsg.includes('startup')) {
      responseText += `1. **Valuations rise in AI sector**: Top-tier foundational startup valuations surged 42% on average this quarter.\n2. **SaaS series A volumes increase**: Series A rounds are averaging $12.5M in size. \n\nSee our [Venture Capital Dashboard](file:///founder-mode) for details.`;
    } else {
      responseText += `Global tech sentiment remains positive this week. Market indices are showing stable growth driven by strong cloud services demand and semiconductor supply chain improvements. \n\nLet me know if you would like to analyze startup funding or cybersecurity alerts.`;
    }

    return { response: responseText };
  }
}
