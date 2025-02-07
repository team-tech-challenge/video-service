import { IVideoGateway } from "@gateways/IVideoGateway";
import { Video } from "@entities/Video";
import { VideoModel } from "@database/VideosModel";
import { VideoMapper } from "@mappers/VideoMapper";

export class VideoAdapter implements IVideoGateway {
    async allVideos(): Promise<Video[]> {
        const videoModels = await VideoModel.findAll();
        return videoModels.map((model) => VideoMapper.toEntity(model));
    }

    async getVideoById(id: number): Promise<Video | null> {
        const videoModel = await VideoModel.findByPk(id);        
        return videoModel ? VideoMapper.toEntity(videoModel) : null;
    }

    async saveVideo(video: Video): Promise<Video> {
        const videoModel = await VideoModel.create(VideoMapper.toModel(video));
        return VideoMapper.toEntity(videoModel);
    }

    async updateVideo(id: number, updatedValues: Partial<Video>): Promise<void> {
        await VideoModel.update(updatedValues, { where: { id } });
    }

    async deleteVideo(id: number): Promise<void> {
        await VideoModel.destroy({ where: { id } });
    }
}
