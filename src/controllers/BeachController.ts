import { ClassMiddleware, Controller, Post } from '@overnightjs/core';
import { authMiddleware } from '@src/middlewares/auth';
import { Beach } from '@src/models/beach';
import { BeachRepository } from '@src/repositories/types/BeachRepository';
import { Response, Request } from 'express';
import { BaseController } from '.';

@Controller('beaches')
@ClassMiddleware(authMiddleware)
export class BeachController extends BaseController {
  constructor(private beachRepository: BeachRepository) {
    super();
  }

  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.beachRepository.create({
        ...req.body,
        ...{ userId: req.decoded?.id },
      });
      res.status(201).send(result);
    } catch (err) {
      this.sendCreateUpdateErrorResponse(res, err);
    }
  }
}
