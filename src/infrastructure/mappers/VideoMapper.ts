import { Video } from "@entities/Video";

export class VideoMapper {
    static toEntity(videoModel: any): Video {
        return new Video(videoModel.idUser, videoModel.name, videoModel.s3Key, videoModel.extension, videoModel.url, videoModel.id);
    }

    static toModel(video: Video): any {
        return {
            id: video.getId(),
            idUser: video.getIdUser(),
            name: video.getFileName(),
            s3Key: video.getS3Key(),
            extension: video.getExtension(),
            url: video.getUrl(),
        };
    }
}
