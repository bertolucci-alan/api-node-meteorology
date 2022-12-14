import {
  ClassMiddleware,
  Controller,
  Get,
  Middleware,
} from '@overnightjs/core';
import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { Forecast } from '@src/services/forecast';
import { Request, Response } from 'express';
import { BaseController } from '.';
import rateLimit from 'express-rate-limit';
import ApiError from '@src/util/errors/api-error';
import { BeachRepository } from '@src/repositories/types/BeachRepository';
import logger from '@src/logger';

const forecast = new Forecast();
const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, //um minuto
  max: 10, //10 requests por minuto
  //chave que será checada, cada ip tem 10 req por minuto:
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  keyGenerator(req: Request, _: Response): string {
    return req.ip;
  },
  //permite alterar o padrão de respostas do rate limit:
  handler(_, res: Response): void {
    res.status(429).send(
      ApiError.format({
        code: 429,
        message: 'Too many request to the /forecast endpoint',
      })
    );
  },
});

@Controller('forecast')
@ClassMiddleware(authMiddleware)
export class ForecastController extends BaseController {
  constructor(private beachRepository: BeachRepository) {
    super();
  }

  @Get('')
  @Middleware(rateLimiter)
  public async getForecastForLoggedUser(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      if (!req.decoded?.id) {
        this.sendErrorResponse(res, {
          code: 500,
          message: 'Something went wrong',
        });
        logger.error('Missing userId');
        return;
      }

      const beaches = await this.beachRepository.findAllBeachesForUser(
        req.decoded?.id
      );
      const forecastData = await forecast.processForecastForBeaches(beaches);
      res.status(200).send(forecastData);
    } catch (err) {
      this.sendErrorResponse(res, {
        code: 500,
        message: 'Something went wrong',
      });
    }
  }
}
