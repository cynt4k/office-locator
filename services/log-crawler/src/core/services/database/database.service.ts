import { Sequelize } from 'sequelize';
import { IConfigDatabase } from '@home/types';
import { LogModel } from '@home/models';

export namespace DatabaseService {
    let config: IConfigDatabase;
    let connection: Sequelize;

    export async function init(_configDatabase: IConfigDatabase): Promise<void> {
        config = _configDatabase;

        try {
            await connect();
            await initTables();
        } catch (e) {
            throw e;
        }
    }

    async function connect(): Promise<void> {
        connection = new Sequelize({
            host: config.server,
            username: config.username,
            password: config.password,
            database: config.database,
            dialect: 'mssql',
            logging: false,
            pool: {
                max: 5,
                min: 2,
                acquire: 3000,
                idle: 10000
            }
        });

        await connection.authenticate();
    }

    async function initTables(): Promise<void> {
        LogModel(connection);
    }
}
