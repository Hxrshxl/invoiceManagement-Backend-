import { DataTypes } from "sequelize";
import sequelize from "../postgresDB/pgConfig";
import { IOrganization } from "../interfaces/organizationInterface";
import { BaseEntity } from "./baseEntity";

class Organization extends BaseEntity implements IOrganization {
  public gstNo!: string;
  public panNo!: string;
  public legalOrganizationName!: string;
  public invoiceTemplateId!: string;
  public shortName!: string;
  public contactName!: string;
  public displayName!: string;
  public email!: string;
  public addressId!: string;
  public phone!: string;
}

Organization.init(
  {
    ...BaseEntity.baseFields,
    gstNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    panNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    legalOrganizationName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    invoiceTemplateId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shortName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    addressId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "organizations",
    timestamps: true,
  }
);

export default Organization;