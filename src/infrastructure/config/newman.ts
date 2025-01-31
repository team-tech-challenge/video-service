

// import sidecarData from "./tech-challenge-sidecar.json";
// import * as newman from "newman";
// import axios from "axios";

// export default () => {
// 	let data = { ...sidecarData };
// 	let API_ADDRESS = `http://${process.env.HOST}:${process.env.PORT}`;
// 	let config = {
// 		method: "GET",
// 		url: `${API_ADDRESS}/video/all`,
// 	};

// 	axios.request(config)
// 		.then((response) => {
// 			if (response.data["Videos"] == 0) {
// 				data.[0].value = API_ADDRESS;
// 				newman.run({
// 					collection: data,
// 					reporters: "cli"
// 				});
// 			}
// 		})

// 	return true;
// };
