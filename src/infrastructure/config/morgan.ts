import morgan from "morgan";
import fs from "fs";

export default (express: any) => {
	const streamConfig: object = { flags: "a" };
	const id: string = new Date().toISOString().slice(0, 10);

	let accessLogPath: string = logPath("access", id);
	let errorLogPath: string = logPath("error", id);

	if (!fs.existsSync("./logs/")) fs.mkdirSync("./logs/");

	if (!fs.existsSync(accessLogPath))
		fs.writeFileSync(accessLogPath, "--- ACCESS LOG --- \n");

	if (!fs.existsSync(errorLogPath))
		fs.writeFileSync(errorLogPath, "--- ERROR LOG --- \n");

	express.use(morganLogSettings(streamConfig, morgan, "access", id));
	express.use(morganLogSettings(streamConfig, morgan, "error", id));

	return express;
};

const morganLogSettings = (
	streamConfig: any,
	morgan: any,
	type: string,
	id: string
) => {
	return morgan("common", {
		skip: (req, res) => {
			switch (type) {
				case "access":
					return res.statusCode > 400;
				case "error":
					return res.statusCode < 400;
			}
		},
		stream: fs.createWriteStream(logPath(type, id), streamConfig),
	});
};

const logPath = (type: string, id: string) => {
	return `./logs/${type}-${id}.log`;
};
