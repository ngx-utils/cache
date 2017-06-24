import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';

import { CacheService } from './cache.service';
import { APP_CACHE_KEY } from './application_cache_tokens';

export function rehydrateCacheFactory(appCacheKey: string, cache: CacheService): () => void {
  return () => {
    let serverCache = (window as any)[appCacheKey];
    if (serverCache) {
      try {
        serverCache = JSON.parse(JSON.stringify(serverCache));
        if (typeof serverCache !== 'object') {
          serverCache = {};
        }
      } catch (e) {
        serverCache = {};
      }
    } else {
      serverCache = {};
    }
    cache.rehydrate(serverCache);
  };
}

@NgModule()
export class BrowserCacheModule {
  static forRoot(setupOptions: { appCacheKey?: string } = {appCacheKey: '__APP_CACHE__'}): ModuleWithProviders {
    return {
      ngModule: BrowserCacheModule,
      providers: [
        {provide: APP_CACHE_KEY, useValue: setupOptions.appCacheKey},
        CacheService,
        {
          provide: APP_INITIALIZER, multi: true,
          useFactory: rehydrateCacheFactory,
          deps: [APP_CACHE_KEY, CacheService]
        }
      ]
    };
  }
}
