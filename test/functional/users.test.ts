import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Users functional test', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });
  describe('When create a new user', () => {
    it('should successfully create a new user with encrypted password', async () => {
      const newUser = {
        name: 'Alan',
        email: 'alan@gmail.com',
        password: '123',
      };
      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(201);
      //expect boolean in promise
      await expect(
        AuthService.comparePassword(newUser.password, response.body.password)
      ).resolves.toBeTruthy();
      expect(response.body).toEqual(
        expect.objectContaining({ ...newUser, password: expect.any(String) })
      );
    });

    it('should successfully create a new user', async () => {
      const newUser = {
        name: 'teste',
        email: 'teste@gmail.com',
        password: '1234',
      };
      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(
        expect.objectContaining({ ...newUser, password: expect.any(String) })
      );
    });

    it('shoul return 422 there is a validation error', async () => {
      const newUser = {
        email: 'alan@gmail.com',
        password: '123',
      };
      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        code: 422,
        error: 'User validation failed: name: Path `name` is required.',
      });
    });

    it('should return 409 when the user email already exists', async () => {
      const newUser = {
        name: 'alan',
        email: 'alan@gmail.com',
        password: '123',
      };
      await global.testRequest.post('/users').send(newUser);
      const response = await global.testRequest.post('/users').send(newUser);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 409,
        error: 'User validation failed: email: already exists in the database.',
      });
    });
  });

  describe('When authenticating a user', () => {
    it('should generate a token for a valid user', async () => {
      const newUser = {
        name: 'Alan',
        email: 'alan@gmail.com',
        password: '123',
      };

      await new User(newUser).save();
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ email: newUser.email, password: newUser.password });
      expect(response.body).toEqual(
        expect.objectContaining({ token: expect.any(String) })
      );
    });

    it('should return UNAUTHORIZED if the user given email is not found', async () => {
      const newUser = {
        email: 'alan@gmail.com',
        password: '123',
      };
      const response = await global.testRequest
        .post('/users/authenticate')
        .send(newUser);
      expect(response.status).toBe(401);
    });

    it.only('should return UNAUTHORIZED if the user is found but the password does not match', async () => {
      const newUser = {
        name: 'Alan',
        email: 'alan@gmail.com',
        password: '123',
      };
      await new User(newUser).save();
      const response = await global.testRequest
        .post('/users/authenticate')
        .send({ ...newUser, password: '321' });
      expect(response.status).toBe(401);
    });
  });
});
