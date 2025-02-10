import { Frame } from "@entities/Frame";

export class FrameMapper {
    static toEntity(frameModel: any): Frame {
        return new Frame(
            frameModel.name,
            frameModel.videoId,
            frameModel.s3Key,
            frameModel.extension,
            frameModel.url,
            frameModel.id
        );
    }

    static toModel(frame: Frame): any {
        return {
            id: frame.getId(),
            videoId: frame.getVideoId(),
            s3Key: frame.getS3Key(),
            name: frame.getFileName(),
            extension: frame.getExtension(),
            url: frame.getUrl(),
        };
    }
}
