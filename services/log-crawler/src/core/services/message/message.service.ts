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

    const rpcWifiList: Array<IRpcWifiMsg> = [];


    interface IRpcWifiMsg {
        id: string;
        msg: Buffer;
        cb: (res: string) => void;
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
        await createQueue(queues.request.wifi.responseQueue, queues.request.wifi.responseQueue);
    }

    async function createConsumer(): Promise<void> {

        async function consumeQueue(name: string, cb: (msg: amqp.ConsumeMessage | null) => void): Promise<void> {
            const queue = `${amqpConfig.prefix}.${name}`;
            channel.consume(queue, cb);
        }

        consumeQueue(queues.request.wifi.responseQueue, (msg) => {
            if (msg !== null) {
                if (msg.properties.messageId) {
                    const id = msg.properties.messageId as string;
                    const rpcMsg = _.find(rpcWifiList, (entry) => entry.id === id);
                    if (rpcMsg) {
                        rpcWifiList.splice(rpcWifiList.indexOf(rpcMsg), 1);
                        return rpcMsg.cb(msg.content.toString());
                    }
                }
                Logger.debug(`message.service.ts - Received wifi rpc message content: ${msg.content.toString()}`);
                Logger.warn(`message.service.ts - Wifi RPC message without id`);
            }
        });
    }

    export async function sendRpcWifi(msg: object): Promise<string> {
        const id = uuid4();
        const msgBuffer = Buffer.from(JSON.stringify(msg));
        return new Promise<string>((resolve, reject) => {
            const timer = setTimeout(() => {
                return reject(new LogCrawlerError(`Timeout while receiving rpc response`, ErrorCode.RPC_TIMEOUT));
            }, 5000);

            const msgRpc: IRpcWifiMsg = {
                id: id,
                msg: msgBuffer,
                cb: (res: string) => {
                    clearTimeout(timer);
                    return resolve(res);
                }
            };
            rpcWifiList.push(msgRpc);
            channel.publish(amqpConfig.exchange, queues.request.wifi.routingKey, msgBuffer, { messageId: id });
        });
    }
}
