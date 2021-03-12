import { isString, isObject } from '../utils';

export class TangError extends Error {
  constructor(
    private readonly body: string | Record<string, any>,
    private readonly code: string,
  ) {
    super();
    this.name = 'TangError';
    this.initMessage();
  }

  initMessage() {
    if (isString(this.body)) {
      this.message = this.body;
    } else if (
      isObject(this.body) &&
      isString((this.body as Record<string, any>).message)
    ) {
      this.message = (this.body as Record<string, any>).message;
    } else if (this.constructor) {
      this.message = this.constructor.name
        .match(/[A-Z][a-z]+|[0-9]+/g)
        .join(' ');
    }
  }

  getCode(): string {
    return this.code;
  }

  getBody(): string | object {
    return this.body;
  }

  static createBody(
    objectOrError: object | string,
    message?: string,
    code?: string,
  ) {
    if (!objectOrError) {
      return { code, message };
    }
    return isObject(objectOrError) && !Array.isArray(objectOrError)
      ? objectOrError
      : { code, message: objectOrError, error: message };
  }
}
