import { Sequelize, Model, DataTypes, BuildOptions } from 'sequelize';
import { HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyHasAssociationMixin, Association, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin } from 'sequelize';

export class Logs extends Model {
    public id!: number;
    public computerName!: string;
    public userName!: string | null;
    public timeStamp!: Date;
    public clientFriendlyName!: string | null;
    public clientIpAddress!: string | null;
    public callingStationIp!: string | null;
    public nasPortType!: number | null;
    public acctAuthentic!: number | null;
}

export const LogModel = ((conn: Sequelize): void => {
    Logs.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        computerName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'Computer_Name'
        },
        userName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'User_Name'
        },
        timeStamp: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'timestamp'
        },
        clientFriendlyName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'Client_Friendly_Name'
        },
        clientIpAddress: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'Client_IP_Address'
        },
        callingStationIp: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'Calling_Station_Id'
        },
        nasPortType: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'NAS_Port_Type'
        },
        acctAuthentic: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'Acct_Authentic'
        }
    }, {
        sequelize: conn,
        tableName: 'accounting_data',
        timestamps: false
    });
});
