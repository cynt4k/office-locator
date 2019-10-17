import { ConsumeMessage } from 'amqplib';
import { Logger } from '@home/core/utils';

export namespace RpcService {

    export function handleRpcMessages(msg: ConsumeMessage | null): void {
        if (msg !== null) {
            // switch (msg.properties.type as string) {

            // }
        }
    }
}
