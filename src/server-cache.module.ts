import {
  APP_BOOTSTRAP_LISTENER, ApplicationRef,
  ModuleWithProviders,
  NgModule,
  RendererFactory2,
  ViewEncapsulation
} from '@angular/core';
import { PlatformState } from '@angular/platform-server';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';

import { CacheService } from './cache.service';
import { APP_CACHE_KEY } from './application_cache_tokens';

export function injectCacheFactory(appRef: ApplicationRef,
                                   platformState: PlatformState,
                                   cache: CacheService,
                                   rendererFactory: RendererFactory2,
                                   appCacheKey: string): () => void {
  return () => {
    appRef.isStable
      .filter((isStable: boolean) => isStable)
      .first()
      .subscribe(() => {
        try {
          const document: any = platformState.getDocument();
          const state = JSON.stringify(cache.toJSON());
          const renderer = rendererFactory.createRenderer(document, {
            id: '-1',
            encapsulation: ViewEncapsulation.None,
            styles: [],
            data: {}
          });

          let html: any;
          if (document.documentElement) {
            html = document.documentElement;
          } else {
            html = Array.from(document.children || document.childNodes)
             .find((child: any) => (child.name || child.localName) === 'html');
          }
          const head = Array.from(html.children || html.childNodes)
            .find((child: any) => (child.name || child.localName) === 'head');

          if (!head) {
            throw new Error('<head> not found in the document');
          }

          const script = renderer.createElement('script');
          renderer.setValue(script, `window['${appCacheKey}'] = ${state}`);
          renderer.appendChild(head, script);
        } catch (e) {
          console.error(e);
        }
      });
  };
}

@NgModule()
export class ServerCacheModule {
  static forRoot(setupOptions: { appCacheKey?: string } = {appCacheKey: '__APP_CACHE__'}): ModuleWithProviders {
    return {
      ngModule: ServerCacheModule,
      providers: [
        {provide: APP_CACHE_KEY, useValue: setupOptions.appCacheKey},
        CacheService,
        {
          provide: APP_BOOTSTRAP_LISTENER, multi: true,
          useFactory: injectCacheFactory,
          deps: [ApplicationRef, PlatformState, CacheService, RendererFactory2, APP_CACHE_KEY]
        }
      ]
    };
  }
}

