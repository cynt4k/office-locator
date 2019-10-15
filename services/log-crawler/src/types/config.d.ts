export interface IConfigAmqp {
    host: string;
    username: string;
    password: string;
    exchange: string;
    prefix: string;
}

export interface IConfigQueues {
    request: {
        wifi: IConfigQueuesRpc;
    };
    response: {
        logCrawler: IConfigQueuesRpc;
    };
}

export interface IConfigQueuesRpc {
    routingKey: string;
    responseQueue: string;
}

export interface IConfig {
    amqp: IConfigAmqp;
    queues: IConfigQueues;
}