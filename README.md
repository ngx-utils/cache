# @ngx-utils/cache

[![npm version](https://badge.fury.io/js/%40ngx-utils%2Fcache.svg)](https://badge.fury.io/js/%40ngx-utils%2Fcache) [![npm downloads](https://img.shields.io/npm/dm/@ngx-utils/cache.svg)](https://www.npmjs.com/package/@ngx-utils/cache)

Service for transfer cached data from server

Example in [@ngx-utils/universal-starter](https://github.com/ngx-utils/universal-starter/blob/master/src/app/auth-http.service.ts#L19) shows the way in which `CacheService` is used to cached all requests performed on server side and get cahched data on client side.

## Table of contents:
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
    - [Installation](#installation)
    - [browser.module.ts](#browsermodulets)
    - [server.module.ts](#servermodulets)
    - [Application cache key](#application-cache-key)
- [API](#api)
- [Example of usage](#example-of-usage)
- [License](#license)

## Prerequisites

This package depends on `@angular v4.0.0`.

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
By default this key is ```__APP_CACHE__``` and it used for create global variable (property in window object)

## API

`CacheService` has following methods:
- `has(key: string): boolean` check if `key` exist in cache;
- `set(key: string, value: any): void` put some value to cache;
- `get(key: string): any` get value from cache by `key`;
- `clear(key: string): void` remove value from cache by `key`;
- `clearAll(): void` clear cache;
- `dehydrate(): { [key: string]: any }` convert data from cache to JSON;
- `toJSON(): { [key: string]: any }` convert data from cache to JSON;
- `rehydrate(json: { [key: string]: any }): void` set data from JSON to cache;

## Example of usage

Following example shows how to cache all `GET` requests, performed on server side, and get cached data in browser (and don't send requests second time).

First of all we need create wrap for `Http` service:
```ts
import { Http, RequestOptionsArgs, Response } from '@angular/http';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CacheService } from '@ngx-utils/cache';

@Injectable()
export class MyHttpService {
  constructor(private http: Http,
              @Inject(PLATFORM_ID) private platformId: any,
              private cache: CacheService) { }

  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    if (isPlatformBrowser(this.platformId) && this.cache.has(url)) {
      return Observable.of(this.cache.get(url))
        .do(() => this.cache.clear(url));
    }
    return this.http.get(url, options)
      .do((response) => {
        if (isPlatformServer(this.platformId)) {
          this.cache.set(url, response.json());
        }
      });
  }
}

```

Than import it to app's main module:
```ts
import { NgModule } from '@angular/core';
import { BrowserModule  } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MyHttpService } from './my-http.service';

@NgModule({
 imports: [
  BrowserModule,
  HttpModule,
  AppRoutingModule
  ...
 ],
 declarations: [AppComponent],
 providers: [
   MyHttpService
 ]
})
export class AppModule { }

```

Now, using `MyHttpService` instead angular-native `Http`.

## License

The MIT License (MIT)
