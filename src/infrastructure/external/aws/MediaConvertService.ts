import AWS from "aws-sdk";

export class MediaConvertService {
    private mediaConvert: AWS.MediaConvert;
    private s3: AWS.S3;
    private readonly bucketName: string;
    private readonly endpoint: string;

    constructor() {
        this.endpoint = process.env.AWS_MEDIACONVERT_ENDPOINT || "";
        this.bucketName = process.env.AWS_S3_BUCKET || "fiap-video-frame";
        this.mediaConvert = new AWS.MediaConvert({
            region: process.env.AWS_REGION,
            endpoint: this.endpoint,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });

        this.s3 = new AWS.S3({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
    }

    /**
     * Cria um job no AWS Elemental MediaConvert para extrair frames e gerar um vídeo MP4.
     * @param inputFile - URL do vídeo no S3
     * @param outputFolder - Pasta de destino no S3
     * @returns O ID do job criado
     */
    async createFrameExtractionJob(inputFile: string, outputFolder: string): Promise<string> {
        try {
            const params: AWS.MediaConvert.CreateJobRequest = {                
                Role: process.env.AWS_MEDIACONVERT_ROLE, // IAM Role para permissões
                Settings: {
                    Inputs: [
                        {
                            FileInput: inputFile, // Caminho do vídeo no S3
                        },
                    ],
                    OutputGroups: [
                        {
                            Name: "File Group",
                            Outputs: [
                                {
                                    ContainerSettings: {
                                        Container: "MP4",
                                    },
                                    VideoDescription: {
                                        CodecSettings: {
                                            Codec: "H_264",
                                            H264Settings: {
                                                MaxBitrate: 5000000,
                                                RateControlMode: "QVBR",
                                            },
                                        },
                                    },
                                },
                            ],
                            OutputGroupSettings: {
                                Type: "FILE_GROUP_SETTINGS",
                                FileGroupSettings: {
                                    Destination: `${outputFolder}`,
                                },
                            },
                        },
                        {
                            Name: "Frame Capture Group",
                            Outputs: [
                                {
                                    ContainerSettings: {
                                        Container: "RAW",
                                    },
                                    VideoDescription: {
                                        CodecSettings: {
                                            Codec: "FRAME_CAPTURE",
                                            FrameCaptureSettings: {
                                                FramerateNumerator: 1, // 1 frame por segundo
                                                FramerateDenominator: 1,
                                                MaxCaptures: 100, // Máximo de frames extraídos
                                                Quality: 80, // Qualidade das imagens
                                            },
                                        },
                                    },
                                },
                            ],
                            OutputGroupSettings: {
                                Type: "FILE_GROUP_SETTINGS",
                                FileGroupSettings: {
                                    Destination: `${outputFolder}`,
                                },
                            },
                        },
                    ],
                },
            };
            console.log(JSON.stringify(params, null, 2))
            const jobResponse = await this.mediaConvert.createJob(params).promise();
            console.log("Job de extração criado:", jobResponse.Job?.Id);
            return jobResponse.Job?.Id || "";
        } catch (error) {
            console.error("Erro ao criar job no AWS MediaConvert:", error);
            throw new Error("Erro ao criar job no AWS MediaConvert.");
        }
    }

    /**
     * Verifica o status de um job no AWS Elemental MediaConvert
     * @param jobId - O ID do job de conversão do MediaConvert
     * @returns O status do job (SUBMITTED, PROGRESSING, COMPLETE, ERROR)
     */
    async checkJobStatus(jobId: string): Promise<string> {
        try {
            const params: AWS.MediaConvert.GetJobRequest = { Id: jobId };
            const jobResponse = await this.mediaConvert.getJob(params).promise();
            return jobResponse.Job?.Status || "UNKNOWN";
        } catch (error) {
            console.error("Erro ao verificar o status do job:", error);
            throw new Error("Erro ao verificar o status do job no AWS MediaConvert.");
        }
    }


    /**
     * Lista os frames extraídos no S3 após a conversão do MediaConvert
     * @param outputFolder - Pasta no S3 onde os frames foram armazenados
     * @returns Lista de URLs dos frames no S3
     */
    async listExtractedFrames(outputFolder: string): Promise<{ key: string; url: string }[]> {
        try {
            const params: AWS.S3.ListObjectsV2Request = {
                Bucket: this.bucketName,
                Prefix: outputFolder,
            };

            const data = await this.s3.listObjectsV2(params).promise();
            
            if (!data.Contents || data.Contents.length === 0) {
                throw new Error("Nenhum frame encontrado no S3.");
            }

            return data.Contents.map(file => ({
                key: file.Key || "", // Garantindo que a Key sempre seja uma string
                url: `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`
            }));
        } catch (error) {
            console.error("Erro ao listar os frames extraídos:", error);
            throw new Error("Erro ao listar os frames extraídos do S3.");
        }
    }

    /**
     * Cancela um job em execução no AWS MediaConvert
     * @param jobId - O ID do job a ser cancelado
     */
    async cancelJob(jobId: string): Promise<void> {
        try {
            await this.mediaConvert.cancelJob({ Id: jobId }).promise();
            console.log(`Job ${jobId} cancelado com sucesso.`);
        } catch (error) {
            console.error("Erro ao cancelar job:", error);
            throw new Error("Erro ao cancelar job no AWS MediaConvert.");
        }
    }

    async deleteS3File(s3Key: string): Promise<void> {
        try {
            const params = {
                Bucket: process.env.AWS_S3_BUCKET,
                Key: s3Key,
            };
    
            await this.s3.deleteObject(params).promise();
            console.log(`Arquivo deletado do S3: ${s3Key}`);
        } catch (error) {
            console.error(`Erro ao deletar o arquivo ${s3Key}:`, error);
        }
    }
}
