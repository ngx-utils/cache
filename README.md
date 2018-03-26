# @ngx-utils/cache

[![npm version](https://badge.fury.io/js/%40ngx-utils%2Fcache.svg)](https://badge.fury.io/js/%40ngx-utils%2Fcache) [![npm downloads](https://img.shields.io/npm/dm/@ngx-utils/cache.svg)](https://www.npmjs.com/package/@ngx-utils/cache)

Service for transfer cached data from server

Example in [@ngx-utils/universal-starter](https://github.com/ngx-utils/universal-starter/blob/master/src/app/auth-http.service.ts#L19) shows the way in which `CacheService` is used to cache all requests performed on server side and get cached data on client side.

## Table of contents:

* [Prerequisites](#prerequisites)
* [Getting started](#getting-started)
  * [Installation](#installation)
  * [browser.module.ts](#browsermodulets)
  * [server.module.ts](#servermodulets)
  * [Application cache key](#application-cache-key)
* [API](#api)
* [Example of usage](#example-of-usage)
* [License](#license)

## Prerequisites

This package depends on `@angular v5`.

For `@angular v4` use [2.0.1](https://github.com/ngx-utils/cache/tree/v2.0.1) version.

## Getting started

### Installation

Install **@ngx-utils/cache** from npm:

```bash
npm install @ngx-utils/cache --save
```

### browser.module.ts

Add **BrowserCacheModule** to your browser module:

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserCacheModule } from '@ngx-utils/cache/browser';
...
import { AppModule } from './app/app.module';
import { AppComponent } from './app/app.component';
...
@NgModule({
  imports: [
    BrowserModule.withServerTransition({appId: 'your-app-id'}),
    BrowserCacheModule.forRoot(),
    AppModule
    ...
  ],
  bootstrap: [AppComponent]
})
export class BrowserAppModule { }
```

### server.module.ts

Add **ServerCacheModule** to your server module:

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ServerModule } from '@angular/platform-server';
import { ServerCacheModule } from '@ngx-utils/cache/server';
...
import { AppModule } from './app/app.module';
import { AppComponent } from './app/app.component';
...
@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'your-app-id' }),
    ServerModule,
    ServerCacheModule.forRoot(),
    AppModule
    ...
  ],
  bootstrap: [AppComponent]
})
export class ServerAppModule { }
```

### Application cache key

You can also specify **application cache key**:

```ts
BrowserCacheModule.forRoot({ appCacheKey: 'YOUR_CACHE_KEY' })
...
ServerCacheModule.forRoot({ appCacheKey: 'YOUR_CACHE_KEY' })
```

By default this key is `__APP_CACHE__` and it used for create global variable (property in window object)

## API

`CacheService` has following methods:

* `has(key: string): boolean` check if `key` exist in cache;
* `set(key: string, value: any): void` put some value to cache;
* `get(key: string): any` get value from cache by `key`;
* `clear(key: string): void` remove value from cache by `key`;
* `clearAll(): void` clear cache;
* `dehydrate(): { [key: string]: any }` convert data from cache to JSON;
* `toJSON(): { [key: string]: any }` convert data from cache to JSON;
* `rehydrate(json: { [key: string]: any }): void` set data from JSON to cache;

## Example of usage

Following example shows how to cache all `GET` requests, performed on server side, and get cached data in browser (and don't send requests second time).

First of all we need create interceptor:

```ts
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CacheService } from '@ngx-utils/cache';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { tap } from 'rxjs/operators/tap';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  constructor(
    private cache: CacheService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    if (
      isPlatformBrowser(this.platformId) &&
      this.cache.has(request.urlWithParams)
    ) {
      const response = new HttpResponse({
        body: this.cache.get(request.urlWithParams),
        status: 200
      });
      return of(response).pipe(
        tap(() => this.cache.clear(request.urlWithParams))
      );
    }

    return next.handle(request).pipe(
      tap((response: any) => {
        if (isPlatformServer(this.platformId)) {
          this.cache.set(request.urlWithParams, response.body);
        }
      })
    );
  }
}
```

Than import it to app's main module:

```ts
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CacheInterceptor } from './cache.interceptor';

@NgModule({
 imports: [
  BrowserModule,
  HttpModule,
  AppRoutingModule
  ...
 ],
 declarations: [AppComponent],
 providers: [
   {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: CacheInterceptor
    }
 ]
})
export class AppModule { }
```

## License

The MIT License (MIT)
