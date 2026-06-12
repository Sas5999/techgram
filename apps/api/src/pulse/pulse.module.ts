import { Module } from '@nestjs/common';
import { PulseGateway } from './pulse.gateway';

@Module({
  providers: [PulseGateway],
  exports: [PulseGateway],
})
export class PulseModule {}
