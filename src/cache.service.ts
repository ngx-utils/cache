import {
  Inject, Injectable, InjectionToken, Injector, PLATFORM_ID, RendererFactory2,
  ViewEncapsulation
} from '@angular/core';
import { PlatformState } from '@angular/platform-server';
import { isPlatformBrowser } from '@angular/common';

export const APP_CACHE_KEY = new InjectionToken('APP_CACHE_KEY');

@Injectable()
export class CacheService {
  private cache: { [key: string]: any } = {};

  constructor(@Inject(PLATFORM_ID) private platformId: any,
              @Inject(APP_CACHE_KEY) private appCacheKey: string,
              private injector: Injector,
              private rendererFactory: RendererFactory2) {
    if (isPlatformBrowser(this.platformId)) {
      const serverCache = rehydrateCache(appCacheKey, this.cache);
      this.rehydrate(serverCache);
    }
  }

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

  rehydrate(json: { [key: string]: any }): void {
    Object.keys(json).forEach((key: string) => {
      this.cache[key] = json[key];
    });
  }

  toJSON(): { [key: string]: any } {
    return this.dehydrate();
  }

  inject(): void {
    try {
      const platformState = this.injector.get(PlatformState);
      const document: any = platformState.getDocument();
      const state = JSON.stringify(this.toJSON());
      const renderer = this.rendererFactory.createRenderer(document, {
        id: '-1',
        encapsulation: ViewEncapsulation.None,
        styles: [],
        data: {}
      });

      const html: any = Array.from(document.children).find((child: any) => child.name === 'html');
      const head = Array.from(html.children).find((child: any) => child.name === 'head');

      if (!head) {
        throw new Error('<head> not found in the document');
      }

      const script = renderer.createElement('script');
      renderer.setValue(script, `window['${this.appCacheKey}'] = ${state}`);
      renderer.appendChild(head, script);
    } catch (e) {
      console.error(e);
    }
  }
}

export function rehydrateCache(appCacheKey: string, defaultValue: { [key: string]: any }): { [key: string]: any } {
  const win: any = window;
  if (win[appCacheKey]) {
    let serverCache = defaultValue;
    try {
      serverCache = JSON.parse(JSON.stringify(win[appCacheKey]));
      if (typeof serverCache !== typeof defaultValue) {
        serverCache = defaultValue;
      }
    } catch (e) {
      serverCache = defaultValue;
    }
    return serverCache;
  }
  return defaultValue;
}
