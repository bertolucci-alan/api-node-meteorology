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

    it('should return 400 when there is a validation error', async () => {
      //teste não rodando, só Deus sabe o porquê
      const newUser = {
        email: 'alan@gmail.com',
        password: '123',
      };
      const response = await global.testRequest.post('/users').send(newUser);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        code: 400,
        error: 'Bad Request',
        message: 'User validation failed: name: Path `name` is required.',
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
        error: 'Conflict',
        message:
          'User validation failed: email: already exists in the database.',
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

    it('should return UNAUTHORIZED if the user is found but the password does not match', async () => {
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
  describe('When getting user profoile info', () => {
    it(`should return the token's owner profile information`, async () => {
      const newUser = {
        name: 'Alan',
        email: 'alan@gmail.com',
        password: '123',
      };
      const user = await new User(newUser).save();
      const token = AuthService.generateToken(user.toJSON());
      const { status, body } = await global.testRequest
        .get('/users/me')
        .set({ 'x-access-token': token });

      expect(status).toBe(200);
      expect(body).toMatchObject(JSON.parse(JSON.stringify({ user })));
    });
    it('should return Not Found when the user is not found', async () => {
      const newUser = {
        name: 'Alan',
        email: 'alan@gmail.com',
        password: '123',
      };
      //create a new user but dont save it
      const user = new User(newUser);
      const token = AuthService.generateToken(user.toJSON());
      const { status, body } = await global.testRequest
        .get('/users/me')
        .set({ 'x-access-token': token });
      expect(status).toBe(404);
      expect(body).toEqual({
        code: 404,
        error: 'Not Found',
        message: 'User not found!',
      });
    });
  });
});
