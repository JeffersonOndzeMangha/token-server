import { Test, TestingModule } from '@nestjs/testing';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';

describe('TokensController', () => {
  let controller: TokensController;
  let mockTokensService: Partial<TokensService>;

  beforeEach(async () => {
    // Mock implementation of the TokensService
    mockTokensService = {
      getAllTokens: jest.fn().mockResolvedValue([{ token: 'token1', secret: 'secret1' }]),
      createToken: jest.fn().mockResolvedValue('newToken'),
      updateToken: jest.fn().mockResolvedValue('Token updated successfully'),
      deleteToken: jest.fn().mockResolvedValue('Token deleted successfully'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokensController],
      providers: [{ provide: TokensService, useValue: mockTokensService }],
    }).compile();

    controller = module.get<TokensController>(TokensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all tokens', async () => {
    await expect(controller.getAllTokens('token1,token2')).resolves.toEqual([{ token: 'token1', secret: 'secret1' }]);
    expect(mockTokensService.getAllTokens).toHaveBeenCalled();
  });

  it('should create a token', async () => {
    await expect(controller.createToken('secret')).resolves.toEqual('newToken');
    expect(mockTokensService.createToken).toHaveBeenCalledWith('secret');
  });

  it('should update a token', async () => {
    await expect(controller.updateToken('token1', 'newSecret')).resolves.toEqual('Token updated successfully');
    expect(mockTokensService.updateToken).toHaveBeenCalledWith('token1', 'newSecret');
  });

  it('should delete a token', async () => {
    await expect(controller.deleteToken('token1')).resolves.toEqual('Token deleted successfully');
    expect(mockTokensService.deleteToken).toHaveBeenCalledWith('token1');
  });
});
