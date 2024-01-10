import { Test, TestingModule } from '@nestjs/testing';
import { TokensService } from './tokens.service';
import { CustomResponse } from '../types/types';
import { randomStringGenerator } from '../utils/helper-functions';

describe('TokensService', () => {
  let service: TokensService;

  beforeAll(async () => {
    process.env.ENCRYPTION_KEY = '63c6116b950b66eb780bb109c82f4068e17ff0c2e1948ea9efd9a6111ce54b41'; // Mock encryption key

    const module: TestingModule = await Test.createTestingModule({
      providers: [TokensService],
    }).compile();

    service = module.get<TokensService>(TokensService);
  });


  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createToken', () => {
    it('should create a token', async () => {
      // generate a randome string
      const secret = randomStringGenerator();
      const resp: CustomResponse = await service.createToken(secret);
      console.log('createToken resp: ', resp);
      expect(resp.statusCode).toBe(204);
    });
  });

  describe('getAllTokens', () => {
    it('should return all tokens', async () => {
      const dbTokens = Object.values(service.database.data);
      const resp: CustomResponse = await service.getAllTokens();
      console.log('getAllTokens resp: ', resp)
      expect(resp.statusCode).toBe(204);
      // @ts-ignore
      if (resp.data.tokens) expect(resp.data.tokens.length).toEqual(dbTokens.length);
    });
  });

  describe('updateToken', () => {
    it('should update a token', async () => {
      const { token } = Object.values(service.database.data)[0];
      const newSecret = randomStringGenerator();
      const resp: CustomResponse = await service.updateToken(token, newSecret);
      console.log(`updateToken ${token} resp: `, resp);
      expect(resp.statusCode).toBe(204);
      expect(resp.message).toEqual('Token updated successfully');
    });
  });

  // describe('deleteToken', () => {
  //   it('should delete a token', async () => {
  //     const { token } = Object.values(service.database.data)[Object.keys(service.database.data).length - 1];
  //     const resp: CustomResponse = await service.deleteToken(token);
  //     console.log(`deleteToken ${token} resp: `, resp);
  //     expect(resp.statusCode).toBe(204);
  //     expect(resp.message).toEqual('Token deleted successfully');
  //     expect(service.database.data[token]).not.toBeDefined();
  //   });
  // });
});
