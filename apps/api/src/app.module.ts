import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { CrawlerModule } from './crawler/crawler.module';
import { PulseModule } from './pulse/pulse.module';
import { StoriesModule } from './stories/stories.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    DbModule,
    CrawlerModule,
    PulseModule,
    StoriesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
