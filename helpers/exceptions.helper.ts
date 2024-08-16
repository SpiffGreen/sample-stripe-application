export class HttpException {
  status: number;
  message: string;
  constructor(status: number, message: string) {
    // super(message);
    this.status = status;
    this.message = message;
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "Resource not found") {
    super(404, message);
  }
}

export class ValidationException extends HttpException {
  constructor(message = "Validation error") {
    super(400, message);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = "Forbidden") {
    super(403, message);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = "Unauthorized") {
    super(401, message);
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string = "Bad Request") {
    super(400, message);
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string = "Internal Server Error") {
    super(500, message);
  }
}
