import { Controller, Get, Post } from '@overnightjs/core';
import { User } from '@src/models/user';
import { Request, Response } from 'express';
import { BaseController } from '.';

@Controller('users')
export class UserController extends BaseController {
  @Post('')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const user = new User(req.body);
      const newUser = await user.save();
      res.status(201).send(newUser);
    } catch (err) {
      this.sendCreateUpdateErrorResponse(res, err);
    }
  }
}
