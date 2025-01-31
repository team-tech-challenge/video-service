import * as express from "express";

declare global {
    namespace Express {
        interface Request {
            file?: Express.Multer.File; // Adiciona suporte ao 'file'
        }
    }
}