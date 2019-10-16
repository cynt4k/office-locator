export interface IConfigAmqp {
    host: string;
    username: string;
    password: string;
    exchange: string;
    prefix: string;
}

export interface IConfigQueues {
    rpc: {
        ownRpcQueuePrefix: string;
        responseQueuePrefix: string;
        rpcTimeout: number;
        names: {
            [name: string]: string;
        };
    };
    // request: {
    //     wifi: IConfigQueuesRpc;
    // };
    // response: {
    //     logCrawler: IConfigQueuesRpc;
    // };
}

export interface IConfigQueuesRpc {
    routingKey: string;
    responseQueue: string;
}

export interface IConfigDatabase {
    server: string;
    username: string;
    password: string;
    database: string;
}

export interface IConfig {
    amqp: IConfigAmqp;
    queues: IConfigQueues;
    database: IConfigDatabase;
}