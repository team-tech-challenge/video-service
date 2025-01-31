import http from "http";
//import newman from "@config/newman";
import express from "@config/express";
import connection from "@config/connectionFactory";

const server = new http.Server(express());
const port = Number(process.env.PORT);

connection.database.sync().then(() => {
	server.listen(port, () => {
		console.log(`Server running on ${port}`);
		//newman();
	});
});
