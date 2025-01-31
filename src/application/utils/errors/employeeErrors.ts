export class EmployeeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'EmployeeError';
    }
}

export class InvalidCPFError extends EmployeeError {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidCPFError';
    }
}

export class EmployeeNotFoundError extends EmployeeError {
    constructor(message: string) {
        super(message);
        this.name = 'EmployeeNotFoundError';
    }
}