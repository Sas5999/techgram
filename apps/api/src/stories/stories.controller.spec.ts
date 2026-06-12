import { Test, TestingModule } from '@nestjs/testing';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';
import { HttpException, HttpStatus } from '@nestjs/common';

const mockStoriesService = {
  getFeed: jest.fn(),
  getStoryById: jest.fn(),
  recordInteraction: jest.fn(),
  getPulse: jest.fn(),
  search: jest.fn(),
  getAnalytics: jest.fn(),
};

describe('StoriesController', () => {
  let controller: StoriesController;
  let service: typeof mockStoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoriesController],
      providers: [
        {
          provide: StoriesService,
          useValue: mockStoriesService,
        },
      ],
    }).compile();

    controller = module.get<StoriesController>(StoriesController);
    service = module.get(StoriesService);
    jest.clearAllMocks();
  });

  describe('getFeed', () => {
    it('should map query params correctly', async () => {
      service.getFeed.mockResolvedValue({ stories: [], nextCursor: null });

      const result = await controller.getFeed('c-123', '15', 'trending', 'AI_ML', 'AI');
      expect(service.getFeed).toHaveBeenCalledWith({
        cursor: 'c-123',
        limit: 15,
        filter: 'trending',
        category: 'AI_ML',
        tags: 'AI',
      });
      expect(result.stories).toEqual([]);
    });
  });

  describe('getStoryById', () => {
    it('should return a story if found', async () => {
      const story = { id: 'story-1', headline: 'AI' };
      service.getStoryById.mockResolvedValue(story);

      const result = await controller.getStoryById('story-1');
      expect(service.getStoryById).toHaveBeenCalledWith('story-1');
      expect(result).toEqual(story);
    });

    it('should throw an 404 HttpException if story is not found', async () => {
      service.getStoryById.mockResolvedValue(null);

      await expect(controller.getStoryById('missing')).rejects.toThrow(
        new HttpException('Story not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('recordInteraction', () => {
    it('should handle authenticated user upsert requests', async () => {
      service.recordInteraction.mockResolvedValue({ success: true });

      const result = await controller.recordInteraction('story-1', 'like', 30, 'user-999');
      expect(service.recordInteraction).toHaveBeenCalledWith('story-1', 'user-999', 'like', 30);
      expect(result).toEqual({ success: true });
    });

    it('should fall back to guest mode if user-id header is absent', async () => {
      const result = await controller.recordInteraction('story-1', 'like', 30, undefined);
      expect(service.recordInteraction).not.toHaveBeenCalled();
      expect(result.status).toBe('mock_success');
    });
  });

  describe('getPulse', () => {
    it('should delegate to stories service', async () => {
      service.getPulse.mockResolvedValue([]);
      await controller.getPulse();
      expect(service.getPulse).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should search with query parameters', async () => {
      service.search.mockResolvedValue([]);
      await controller.search('rust', 'DEVELOPER_TOOLS');
      expect(service.search).toHaveBeenCalledWith('rust', 'DEVELOPER_TOOLS');
    });
  });

  describe('getAnalytics', () => {
    it('should return aggregate data', async () => {
      service.getAnalytics.mockResolvedValue({ total: 100 });
      const result = await controller.getAnalytics();
      expect(result).toEqual({ total: 100 });
    });
  });

  describe('getConciergeResponse', () => {
    it('should return intelligent briefings for AI questions', async () => {
      const result = await controller.getConciergeResponse('What is the latest in AI?');
      expect(result.response).toContain('briefing');
      expect(result.response).toContain('Gemini');
    });

    it('should return funding statistics for funding questions', async () => {
      const result = await controller.getConciergeResponse('Tell me about startup funding');
      expect(result.response).toContain('briefing');
      expect(result.response).toContain('Valuations');
    });
  });
});
