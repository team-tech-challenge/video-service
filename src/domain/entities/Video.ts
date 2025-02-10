export class Video {
    private id?: number;
    private idUser: number;
    private name: string;
    private s3Key: string;
    private extension: string;
    private url?: string;

    constructor(idUser: number, name: string, s3Key: string, extension: string, url?: string, id?: number) {
        this.id = id;
        this.idUser = idUser;
        this.name = name;
        this.s3Key = s3Key;
        this.url = url;
        this.extension = extension;
    }

    public getId(): number | undefined {
        return this.id;
    }

    public getIdUser(): number {
        return this.idUser;
    }
    
    public getFileName(): string {
        return this.name;
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

    public setFileName(name: string): void {
        this.name = name;
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
    
    public getFileNameWithoutExtension(): string {
        const name = this.s3Key.split("/").pop() || ""; // Pega apenas o nome do arquivo
        return name.replace(/\.[^/.]+$/, ""); // Remove a extensão
    }
}