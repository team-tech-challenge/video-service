import { Frame } from "@entities/Frame";

export interface IFrameGateway {
    /**
     * Recupera todos os frames do banco de dados.
     * @returns Uma lista de objetos Frame.
     */
    allFrames(): Promise<Frame[]>;

    /**
     * Recupera um frame específico pelo seu ID.
     * @param id O ID do frame.
     * @returns O objeto Frame ou null se não encontrado.
     */
    getFrameById(id: number): Promise<Frame | null>;

    /**
     * Cria um novo frame no banco de dados.
     * @param frame O objeto Frame a ser criado.
     * @returns O objeto Frame criado.
     */
    saveFrame(frame: Frame): Promise<Frame>;

    /**
     * Atualiza os valores de um frame existente.
     * @param id O ID do frame a ser atualizado.
     * @param updatedValues Os valores atualizados do frame.
     */
    updateFrame(id: number, updatedValues: Partial<Frame>): Promise<void>;

    /**
     * Exclui um frame do banco de dados.
     * @param id O ID do frame a ser excluído.
     */
    deleteFrame(id: number): Promise<void>;

    /**
     * Recupera todos os frames associados a um vídeo específico.
     * @param videoId O ID do vídeo ao qual os frames pertencem.
     * @returns Uma lista de objetos Frame associados ao vídeo.
     */
    getFramesByVideoId(videoId: number): Promise<Frame[]>;
}