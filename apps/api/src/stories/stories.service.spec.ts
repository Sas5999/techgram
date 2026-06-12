import { Test, TestingModule } from '@nestjs/testing';
import { StoriesService } from './stories.service';
import { PrismaService } from '../db/prisma.service';

const mockStories = [
  {
    id: 'story-1',
    headline: 'AI Revolution',
    category: 'AI_ML',
    companyTags: ['OpenAI'],
    techTags: ['LLM'],
    viralityScore: 90,
    publishedAt: new Date('2026-06-10T12:00:00Z'),
  },
  {
    id: 'story-2',
    headline: 'Startup Raised $50M',
    category: 'FUNDING',
    companyTags: ['Stripe'],
    techTags: ['API'],
    viralityScore: 80,
    publishedAt: new Date('2026-06-11T12:00:00Z'),
  },
];

const mockPrismaService = {
  story: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  storyInteraction: {
    upsert: jest.fn(),
  },
  pulseUpdate: {
    findMany: jest.fn(),
  },
};

describe('StoriesService', () => {
  let service: StoriesService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StoriesService>(StoriesService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  describe('getFeed', () => {
    it('should return stories and next cursor if more exist', async () => {
      prisma.story.findMany.mockResolvedValue([...mockStories, { id: 'story-3' }]);

      const result = await service.getFeed({ limit: 2 });
      expect(prisma.story.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 3,
          orderBy: { publishedAt: 'desc' },
        }),
      );
      expect(result.stories).toHaveLength(2);
      expect(result.nextCursor).toBe('story-3');
    });

    it('should handle filters like category and tags', async () => {
      prisma.story.findMany.mockResolvedValue([mockStories[0]]);

      await service.getFeed({ category: 'AI_ML', tags: 'OpenAI,LLM' });

      expect(prisma.story.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'AI_ML',
            OR: [
              { companyTags: { hasSome: ['OpenAI', 'LLM'] } },
              { techTags: { hasSome: ['OpenAI', 'LLM'] } },
            ],
          }),
        }),
      );
    });

    it('should filter by founder_mode categories', async () => {
      prisma.story.findMany.mockResolvedValue([]);

      await service.getFeed({ filter: 'founder_mode' });

      expect(prisma.story.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: {
              in: ['FUNDING', 'PRODUCT_LAUNCH', 'DEVELOPER_TOOLS', 'ENTERPRISE', 'HARDWARE'],
            },
          }),
        }),
      );
    });
  });

  describe('getStoryById', () => {
    it('should query prisma for a specific story', async () => {
      prisma.story.findUnique.mockResolvedValue(mockStories[0]);

      const result = await service.getStoryById('story-1');
      expect(prisma.story.findUnique).toHaveBeenCalledWith({
        where: { id: 'story-1' },
      });
      expect(result).toEqual(mockStories[0]);
    });
  });

  describe('recordInteraction', () => {
    it('should upsert interaction details', async () => {
      prisma.storyInteraction.upsert.mockResolvedValue({ id: 'int-1' });

      await service.recordInteraction('story-1', 'user-123', 'like', 10);

      expect(prisma.storyInteraction.upsert).toHaveBeenCalledWith({
        where: {
          userId_storyId: { userId: 'user-123', storyId: 'story-1' },
        },
        create: {
          userId: 'user-123',
          storyId: 'story-1',
          liked: true,
          saved: false,
          viewedDurationSeconds: 10,
        },
        update: {
          liked: true,
          viewedDurationSeconds: { increment: 10 },
        },
      });
    });
  });

  describe('search', () => {
    it('should perform text searches on multiple fields', async () => {
      prisma.story.findMany.mockResolvedValue([mockStories[0]]);

      const result = await service.search('openai', 'AI_ML');
      expect(prisma.story.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            category: 'AI_ML',
            OR: [
              { headline: { contains: 'openai', mode: 'insensitive' } },
              { quickSummary: { contains: 'openai', mode: 'insensitive' } },
              { sourceName: { contains: 'openai', mode: 'insensitive' } },
              { companyTags: { hasSome: ['openai'] } },
              { techTags: { hasSome: ['openai'] } },
            ],
          },
        }),
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('getAnalytics', () => {
    it('should return aggregated counts and distribution', async () => {
      prisma.story.count.mockResolvedValue(10);
      prisma.story.groupBy.mockResolvedValue([
        { category: 'AI_ML', _count: { id: 6 } },
        { category: 'FUNDING', _count: { id: 4 } },
      ]);

      const result = await service.getAnalytics();
      expect(result.totalStories).toBe(10);
      expect(result.distribution).toEqual([
        { category: 'AI_ML', count: 6 },
        { category: 'FUNDING', count: 4 },
      ]);
      expect(result.trends).toBeDefined();
    });
  });

  describe('getPulse', () => {
    it('should fetch recent updates', async () => {
      prisma.pulseUpdate.findMany.mockResolvedValue([
        { id: 'p-1', title: 'Live Update' },
      ]);

      const result = await service.getPulse();
      expect(prisma.pulseUpdate.findMany).toHaveBeenCalledWith({
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(1);
    });
  });
});
