import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { singularize } from '../utils/helper-functions';
import { Entity, RequestBody } from '../types/types';

@Injectable()
export class DB<T extends Entity> {
  private readonly logger = new Logger(DB.name);
  public data: { [key: string]: T } = {};

  constructor(private readonly name: string) {
    this.read();
  }

  private read() {
    try {
      this.data = JSON.parse(
        fs.readFileSync(`src/database/${this.name}.json`, 'utf8') ?? '{}'
      );
    } catch (error) {
      this.logger.error(
        `Error reading ${this.name} database: ${error.message}`
      );
      this.data = {};
    }
  }

  private write() {
    try {
      fs.writeFileSync(
        `src/database/${this.name}.json`,
        JSON.stringify(this.data)
      );
    } catch (error) {
      this.logger.error(`Error writing ${this.name} database: ${error.message}`);
    }
  }

  async find(list?: Array<T['token']>): Promise<Array<T>> {
    const data = Object.values(this.data ?? {});
    if (!list || !list.length) {
      return data;
    }
    return data.filter((item) => list.includes(item.token));
  }

  async findOne(id: string): Promise<T> {
    const found = this.data[id];
    if (!found) {
      throw new NotFoundException(`${singularize(this.name)} not found`);
    }
    return found;
  }

  async create(newData: RequestBody<T>): Promise<T> {
    const token = newData.token;
    this.data[token] = {...newData, token} as T;
    // this.write();
    return this.data[token];
  }

  async update(token: string, newData: RequestBody<T>): Promise<T> {
    if (!this.data[token]) {
      throw new NotFoundException(`${singularize(this.name)} not found`);
    }
    this.data[token] = { ...this.data[token], ...newData };
    // this.write();
    return this.data[token];
  }

  async delete(token: string): Promise<string> {
    if (!this.data[token]) {
      throw new NotFoundException(`${singularize(this.name)} not found`);
    }
    delete this.data[token];
    // this.write();
    return token;
  }

  async deleteAll(): Promise<{ [key: string]: T } | {}> {
    this.data = {};
    // this.write();
    return this.data;
  }
}

export const DBProvider = (name: string) => ({
    provide: DB,
    useValue: new DB(name),
});

