import uuid4 from 'uuid/v4';
import amqp from 'amqplib';
import _ from 'lodash';
import { IConfigAmqp, IConfigQueues } from '@home/types';
import { Logger } from '@home/core/utils';
import { LogCrawlerError, ErrorCode } from '@home/error';

export namespace MessageService {
    let initialized = false;
    let amqpConfig: IConfigAmqp;
    let queues: IConfigQueues;
    let connection: amqp.Connection;
    let channel: amqp.Channel;

    const rpcCache: Array<IRpcMsg> = [];

    interface IRpcMsg {
        id: string;
        msg: Buffer;
        type: EnumRpcQueues;
        cb: (res: string) => void;
    }

    export enum EnumRpcQueues {
        WIFI = 'wifi'
    }

    enum EnumRpcTypes {
        BROADCAST,
        UNICAST,
        ANYCAST
    }


    export async function init(_amqpConfig: IConfigAmqp, _queues: IConfigQueues): Promise<void> {
        amqpConfig = _amqpConfig;
        queues = _queues;

        try {
            await connect();
            await createConsumer();
        } catch (e) {
            throw e;
        }

        initialized = true;
    }

    async function connect(): Promise<void> {

        async function createQueue(name: string, bindingKey: string): Promise<void> {
            const queueName = `${amqpConfig.prefix}.${name}`;
            await channel.assertQueue(queueName, { expires: 3600000 });
            await channel.bindQueue(queueName, amqpConfig.exchange, bindingKey);

        }

        connection = await amqp.connect(`amqp://${amqpConfig.username}:${amqpConfig.password}@${amqpConfig.host}`);
        channel = await connection.createChannel();
        await channel.assertExchange(amqpConfig.exchange, 'topic', { autoDelete: true });
        await createQueue(queues.rpc.responseQueuePrefix, queues.rpc.responseQueuePrefix);
    }

    async function createConsumer(): Promise<void> {

        async function consumeQueue(name: string, cb: (msg: amqp.ConsumeMessage | null) => void): Promise<void> {
            const queue = `${amqpConfig.prefix}.${name}`;
            channel.consume(queue, cb);
        }

        consumeQueue(queues.rpc.responseQueuePrefix, (msg) => {
            if (msg !== null) {
                if (msg.properties.messageId) {
                    const id = msg.properties.messageId as string;
                    const rpcMsg = _.find(rpcCache, (entry) => entry.id === id);
                    if (rpcMsg) {
                        rpcCache.splice(rpcCache.indexOf(rpcMsg), 1);
                        rpcMsg.cb(msg.content.toString());
                    } else {
                        Logger.warn(`message.service.ts - RPC messageId ${id} not in cache`);
                    }
                } else {
                    Logger.debug(`message.service.ts - Received rpc message content: ${msg.content.toString()}`);
                    Logger.warn(`message.service.ts - RPC message without id`);
                }
                channel.ack(msg);
            } else {
                Logger.warn(`message.service.ts - Empty RPC message`);
            }
        });
    }

    export async function rpcAnycast(msg: object, rpcQueue: EnumRpcQueues): Promise<string> {
        return rpc(msg, rpcQueue, EnumRpcTypes.ANYCAST);
    }

    export async function rpcUnicast(msg: object, destination: string, rpcQueue: EnumRpcQueues): Promise<string> {
        return rpc(msg, rpcQueue, EnumRpcTypes.UNICAST, destination);
    }

    export async function rpcBroadcast(msg: object, rpcQueue: EnumRpcQueues): Promise<string> {
        return rpc(msg, rpcQueue, EnumRpcTypes.BROADCAST);
    }

    async function rpc(msg: object, rpcQueue: EnumRpcQueues, type: EnumRpcTypes, destination?: string): Promise<string> {
        const id = uuid4();
        const msgBuffer = Buffer.from(JSON.stringify(msg));

        return new Promise<string>((resolve, reject) => {
            let routingKey = `${queues.rpc.names[rpcQueue.toString()]}`;
            switch (type) {
                case EnumRpcTypes.ANYCAST: routingKey = `${routingKey}.anycast`; break;
                case EnumRpcTypes.UNICAST: routingKey = `${routingKey}.unicast.${destination}`; break;
                case EnumRpcTypes.BROADCAST: routingKey = `${routingKey}.broadcasts`; break;
                default: return reject(new LogCrawlerError(`Invalid RPC routingKey ${type}`));
            }

            const timer = setTimeout(() => {
                return reject(new LogCrawlerError(`Timeout while receiving rpc response for messageId ${id}`, ErrorCode.RPC_TIMEOUT));
            }, queues.rpc.rpcTimeout);

            const msgRpc: IRpcMsg = {
                id,
                msg: msgBuffer,
                type: rpcQueue,
                cb: (res: string) => {
                    clearTimeout(timer);
                    return resolve(res);
                }
            };

            rpcCache.push(msgRpc);
            // const routingKey = `${queues.rpc.names[rpcQueue.toString()]}.broadcast`;
            channel.publish(amqpConfig.exchange, routingKey, msgBuffer, { messageId: id, replyTo: queues.rpc.responseQueuePrefix });
        });
    }
}
