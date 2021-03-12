import { ErrorCodes } from '../enums';
import { TangError } from './tang.error';

/**
 * 处理器错误
 */

export class ProcessorError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Processor Error',
  ) {
    super(
      TangError.createBody(
        objectOrError,
        description,
        ErrorCodes.PROCESSOR_ERROR,
      ),
      ErrorCodes.PROCESSOR_ERROR,
    );
  }
}

export class LoaderError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Loader Error',
  ) {
    super(
      TangError.createBody(objectOrError, description, ErrorCodes.LOADER_ERROR),
      ErrorCodes.LOADER_ERROR,
    );
  }
}

export class ParserError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Parser Error',
  ) {
    super(
      TangError.createBody(objectOrError, description, ErrorCodes.PARSER_ERROR),
      ErrorCodes.PARSER_ERROR,
    );
  }
}

export class GeneratorError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Generator Error',
  ) {
    super(
      TangError.createBody(
        objectOrError,
        description,
        ErrorCodes.GENERATOR_ERROR,
      ),
      ErrorCodes.GENERATOR_ERROR,
    );
  }
}

export class OutputerError extends TangError {
  constructor(
    objectOrError?: string | object | any,
    description = 'Outputer Error',
  ) {
    super(
      TangError.createBody(
        objectOrError,
        description,
        ErrorCodes.OUTPUTER_ERROR,
      ),
      ErrorCodes.OUTPUTER_ERROR,
    );
  }
}
