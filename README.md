# Nest OpenAPI Stoplight Elements Module

> already had some @nestjs/swagger generated mindblowing large API documentation, and want to use Stoplight Elements to
> display it? This module is for you.

Because SwaggerUI lacks a user-friendly navigation for large API documentations, Stoplight might be a great alternative
for this use case.

That's why I implemented a NestJS module that allows you to use Stoplight Elements with your existing OpenAPI
documentations.

## How does it work?

This module uses handlebars to render a custom HTML template that loads the Stoplight Elements JS+CSS and places the
respective WebComponent provided by Stoplight.

You load the module after you created the Swagger OpenAPI document in your main.ts from nest. This way you can pass the
OpenAPI document object to the Stoplight Elements module.

For serving the OpenAPI `yaml` and `json` files, we **internally** use the `@nestjs/swagger` module with SwaggerUI
disabled:

```ts
SwaggerModule.setup(path, app, document, {
  swaggerUiEnabled: false
});
```

This deploys the OpenAPI document at `/<your-path>-json` and `/<your-path>-yaml`. `<your-path>` is the path you provide
to the module config and where your Stoplight Elements UI can be found

## Getting Started
To get started, install the module:

```bash
npm install nest-swagger-spotlight
```

Then load the module accompanied by the swagger document part in your main.ts or wherever you bootstrap your NestJS app:

```ts
const options = new DocumentBuilder()
.setTitle('Example REST API')
.setDescription('Stoplight Elements Test API ')
.build();

const doc = SwaggerModule.createDocument(app, options);

await StoplightElementsModule.setup('/docs', app, doc);
```

You can also pass additional options to the `setup` method, such as a custom logo:

```ts
await StoplightElementsModule.setup('/docs', app, doc, {
  logo: 'https://example.com/logo.png',
});
```

Usable properties are:
```ts
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
  layout?: 'sidebar' | 'stacked' | 'responsive';
  logo?: string;
  router?: 'hash' | 'memory';
}
```

## Contributions
If you have any ideas on how to optimize this module, feel free to open an issue or a pull request.

## License
This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgements
This module is inspired by [this non-express package](https://github.com/nawbc/nest-stoplight-elements), but my package is **not** a fork - it's a completely new project just with inspired and partially copied code => LICENSE ack to @nawbc.
