import { ModuleWithProviders, NgModule } from '@angular/core';

import { APP_CACHE_KEY, CacheService } from './cache.service';

@NgModule()
export class CacheModule {
  static forRoot(appCacheKey: string = '__APP_CACHE__'): ModuleWithProviders {
    return {
      ngModule: CacheModule,
      providers: [
        {provide: APP_CACHE_KEY, useValue: appCacheKey},
        CacheService
      ]
    };
  }
}
