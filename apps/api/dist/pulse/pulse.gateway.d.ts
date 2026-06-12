import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class PulseGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger;
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribeTopics(topics: string[], client: Socket): {
        event: string;
        status: string;
        topics: string[];
    };
    broadcastPulseUpdate(data: any): void;
    broadcastFeedUpdate(data: any): void;
}
