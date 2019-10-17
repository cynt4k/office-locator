import 'module-alias/register';
import config from 'config';
import { IConfigAmqp, IConfigQueues, IConfigDatabase } from '@home/types';
import { MessageService, RpcService } from '@home/core/services';
import { Logger } from '@home/core/utils';
import { DatabaseService } from '@home/core/services/database/database.service';
import { CrawlerController } from '@home/controller/crawler';


const configAmqp = config.get<IConfigAmqp>('amqp');
const configQueues = config.get<IConfigQueues>('queues');
const configDatabase = config.get<IConfigDatabase>('database');

Logger.init();

(async (): Promise<void> => {
    try {
        await MessageService.init(configAmqp, configQueues, RpcService.handleRpcMessages);
        Logger.info(`Connection to AMQP ${configAmqp.host} successfull`);
    } catch (e) {
        Logger.error(e);
        process.exit(1);
    }

    try {
        await DatabaseService.init(configDatabase);
        Logger.info(`Connection to database ${configDatabase.server} successfull`);
    } catch (e) {
        Logger.error(e);
        process.exit(1);
    }

    // const response = await MessageService.rpcBroadcast({ jo: 'test' }, MessageService.EnumRpcQueues.WIFI);
    const response = await MessageService.rpcAnycast({ jo: 'asf' }, MessageService.EnumRpcQueues.WIFI);
    console.log(response);

    async function exitHandler(exitCode?: number): Promise<void> {
        await MessageService.disconnect();
    }

    process.on('exit', exitHandler);
    process.on('SIGINT', exitHandler);
    process.on('SIGUSR1', exitHandler);
    process.on('SIGUSR2', exitHandler);

    // const logs = await CrawlerController.getLastLogForDevice('64-A2-F9-31-01-76');
    // console.log(logs);
    // Logger.debug(logs.map((val) => val.toJSON()).reduce((prev, cur) => {
    //     prev = `${prev}\n${JSON.stringify(cur)}`;
    //     return prev;
    // }, ''));
})();
