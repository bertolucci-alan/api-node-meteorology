import logger from '@src/logger';
import {
  DatabaseError,
  DatabaseValidationError,
} from '@src/repositories/repository';
import ApiError, { APIError } from '@src/util/errors/api-error';
import { Response } from 'express';

//classe que só pode ser extendida, protegendo de iniciar uma classe que não dever ser iniciada
export abstract class BaseController {
  //método que pode ser sobrescrito
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: unknown
  ): Response {
    logger.error(error);
    // console.log(error);
    if (error instanceof DatabaseValidationError) {
      const clientErrors = this.handleClientErrors(error);

      return res.status(clientErrors.code).send(
        ApiError.format({
          code: clientErrors.code,
          message: clientErrors.error,
        })
      );
    } else {
      return res
        .status(500)
        .send(ApiError.format({ code: 500, message: 'Something went wrong!' }));
    }
  }

  private handleClientErrors(error: DatabaseError): {
    code: number;
    error: string;
  } {
    //return 409 error if the kind value is DUPLICATED
    return { code: 409, error: error.message };
  }

  protected sendErrorResponse(res: Response, apiError: APIError): Response {
    return res.status(apiError.code).send(ApiError.format(apiError));
  }
}
