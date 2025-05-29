import {
  ForbiddenException,
  HttpServer,
  INestApplication,
} from '@nestjs/common';
import {ExpressAdapter, NestExpressApplication} from '@nestjs/platform-express';
import {OpenAPIObject, SwaggerModule} from '@nestjs/swagger';
import Handlebars from 'handlebars';
import { posix, resolve } from 'path';
import * as fsPromises from 'fs/promises';
import {Request, Response} from "express";

/**
 * @see {@link https://docs.stoplight.io/docs/elements/b074dc47b2826-elements-configuration-options}
 */
export interface StoplightElementsOptions {
  apiDescriptionDocument?: string;
  apiDescriptionUrl?: string;
  basePath?: string;
  hideInternal?: boolean;
  hideTryIt?: boolean;
  hideSchemas?: boolean;
  hideExport?: boolean;
  tryItCorsProxy?: string;
  tryItCredentialPolicy?: string;
  layout?: 'sidebar' | 'stacked';
  logo?: string;
  router?: 'hash' | 'memory';
}

export interface StoplightElementsModuleOptions extends StoplightElementsOptions {
  stoplightJSUrl?: string;
  stoplightCSSUrl?: string;
  favicon?: string;
  auth?: (req: any) => boolean;
}

const defaultOptions = { router: 'hash' };

/**
 *
 * @example
 * ```
 * StoplightElementsModule.setup('/docs',app, xxxDoc, {
 *    logo: 'icon.png'
 * })
 *
 * ```
 */
export class StoplightElementsModule {
  public static async setup(
    path: string,
    app: INestApplication,
    document: OpenAPIObject,
    options?: StoplightElementsModuleOptions,
  ) {
    const httpAdapter = app.getHttpAdapter();
    const userOptions = Object.assign({}, defaultOptions, options);

    if (this.isExpress(httpAdapter)) {
      return this.setupExpress(
        path,
        app as NestExpressApplication,
        document,
        userOptions,
      );
    }
  }

  private static isExpress(httpAdapter: HttpServer) {
    return (
      httpAdapter &&
      httpAdapter.constructor &&
      httpAdapter.constructor.name === ExpressAdapter.name
    );
  }

  private static getGlobalPrefix(app: any) {
    return app.config?.getGlobalPrefix() ?? '';
  }

  private static prefixSlug(path: string) {
    return path?.[0] !== '/' ? `/${path}` : path;
  }

  public static async setupExpress(
    path: string,
    app: NestExpressApplication,
    document: OpenAPIObject,
    options?: StoplightElementsModuleOptions,
  ) {
    const formatPath = this.prefixSlug(posix.normalize(path));

    SwaggerModule.setup(path, app, document, {
      swaggerUiEnabled: false
    });

    options = Object.assign({
      apiDescriptionUrl: `${path}-yaml`,
    }, defaultOptions, options);

    const templatePath = resolve(__dirname, './views/stoplight-elements.hbs');
    const content = await fsPromises.readFile(templatePath, 'utf-8');
    const template = Handlebars.compile(content)
    const HTML = template({
      ...options,
      title: document.info.title
    });
    const httpAdapter = app.getHttpAdapter();

    try {
      httpAdapter.get(formatPath, async (req: Request, res: Response) => {
        if (options.auth && !(await options.auth(req))) {
          throw new ForbiddenException();
        }

        res.header(
          'Content-Security-Policy',
          "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; child-src * 'unsafe-inline' 'unsafe-eval' blob:; worker-src * 'unsafe-inline' 'unsafe-eval' blob:; connect-src * 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';",
        );
        res.type('text/html');
        res.send(HTML);
      });
    } catch (error) {}
  }
}
