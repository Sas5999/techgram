import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { PulseModule } from '../pulse/pulse.module';

@Module({
  imports: [PulseModule],
  providers: [CrawlerService],
  exports: [CrawlerService],
})
export class CrawlerModule {}
