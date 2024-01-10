import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { DB } from '../database';
import { CustomResponse, Resp, Token } from '../types/types';

@Injectable()
export class TokensService {
    private readonly logger = new Logger(TokensService.name);
    /**
     * The database instance for managing accounts data.
     */
    public readonly database: DB<Token> = new DB<Token>('tokens');
    private key = Buffer.from(`${process.env.ENCRYPTION_KEY}`, 'hex'); // Encryption key


    /**
     * Retrieves all tokens and their decrypted secrets.
     * @returns An array of tokens and their secrets.
     */
    async getAllTokens(list?: Array<Token['token']>): Promise<CustomResponse> {
        this.logger.log('getAllTokens');
        const tokens = await this.database.find(list);
        return Resp.status(204).json({
            message: 'Tokens retrieved successfully',
            data: {
                tokens: tokens.map((token: Token) => {
                    return {
                        ...token,
                        secret: this.decryptSecret(token.secret)
                    };
            })
        }
        })
    }

    /**
     * Creates a new token with the provided secret.
     * @param secret The secret to associate with the token.
     * @returns The newly created token.
     */
    async createToken(secret: string): Promise<CustomResponse> {
        this.logger.log('createToken');
        const token = `dp.token.${randomBytes(16).toString('hex')}`;
        try {
            const encryptedSecret = this.encryptSecret(secret);
            console.log('createToken', { token, encryptedSecret });
            const newToken = await this.database.create({ token, secret: encryptedSecret });
            return Resp.status(204).json({
                message: 'Token created successfully',
                data: {
                    token: {
                        token: newToken.token
                    }
                }
            });
        } catch (error) {
            return Resp.status(500).json({
                message: 'Error creating token',
                data: {
                    error
                }
            });
        }
    }

    /**
     * Updates the secret of an existing token.
     * @param token The token to be updated.
     * @param newSecret The new secret for the token.
     * @returns A success message or an error if the token doesn't exist.
     */
    async updateToken(token: string, newSecret: string): Promise<CustomResponse> {
        this.logger.log('updateToken');
        try {
            const encryptedSecret = this.encryptSecret(newSecret);
            await this.database.update(token, { token, secret: encryptedSecret }); // has error handling built into it when data is not found
            return Resp.status(204).json({
                message: 'Token updated successfully'
            });
        } catch (error) {
            return Resp.status(500).json({
                message: 'Error updating token',
                data: {
                    error
                }
            });
        }
    }

    /**
     * Deletes a token.
     * @param token The token to be deleted.
     * @returns A success message or an error if the token doesn't exist.
     */
    async deleteToken(token: string): Promise<CustomResponse> {
        this.logger.log('deleteToken');
        try {
            this.database.delete(token); // has error handling built into it when data is not found
            return Resp.status(204).json({
                message: 'Token deleted successfully'
            });
        } catch (error) {
            return Resp.status(500).json({
                message: 'Error deleting token',
                data: {
                    error
                }
            });
        }
    }

    
    /**
     * Encrypts a plaintext using AES-256-GCM.
     * @param plaintext - The plaintext to encrypt.
     * @returns The encrypted text in hexadecimal format.
     */
    private encryptSecret(plaintext: string): string {
        const iv = randomBytes(16); // Generate a random initialization vector
        const cipher = createCipheriv('aes-256-gcm', this.key, iv);

        const encrypted = Buffer.concat([
            cipher.update(plaintext, 'utf8'),
            cipher.final()
        ]);

        const tag = cipher.getAuthTag();

        return Buffer.concat([iv, encrypted, tag]).toString('hex');
    }

    /**
     * Decrypts a ciphertext using AES-256-GCM.
     * @param ciphertext - The encrypted text in hexadecimal format.
     * @returns The decrypted plaintext.
     */
    private decryptSecret(ciphertext: string): string {
        const data = Buffer.from(ciphertext, 'hex');

        const iv = data.slice(0, 16);
        const encryptedText = data.slice(16, data.length - 16);
        const tag = data.slice(data.length - 16);

        const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
        decipher.setAuthTag(tag);

        return Buffer.concat([
            decipher.update(encryptedText),
            decipher.final()
        ]).toString('utf8');
    }
}
