import nodemailer from "nodemailer";

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,  // Exemplo: smtp.gmail.com
            port: Number(process.env.SMTP_PORT) || 587, // Exemplo: 465 (SSL) ou 587 (TLS)
            secure: process.env.SMTP_SECURE === "true", // true para 465, false para 587
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    /**
     * Envia um e-mail com o assunto e a mensagem especificados
     * @param to - Destinatário do e-mail
     * @param subject - Assunto do e-mail
     * @param text - Corpo do e-mail (texto puro)
     * @param html - Corpo do e-mail (HTML opcional)
     */
    async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM, // Exemplo: "Video Service <no-reply@seusite.com>"
                to,
                subject,
                text,
                html,
            });

            console.log(`E-mail enviado com sucesso para ${to}: ${info.messageId}`);
        } catch (error) {
            console.error("Erro ao enviar e-mail:", error);
            throw new Error("Falha ao enviar e-mail");
        }
    }
}