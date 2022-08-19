import { CUSTOM_VALIDATION } from '@src/models/user';
import { Response } from 'express';
import mongoose from 'mongoose';

//classe que só pode ser extendida, protegendo de iniciar uma classe que não dever ser iniciada
export abstract class BaseController {
  //método que pode ser sobrescrito
  protected sendCreateUpdateErrorResponse(
    res: Response,
    error: mongoose.Error.ValidationError | Error | unknown
  ): Response {
    if (error instanceof mongoose.Error.ValidationError) {
      const clientErrors = this.handleClientErrors(error);
      return res
        .status(clientErrors.code)
        .send({ code: clientErrors.code, error: clientErrors.error });
    } else {
      return res
        .status(500)
        .send({ code: 500, error: 'Something went wrong!' });
    }
  }

  private handleClientErrors(error: mongoose.Error.ValidationError): {
    code: number;
    error: string;
  } {
    //get duplicated errors
    const duplicatedKindErrors = Object.values(error.errors).filter(
      (err) => err.kind === CUSTOM_VALIDATION.DUPLICATED
    );

    //return 409 error if the kind value is DUPLICATED
    if (duplicatedKindErrors.length) {
      return { code: 409, error: error.message };
    }
    return { code: 422, error: error.message };
  }
}
