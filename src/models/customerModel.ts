import { DataTypes } from "sequelize";
import sequelize from "../postgresDB/pgConfig";
import { BaseEntity } from "./baseEntity";
import { ICustomer } from "../interfaces/customerInterface";

class Customer extends BaseEntity implements ICustomer {
  public customerUId!: string;
  public organizationId!: string;
  public legalName!: string;
  public shortName!: string;
  public displayName!: string;
  public addressId!: string;
  public isMSASigned!: boolean;
  public msaSignedOn!: Date;
  public msaValidFrom!: Date;
  public msaValidUpto!: Date;
  public isNDASigned!: boolean;
  public ndaSignedOn!: Date;
  public ndaValidFrom!: Date;
  public ndaValidUpto!: Date;
}

Customer.init(
  {
    ...BaseEntity.baseFields,
    customerUId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "organizations",
        key: "id",
      },
    },
    legalName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shortName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    addressId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isMSASigned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    msaSignedOn: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    msaValidFrom: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    msaValidUpto: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    isNDASigned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    ndaSignedOn: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    ndaValidFrom: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    ndaValidUpto: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "customers",
    timestamps: true,
  }
);

export default Customer;