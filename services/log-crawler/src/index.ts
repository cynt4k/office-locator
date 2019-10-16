import 'module-alias/register';
import config from 'config';
import { IConfigAmqp, IConfigQueues, IConfigDatabase } from '@home/types';
import { MessageService } from '@home/core/services';
import { Logger } from '@home/core/utils';
import { DatabaseService } from '@home/core/services/database/database.service';
import { CrawlerController } from '@home/controller/crawler';

const configAmqp = config.get<IConfigAmqp>('amqp');
const configQueues = config.get<IConfigQueues>('queues');
const configDatabase = config.get<IConfigDatabase>('database');

Logger.init();

(async () => {
    try {
        await MessageService.init(configAmqp, configQueues);
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

    const response = await MessageService.rpcBroadcast({ jo: 'test' }, MessageService.EnumRpcQueues.WIFI);
    console.log(response);

    // const logs = await CrawlerController.getLastLogForDevice('64-A2-F9-31-01-76');
    // console.log(logs);
    // Logger.debug(logs.map((val) => val.toJSON()).reduce((prev, cur) => {
    //     prev = `${prev}\n${JSON.stringify(cur)}`;
    //     return prev;
    // }, ''));
})();
