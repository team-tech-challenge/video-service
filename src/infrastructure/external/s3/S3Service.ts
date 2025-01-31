import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";

export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;

    constructor(bucketName: string) {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || "us-west-2",
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });

        this.bucketName = bucketName || "fiap-video-frame";
    }

    /**
     * Faz o upload de um arquivo para o S3.
     * @param key - Caminho do arquivo dentro do bucket.
     * @param fileStream - Stream do arquivo ou Buffer.
     * @param contentType - Tipo de conteúdo do arquivo.
     */
    async uploadFile(key: string, fileStream: fs.ReadStream | Buffer, contentType: string): Promise<string> {
        const params = {
            Bucket: this.bucketName,
            Key: key,
            Body: fileStream,
            ContentType: contentType,
        };

        const command = new PutObjectCommand(params);
        await this.s3Client.send(command);

        return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`; // Retorna a URL do arquivo no S3
    }

    /**
     * Faz o download de um arquivo do S3 e o salva localmente.
     * @param s3Key - A chave do arquivo no S3 (path do arquivo no bucket).
     * @param localFilePath - O caminho local onde o arquivo será salvo.
     */
    async downloadFile(s3Key: string, localFilePath: string): Promise<void> {
        try {
            // Remove a URL completa e mantém apenas o caminho do arquivo no S3
            const cleanedKey = s3Key.replace(/^https?:\/\/[^/]+\//, "");

            console.log(`Iniciando download: Bucket=${this.bucketName}, Key=${cleanedKey}`);

            // Verifica se o arquivo existe no S3
            try {
                const headCommand = new HeadObjectCommand({
                    Bucket: this.bucketName,
                    Key: cleanedKey,
                });

                await this.s3Client.send(headCommand);
                console.log("Arquivo encontrado no S3.");
            } catch (err) {
                console.error("O arquivo especificado não existe no S3.");
                throw new Error("O arquivo especificado não existe no S3.");
            }

            // Cria o diretório local, se necessário
            const dir = path.dirname(localFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Configura os parâmetros para download
            const getCommand = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: cleanedKey,
            });

            const { Body } = await this.s3Client.send(getCommand);

            return new Promise((resolve, reject) => {
                if (!Body) {
                    return reject(new Error("Erro: Resposta do S3 não contém um corpo de arquivo válido."));
                }

                const fileStream = fs.createWriteStream(localFilePath);
                const s3Stream = Body as NodeJS.ReadableStream;

                s3Stream.pipe(fileStream);

                fileStream.on("finish", () => {
                    console.log(`Arquivo baixado com sucesso: ${localFilePath}`);
                    resolve();
                });

                s3Stream.on("error", (err) => {
                    console.error(`Erro no stream do S3: ${err.message}`);
                    reject(new Error(`Erro ao baixar o arquivo do S3: ${err.message}`));
                });

                fileStream.on("error", (err) => {
                    console.error(`Erro ao salvar o arquivo localmente: ${err.message}`);
                    reject(new Error(`Erro ao salvar o arquivo: ${err.message}`));
                });
            });
        } catch (error) {
            console.error(`Erro ao fazer o download: ${error.message}`);
            throw error;
        }
    }
}
