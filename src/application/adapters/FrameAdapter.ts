import { IFrameGateway } from "@gateways/IFrameGateway";
import { Frame } from "@entities/Frame";
import { FrameModel } from "@database/FramesModel";
import { FrameMapper } from "@mappers/FrameMapper";

export class FrameAdapter implements IFrameGateway {
    async allFrames(): Promise<Frame[]> {
        const frameModels = await FrameModel.findAll();
        return frameModels.map((model) => FrameMapper.toEntity(model));
    }

    async getFrameById(id: number): Promise<Frame | null> {
        const frameModel = await FrameModel.findByPk(id);
        return frameModel ? FrameMapper.toEntity(frameModel) : null;
    }

    async saveFrame(frame: Frame): Promise<Frame> {
        const frameModel = await FrameModel.create(FrameMapper.toModel(frame));
        return FrameMapper.toEntity(frameModel);
    }

    async updateFrame(id: number, updatedValues: Partial<Frame>): Promise<void> {
        await FrameModel.update(updatedValues, { where: { id } });
    }

    async deleteFrame(id: number): Promise<void> {
        await FrameModel.destroy({ where: { id } });
    }

    async getFramesByVideoId(videoId: number): Promise<Frame[]> {
        const frameModels = await FrameModel.findAll({ where: { videoId } });
        return frameModels.map((model) => FrameMapper.toEntity(model));
    }
}
