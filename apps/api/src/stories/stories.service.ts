import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../db/prisma.service';

@Injectable()
export class StoriesService {
  private readonly logger = new Logger(StoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getFeed(params: {
    cursor?: string;
    limit?: number;
    filter?: 'trending' | 'latest' | 'personalized' | 'founder_mode' | 'market_disruption';
    category?: string;
    tags?: string;
  }) {
    const limit = params.limit ? Math.min(params.limit, 50) : 10;
    const filter = params.filter || 'latest';
    const category = params.category;
    const tags = params.tags ? params.tags.split(',') : [];

    const where: any = {};

    // Apply category filters
    if (category) {
      where.category = category;
    }

    // Apply tags filters
    if (tags.length > 0) {
      where.OR = [
        { companyTags: { hasSome: tags } },
        { techTags: { hasSome: tags } },
      ];
    }

    // Apply feed filters
    if (filter === 'founder_mode') {
      where.category = {
        in: ['FUNDING', 'PRODUCT_LAUNCH', 'DEVELOPER_TOOLS', 'ENTERPRISE', 'HARDWARE'],
      };
    } else if (filter === 'market_disruption') {
      where.category = {
        in: ['FUNDING', 'POLICY', 'CYBERSECURITY'],
      };
    }

    // Cursor pagination setup
    let cursorObj = undefined;
    if (params.cursor) {
      cursorObj = { id: params.cursor };
    }

    // Sorting order
    let orderBy: any = { publishedAt: 'desc' };

    if (filter === 'trending') {
      // Order by a composite of innovation + virality
      orderBy = [
        { viralityScore: 'desc' },
        { publishedAt: 'desc' }
      ];
    }

    const stories = await this.prisma.story.findMany({
      where,
      take: limit + 1, // Fetch 1 extra to check next page cursor
      cursor: cursorObj,
      skip: cursorObj ? 1 : 0,
      orderBy,
    });

    let nextCursor: string | null = null;
    if (stories.length > limit) {
      const nextItem = stories.pop();
      nextCursor = nextItem!.id;
    }

    return {
      stories,
      nextCursor,
    };
  }

  async getStoryById(id: string) {
    return this.prisma.story.findUnique({
      where: { id },
    });
  }

  async recordInteraction(
    storyId: string,
    userId: string,
    action: 'like' | 'unlike' | 'save' | 'unsave',
    durationSeconds?: number,
  ) {
    const data: any = {};
    if (action === 'like') data.liked = true;
    if (action === 'unlike') data.liked = false;
    if (action === 'save') data.saved = true;
    if (action === 'unsave') data.saved = false;
    if (durationSeconds) data.viewedDurationSeconds = { increment: durationSeconds };

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

  async search(q: string, category?: string) {
    const where: any = {};
    
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
    
    // Group by category to find distribution
    const categoryGroups = await this.prisma.story.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    // Mock tech growth statistics (normally aggregated from tags)
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
}
