import { Logs } from '@home/models';

export namespace CrawlerController {

    export async function getAllLogs(): Promise<Logs[]> {
        try {
            const logs = await Logs.findAll({
                where: {
                    nasPortType: 19,
                    acctAuthentic: 1
                }
            });
            return logs;
        } catch (e) {
            throw e;
        }
    }

    export async function getLastLogForDevice(deviceMac: string): Promise<Logs[]> {
        try {
            return await Logs.findAll({
                where: {
                    nasPortType: 19,
                    acctAuthentic: 1,
                    callingStationIp: deviceMac
                },
                limit: 1,
                order: [['timeStamp', 'DESC']]
            });
        } catch (e) {
            throw e;
        }
    }
}
