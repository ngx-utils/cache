import { Injectable } from '@angular/core';

@Injectable()
export class CacheService {
  private cache: { [key: string]: any } = {};

  has(key: string): boolean {
    return key in this.cache;
  }

  set(key: string, value: any): void {
    this.cache[key] = value;
  }

  get(key: string): any {
    return this.cache[key];
  }

  clear(key: string): void {
    delete this.cache[key];
  }

  clearAll(): void {
    Object.keys(this.cache).forEach((key) => {
      this.clear(key);
    });
  }

  dehydrate(): { [key: string]: any } {
    const json: { [key: string]: any } = {};
    Object.keys(this.cache).forEach((key: string) => {
      json[key] = this.cache[key];
    });
    return json;
  }

  toJSON(): { [key: string]: any } {
    return this.dehydrate();
  }

  rehydrate(json: { [key: string]: any }): void {
    Object.keys(json).forEach((key: string) => {
      this.cache[key] = json[key];
    });
  }
}
