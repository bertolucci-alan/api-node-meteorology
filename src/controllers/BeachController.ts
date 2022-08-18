import { Controller, Post } from '@overnightjs/core';
import { Beach } from '@src/models/beach';
import { Response, Request } from 'express';
import mongoose from 'mongoose';

@Controller('beaches')
export class BeachController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const beach = new Beach(req.body);
      const result = await beach.save();
      res.status(201).send(result);
    } catch (err) {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(422).send({ error: err.message });
      } else {
        res.status(500).send({ error: 'Internal Server Error' });
      }
    }
  }
}
