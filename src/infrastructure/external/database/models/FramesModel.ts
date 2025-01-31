import { Table, Column, DataType, Model, ForeignKey } from "sequelize-typescript";
import { VideoModel } from "./VideosModel";

@Table({
  timestamps: true,
  tableName: "frames",
  modelName: "Frame",
})
export class FrameModel extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @ForeignKey(() => VideoModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare videoId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare s3Key: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare extension: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare url?: string;
}
