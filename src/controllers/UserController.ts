import {
  addClassOptionsToClassMetadata,
  Controller,
  Get,
  Post,
} from '@overnightjs/core';
import { User } from '@src/models/user';
import AuthService from '@src/services/auth';
import { compare } from 'bcrypt';
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

  @Post('authenticate')
  public async authenticate(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).send({ code: 401, error: 'User not found!' });
    }
    if (!(await AuthService.comparePassword(password, user.password))) {
      return res
        .status(401)
        .send({ code: 401, error: 'Password does not match!' });
    }

    const token = await AuthService.generateToken(user.toJSON());
    return res.status(200).send({ token: token });
  }
}
