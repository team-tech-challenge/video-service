import { Video } from "@entities/Video";

export interface IVideoGateway {
    /**
     * Recupera todos os vídeos do banco de dados.
     * @returns Uma lista de objetos Video.
     */
    allVideos(): Promise<Video[]>;

    /**
     * Recupera um vídeo específico pelo seu ID.
     * @param id O ID do vídeo.
     * @returns O objeto Video ou null se não encontrado.
     */
    getVideoById(id: number): Promise<Video | null>;

    /**
     * Cria um novo vídeo no banco de dados.
     * @param video O objeto Video a ser criado.
     * @returns O objeto Video criado.
     */
    saveVideo(video: Video): Promise<Video>;

    /**
     * Atualiza os valores de um vídeo existente.
     * @param id O ID do vídeo a ser atualizado.
     * @param updatedValues Os valores atualizados do vídeo.
     */
    updateVideo(id: number, updatedValues: Partial<Video>): Promise<void>;

    /**
     * Exclui um vídeo do banco de dados.
     * @param id O ID do vídeo a ser excluído.
     */
    deleteVideo(id: number): Promise<void>;
}
