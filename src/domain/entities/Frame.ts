export class Frame {
    private id?: number;
    private name: string;
    private videoId: number;
    private s3Key: string;
    private extension: string;
    private url?: string;
  
    constructor(
      name: string,
      videoId: number,
      s3Key: string,
      extension: string,
      url?: string,
      id?: number
      
    ) {
      this.id = id;
      this.name = name;
      this.videoId = videoId;
      this.s3Key = s3Key;
      this.extension = extension;
      this.url = url;
    }
  
    public getId(): number | undefined {
      return this.id;
    }
  
    public getFileName(): string {
      return this.name;
    }
  
    public getVideoId(): number {
      return this.videoId;
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
  
    public setFileName(name: string): void {
      this.name = name;
    }
  
    public setVideoId(videoId: number): void {
      this.videoId = videoId;
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
  