import { Response } from "express";

export type Token = {
    token: string;
    secret: string;
};

export type Entity = Token;
export type RequestBody<T> = Partial<Token>;
export type ResponseBody<T> = Partial<Token> & Partial<Response>;
type DataType = { [key: string]: Partial<Token> | Array<Partial<Token>> };

export class CustomResponse {
    public message: string;
    public statusCode: number;
    public data?: DataType;

    status(status: number): CustomResponse {
        this.statusCode = status;
        return this;
    }

    json(response: { message: string, data?: DataType}): CustomResponse {
        this.message = response.message;
        this.data = response.data;
        return this;
    }
}

export const Resp = new CustomResponse();