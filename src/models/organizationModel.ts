import { DataTypes } from "sequelize";
import sequelize from "../postgresDB/pgConfig";
import { BaseEntity } from "./baseEntity";
import { IOrganization } from "../interfaces/organizationInterface";

class Organization extends BaseEntity implements IOrganization {
  public organizationUId!: string;
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
    organizationUId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
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