import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { randomBytes, scryptSync } from 'crypto';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // fake copy of user service
    fakeUsersService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: fakeUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hashed password', async () => {
    const user = await service.signup('sahil@hmail.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with an email that is already in use', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([
        { id: 1, email: 'sahil@gmail.com', password: 'asdf' } as User,
      ]);

    await expect(service.signup('sahil@gmail.com', 'asdf')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws an error if user signs in with an unused email', async () => {
    await expect(service.signin('sahil@gmail.com', 'asdf')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws an error if password doesnt match', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([{ email: 'sahil@gmail.com', password: 'asdf' } as User]);

    await expect(service.signin('sahil@gmail.com', 'asder')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns user if correct password provided', async () => {
    const salt = randomBytes(8).toString('hex');
    const hash = scryptSync('asdf', salt, 32).toString('hex');
    const storedPassword = `${salt}.${hash}`;

    fakeUsersService.find = () =>
      Promise.resolve([
        { email: 'sahil@gmail.com', password: storedPassword } as User,
      ]);

    const user = await service.signin('sahil@gmail.com', 'asdf');
    expect(user).toBeDefined();
    expect(user.email).toEqual('sahil@gmail.com');
  });
});
