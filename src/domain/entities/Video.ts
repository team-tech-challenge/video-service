export class Video {
    private id?: number;
    private idUser: number;
    private fileName: string;
    private s3Key: string;
    private extension: string;
    private url?: string;

    constructor(idUser: number, fileName: string, s3Key: string, extension: string, url?: string, id?: number) {
        this.id = id;
        this.idUser = idUser;
        this.fileName = fileName;
        this.s3Key = s3Key;
        this.s3Key = url;
        this.extension = extension;
    }

    public getId(): number | undefined {
        return this.id;
    }

    public getIdUser(): number {
        return this.idUser;
    }
    
    public getFileName(): string {
        return this.fileName;
    }    
    
    public getS3Key(): string {
        return this.s3Key;
    }

    public getExtension(): string {
        return this.extension;
    }

    public getUrl(): string | undefined {
        return this.url;
    }

    public setId(id: number): void {
        this.id = id;
    }

    public setIdUser(idUser: number): void {
        this.idUser = idUser;
    }

    public setFileName(fileName: string): void {
        this.fileName = fileName;
    }  

    public setS3Key(s3Key: string): void {
        this.s3Key = s3Key;
    }

    public setExtension(extension: string): void {
        this.extension = extension;
    }

    public setUrl(url: string): void {
        this.url = url;
    }
}