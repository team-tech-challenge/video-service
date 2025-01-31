export class CustomerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CustomerError';
    }
}

export class InvalidCPFError extends CustomerError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidCPFError';
    }
}

export class CustomerNotFoundError extends CustomerError {
    constructor(message: string) {
        super(message);
        this.name = 'CustomerNotFoundError';
    }
}