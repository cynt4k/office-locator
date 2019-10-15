import 'module-alias/register';
import config from 'config';
import { IConfigAmqp, IConfigQueues } from '@home/types';
import { MessageService } from '@home/core/services';
import { Logger } from '@home/core/utils';

const configAmqp = config.get<IConfigAmqp>('amqp');
const configQueues = config.get<IConfigQueues>('queues');

Logger.init();

(async () => {
    try {
        await MessageService.init(configAmqp, configQueues);
        Logger.info(`Connection to ${configAmqp.host} successfull`);
    } catch (e) {
        Logger.error(e);
        process.exit(1);
    }
})();
