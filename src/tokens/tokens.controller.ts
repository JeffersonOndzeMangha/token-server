import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TokensService } from './tokens.service'; // Import your service
import { CustomResponse } from 'src/types/types';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  /**
   * Get all tokens.
   * @returns A list of tokens with their corresponding secrets.
   */
  @Get()
  async getAllTokens(@Query('t') t: string) {
    return this.tokensService.getAllTokens(t?.split(','));
  }

  /**
   * Create a new token.
   * @param secret The secret to be associated with the new token.
   * @returns The newly created token.
   */
  @Post()
  async createToken(@Body('secret') secret: string): Promise<CustomResponse> {
    return this.tokensService.createToken(secret);
  }

  /**
   * Update an existing token.
   * @param token The token to be updated.
   * @param secret The new secret to be associated with the token.
   * @returns The updated token.
   */
  @Put(':token')
  async updateToken(@Param('token') token: string, @Body('secret') secret: string): Promise<CustomResponse> {
    return this.tokensService.updateToken(token, secret);
  }

  /**
   * Delete a token.
   * @param token The token to be deleted.
   * @returns A confirmation message.
   */
  @Delete(':token')
  async deleteToken(@Param('token') token: string): Promise<CustomResponse> {
    return this.tokensService.deleteToken(token);
  }
}
