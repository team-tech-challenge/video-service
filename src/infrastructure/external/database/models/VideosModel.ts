import { Table, Column, DataType, Model, HasMany } from "sequelize-typescript";
import { FrameModel } from "./FramesModel";

@Table({
	timestamps: true,
	tableName: "videos",
	modelName: "Videos",
})
export class VideoModel extends Model {
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	})
	declare id: number;

	@Column({
		type: DataType.INTEGER,		
		allowNull: false,		
	})
	declare idUser: number;

	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	declare s3Key: string;
	
	@Column({
		type: DataType.STRING,
		allowNull: false,		
	})
	name: string;
	
	@Column({
		type: DataType.STRING,
		allowNull: false,		
	})
	extension: string;

	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	declare url?: string;

	@HasMany(() => FrameModel)
	frames: FrameModel[];
	
}
