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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CrawlerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrawlerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../db/prisma.service");
const rss_parser_1 = __importDefault(require("rss-parser"));
const pulse_gateway_1 = require("../pulse/pulse.gateway");
let CrawlerService = CrawlerService_1 = class CrawlerService {
    prisma;
    pulseGateway;
    logger = new common_1.Logger(CrawlerService_1.name);
    rssParser = new rss_parser_1.default();
    scrapeTimeout = null;
    scrapeInterval = null;
    sources = [
        {
            name: 'TechCrunch',
            domain: 'techcrunch.com',
            url: 'https://techcrunch.com/feed/',
            credibility: 'TRUSTED_MEDIA',
        },
        {
            name: 'VentureBeat',
            domain: 'venturebeat.com',
            url: 'https://venturebeat.com/feed/',
            credibility: 'TRUSTED_MEDIA',
        },
        {
            name: 'Ars Technica',
            domain: 'arstechnica.com',
            url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
            credibility: 'TRUSTED_MEDIA',
        },
        {
            name: 'Wired Tech',
            domain: 'wired.com',
            url: 'https://www.wired.com/feed/category/tech/latest/rss',
            credibility: 'TRUSTED_MEDIA',
        },
        {
            name: 'Hacker News',
            domain: 'news.ycombinator.com',
            url: 'https://news.ycombinator.com/rss',
            credibility: 'COMMUNITY_SOURCE',
        },
    ];
    constructor(prisma, pulseGateway) {
        this.prisma = prisma;
        this.pulseGateway = pulseGateway;
    }
    async onModuleInit() {
        this.logger.log('CrawlerService initialized. Starting initial scrape in 5 seconds...');
        this.scrapeTimeout = setTimeout(() => {
            this.scrapeAll().catch((err) => this.logger.error('Initial scrape failed', err));
        }, 5000);
        this.scrapeInterval = setInterval(() => {
            this.scrapeAll().catch((err) => this.logger.error('Scheduled scrape failed', err));
        }, 15 * 60 * 1000);
    }
    onModuleDestroy() {
        if (this.scrapeTimeout) {
            clearTimeout(this.scrapeTimeout);
        }
        if (this.scrapeInterval) {
            clearInterval(this.scrapeInterval);
        }
        this.logger.log('CrawlerService destroyed. Timers cleared.');
    }
    async scrapeAll() {
        this.logger.log('Starting global tech feed scrape...');
        let totalScraped = 0;
        for (const source of this.sources) {
            try {
                const count = await this.scrapeSource(source);
                totalScraped += count;
            }
            catch (error) {
                this.logger.error(`Error scraping source ${source.name}: ${error.message}`);
            }
        }
        this.logger.log(`Global feed scrape completed. Inserted/Updated ${totalScraped} stories.`);
        return { totalScraped };
    }
    async scrapeSource(source) {
        this.logger.log(`Fetching feed: ${source.name} (${source.url})`);
        const feed = await this.rssParser.parseURL(source.url);
        let insertedCount = 0;
        for (const item of feed.items) {
            if (!item.link || !item.title)
                continue;
            const originalUrl = item.link;
            const headline = item.title;
            const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
            const existing = await this.prisma.story.findUnique({
                where: { originalUrl },
            });
            if (existing)
                continue;
            const contentSnippet = item.contentSnippet || item.content || '';
            const cleanExcerpt = this.cleanHtml(contentSnippet).substring(0, 500);
            const slug = this.generateSlug(headline);
            const textToAnalyze = `${headline} ${cleanExcerpt}`.toLowerCase();
            const category = this.detectCategory(textToAnalyze);
            const companyTags = this.extractCompanies(textToAnalyze);
            const techTags = this.extractTechnologies(textToAnalyze);
            const founderTags = this.extractFounders(textToAnalyze);
            const scores = this.calculateMetrics(textToAnalyze, category);
            const summaries = this.generateStructuredSummaries(headline, cleanExcerpt, category, companyTags, techTags);
            let coverImageUrl = this.extractImageUrl(item);
            if (!coverImageUrl) {
                coverImageUrl = this.getDefaultImage(category);
            }
            const story = await this.prisma.story.create({
                data: {
                    headline,
                    slug,
                    coverImageUrl,
                    category,
                    sourceName: source.name,
                    sourceDomain: source.domain,
                    sourceLogoUrl: `https://logo.clearbit.com/${source.domain}?size=128`,
                    authorName: item.creator || item.author || 'Staff Writer',
                    originalUrl,
                    publishedAt: pubDate,
                    credibility: source.credibility,
                    enrichmentStatus: 'COMPLETE',
                    quickSummary: summaries.quickSummary,
                    detailedSummary: summaries.detailedSummary.join('\n'),
                    deepAnalysis: summaries.deepAnalysis,
                    whyItMatters: summaries.whyItMatters,
                    whatHappensNext: summaries.whatHappensNext,
                    aiImpactScore: scores.aiImpactScore,
                    marketImpactScore: scores.marketImpactScore,
                    innovationScore: scores.innovationScore,
                    businessImpactScore: scores.businessImpactScore,
                    viralityScore: scores.viralityScore,
                    companyTags,
                    techTags,
                    founderTags,
                },
            });
            this.pulseGateway.broadcastFeedUpdate({
                id: story.id,
                headline: story.headline,
                category: story.category,
                sourceName: story.sourceName,
            });
            if (scores.viralityScore > 85) {
                const pulse = await this.prisma.pulseUpdate.create({
                    data: {
                        title: `${source.name}: ${headline.substring(0, 100)}...`,
                        category,
                        storyRefId: story.id,
                    },
                });
                this.pulseGateway.broadcastPulseUpdate(pulse);
            }
            insertedCount++;
        }
        this.logger.log(`Parsed ${source.name}: Inserted ${insertedCount} new stories.`);
        return insertedCount;
    }
    cleanHtml(html) {
        return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
    }
    generateSlug(text) {
        const clean = text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
        const randomSuffix = Math.random().toString(36).substring(2, 7);
        return `${clean.substring(0, 50)}-${randomSuffix}`;
    }
    detectCategory(text) {
        if (text.match(/ai|ml|machine learning|openai|gpt|gemini|claude|llama|llm|deepmind|anthropic|neural|nvidia|transformer/)) {
            return 'AI_ML';
        }
        if (text.match(/funding|raised|venture|capital|valuation|series|seed|ipo|acqui|merger|vc/)) {
            return 'FUNDING';
        }
        if (text.match(/launch|unveils|releases|announces|introduces|debuts|rollout/)) {
            return 'PRODUCT_LAUNCH';
        }
        if (text.match(/api|sdk|github|open source|git|framework|library|database|postgres|rust|developer|coding/)) {
            return 'DEVELOPER_TOOLS';
        }
        if (text.match(/security|hack|breach|malware|cyber|ransomware|vulnerability|exploit|phishing|leak/)) {
            return 'CYBERSECURITY';
        }
        if (text.match(/chip|semiconductor|processor|gpu|hardware|cpu|intel|amd|arm|tsmc|robot/)) {
            return 'HARDWARE';
        }
        if (text.match(/cloud|saas|aws|azure|salesforce|enterprise|b2b|snowflake|oracle|database/)) {
            return 'ENTERPRISE';
        }
        if (text.match(/crypto|blockchain|bitcoin|ethereum|web3|solana|nft|wallet|token/)) {
            return 'WEB3';
        }
        if (text.match(/policy|antitrust|regulation|court|lawsuit|sec|ftc|senate|government|eu|ban/)) {
            return 'POLICY';
        }
        return 'CONSUMER_TECH';
    }
    extractCompanies(text) {
        const list = ['openai', 'google', 'apple', 'nvidia', 'microsoft', 'meta', 'amazon', 'tesla', 'github', 'anthropic', 'amd', 'intel', 'stripe', 'uber', 'spacex'];
        const matched = [];
        list.forEach((company) => {
            if (text.includes(company)) {
                matched.push(company.charAt(0).toUpperCase() + company.slice(1));
            }
        });
        return matched;
    }
    extractTechnologies(text) {
        const list = ['react', 'nextjs', 'typescript', 'rust', 'python', 'kubernetes', 'docker', 'graphql', 'postgres', 'llm', 'copilot', 'gemini', 'chatgpt', 'stable diffusion', 'transformers'];
        const matched = [];
        list.forEach((tech) => {
            if (text.includes(tech)) {
                matched.push(tech.toUpperCase());
            }
        });
        return matched;
    }
    extractFounders(text) {
        const list = ['sam altman', 'elon musk', 'jensen huang', 'mark zuckerberg', 'satya nadella', 'sundar pichai', 'tim cook', 'vitalik buterin'];
        const matched = [];
        list.forEach((name) => {
            if (text.includes(name)) {
                matched.push(name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
            }
        });
        return matched;
    }
    calculateMetrics(text, category) {
        let aiImpactScore = Math.floor(Math.random() * 30) + 20;
        let marketImpactScore = Math.floor(Math.random() * 40) + 30;
        let innovationScore = Math.floor(Math.random() * 30) + 40;
        let businessImpactScore = Math.floor(Math.random() * 30) + 45;
        let viralityScore = Math.floor(Math.random() * 40) + 50;
        if (category === 'AI_ML') {
            aiImpactScore = Math.floor(Math.random() * 20) + 80;
            innovationScore = Math.floor(Math.random() * 15) + 85;
        }
        if (category === 'FUNDING') {
            marketImpactScore = Math.floor(Math.random() * 20) + 80;
            businessImpactScore = Math.floor(Math.random() * 20) + 75;
        }
        if (text.includes('openai') || text.includes('apple') || text.includes('nvidia') || text.includes('musk')) {
            viralityScore = Math.floor(Math.random() * 15) + 85;
        }
        return { aiImpactScore, marketImpactScore, innovationScore, businessImpactScore, viralityScore };
    }
    generateStructuredSummaries(headline, excerpt, category, companies, technologies) {
        const companyStr = companies.length > 0 ? companies.join(', ') : 'leading tech companies';
        const techStr = technologies.length > 0 ? ` leveraging ${technologies.join(', ')}` : '';
        const quickSummary = `Techgram analysts report that ${headline}. This update indicates a growing shift in the ${category.replace('_', ' ')} sector, impactfully affecting ${companyStr}${techStr}. The development highlights major near-term changes in tech ecosystems.`;
        const detailedSummary = [
            `${headline} marks a critical shift in technology trends.`,
            `The article details how ${companyStr} is leading the charge in this development.`,
            `Key technical details involve ${category.replace('_', ' ')} advancements${techStr}.`,
            `Industry analysts suggest this could change deployment and enterprise practices.`,
            `The long-term impact will likely reshape user behaviors and business investments.`
        ];
        const deepAnalysis = `The recent development surrounding "${headline}" marks a significant evolutionary step in the ${category.replace('_', ' ')} domain. By integrating these advancements, organizations are finding new paths for scalability and performance optimizations. As ${companyStr} drives this implementation, competitive pressure will mount on peer organizations to deliver similar architectures.\n\nFrom a technical perspective, this change highlights the viability of ${technologies.length > 0 ? technologies.join(', ') : 'modern tech stacks'} in production environments. Overcoming legacy limitations remains the core challenge, but these recent results show clear pathways forward. We expect rapid adoption cycles over the coming months.\n\nStrategically, this serves as an indicator of broader industry consolidation and alignment. The convergence of hardware capability and software efficiency continues to be the primary engine of value creation. Leaders must prepare for secondary disruptions across adjacent sectors.`;
        const whyItMatters = {
            market: `Shifts capital allocations toward highly-scalable ${category.replace('_', ' ')} technologies.`,
            business: `Increases operational efficiencies and forces competitors to adopt modern architectures.`,
            technology: `Proves feasibility of high-performance technical configurations in live production.`,
            developer: `Creates new API capabilities and library standards for deployment pipelines.`,
            consumer: `Brings more responsive features and seamless integrations to everyday products.`
        };
        const whatHappensNext = `We anticipate immediate API availability updates and further tooling releases from ${companyStr} within the quarter. Competitors will likely announce counter-strategies within 60 days, followed by widespread developer adoption.`;
        return { quickSummary, detailedSummary, deepAnalysis, whyItMatters, whatHappensNext };
    }
    extractImageUrl(item) {
        if (item.enclosure && item.enclosure.url) {
            return item.enclosure.url;
        }
        const content = item.content || '';
        const imgRegex = /<img[^>]+src="([^">]+)"/g;
        const match = imgRegex.exec(content);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    }
    getDefaultImage(category) {
        const map = {
            AI_ML: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
            FUNDING: 'https://images.unsplash.com/photo-1553729459-beb747028b4e?w=800&auto=format&fit=crop&q=80',
            PRODUCT_LAUNCH: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
            DEVELOPER_TOOLS: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=800&auto=format&fit=crop&q=80',
            CYBERSECURITY: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
            HARDWARE: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
            ENTERPRISE: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
            WEB3: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&auto=format&fit=crop&q=80',
            POLICY: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
            CONSUMER_TECH: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
        };
        return map[category] || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80';
    }
};
exports.CrawlerService = CrawlerService;
exports.CrawlerService = CrawlerService = CrawlerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pulse_gateway_1.PulseGateway])
], CrawlerService);
//# sourceMappingURL=crawler.service.js.map