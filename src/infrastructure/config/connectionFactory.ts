import pg from "pg";
import { Sequelize } from "sequelize-typescript";

const database = new Sequelize({
	database: process.env.POSTGRES_DB,
	username: process.env.POSTGRES_USER,
	password: process.env.POSTGRES_PASSWORD,
	host: process.env.POSTGRES_HOST,
	port: parseInt(process.env.POSTGRES_PORT),
	dialect: "postgres",
	dialectModule: pg,
	models: [__dirname + "\\external\\database\\models"],
});

export default {
	Sequelize: Sequelize,
	database: database,
};

