import connection from "@config/connectionFactory";
import { FrameModel } from "@database/FramesModel";
import { VideoModel } from "@database/VideosModel";

export default () => {
	connection.database.addModels([		
		VideoModel,		
		FrameModel,		
	]);
};
