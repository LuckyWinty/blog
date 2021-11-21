### 简介
> Nest 是一个用于构建高效，可扩展的 `Node.js` 服务器端应用程序的框架。在底层，Nest 使用强大的 HTTP Server 框架，如 Express（默认）和 Fastify。Nest 在这些框架之上提供了一定程度的抽象，同时也将其 API 直接暴露给开发人员。这样可以轻松使用每个平台的无数第三方模块。

支持 `TypeScript`（也支持纯 js 编写代码）,默认支持最新的 ES6 等语法和特性(用 babel 做代码转换)。node 版本要求 `>= 10.13.0, v13 版本除外`。

要了解 Nest ，建议先了解一下装饰器，因为 Nest 里面的方法很多都是以装饰器的方式提供的，下面我简单介绍一下。已经了解的朋友可以跳过～
### 装饰器

`装饰器（Decorator）`是一种与类`（class）`相关的语法，用来注释或修改类和类方法。它是一种函数，写成`@ + 函数名`的形式。它可以放在类和类方法的定义前面。
```js
  @testable
  class MyTestableClass {
    // ...
  }
  function testable(target) {
    target.isTestable = true;
  }
  MyTestableClass.isTestable // true
```
基本上，装饰器的行为就是下面这样。
```js
  @decorator
  class A {}
  // 等同于
  class A {}
  A = decorator(A) || A;
```
也就是说，装饰器是一个对类进行处理的函数。装饰器函数的第一个参数，就是所要装饰的目标类。

#### 注意点

+ 装饰器对类的行为的改变，是代码编译时发生的，而不是在运行时。这意味着，装饰器能在编译阶段运行代码。也就是说，装饰器本质就是编译时执行的函数。
+ 装饰器只能用于类和类的方法，不能用于函数，因为存在函数提升。如果一定要装饰函数，可以采用高阶函数的形式直接执行。

### Nest 基本介绍
安装使用这里就不说了，可以到官网按照其引导来进行：https://docs.nestjs.com/first-steps。

生成的核心文件结构为：
```js
src
  |-app.controller.spec.ts
  |-app.controller.ts
  |-app.module.ts
  |-app.service.ts
  |-main.ts
```
其代表的含义分别为：

|文件 |	含义 |
| ---- | ---- |
|app.controller.spec.ts | 控制器的单元测试 |
|app.controller.ts | 控制器逻辑文件，通常含多个路由|
|app.module.ts	| 应用程序的根模块 |
|app.service.ts	| 服务文件 |
|main.ts	| 应用程序的入口文件，它是基于`NestFactory`创建的一个Nest应用程序实例 |

### Controller
什么是 `Controller`？语义化翻译就是 `控制器`，它负责处理传入的请求并将响应结果返回给客户端。

在 `Nest` 中，控制器和路由机制是结合在一起的，控制器的目的是接收应用程序的特定请求。其`路由`机制控制哪个控制器接收哪些请求。通常，每个控制器都有多个路由，不同的路由可以执行不同的操作。

我们通过装饰器 `@Controller()` 来将一个类定义为控制器，如：
```js
import { Controller } from '@nestjs/common';

@Controller('test')
export class TestController { }
```
Nest 把各个HTTP的请求方法都封装成了装饰器，如`@Get()、@Post()、@Put()、@Patch()、@Delete()、@Options()`等，因此我们在实际开发中，可以直接用来装饰对应的请求，比如以下几种路由：
```js
import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Post()
  async create(@Body() createTestDto: CreateTestDto) {
    return 'This action adds a new test';
  }

  @Delete(':id')
  async remove(@Param('id') id) {
    return `This action removes a #${id} test`;
  }

  @Put(':id')
  async update(@Param('id') id, @Body() updateTestDto: UpdateTestDto) {
    return `This action updates a #${id} test`;
  }

  @Get(':id')
  async findOne(@Param('id') id) {
    return `This action returns a #${id} test`;
  }
}
```
### Provider

什么是 `Provider`？ 语义化翻译就是 `提供者`，在 Nest 中，除了控制器以外，几乎所有的东西都可以被视为提供者,比如`service、repository、factory、helper `等等。他们都可以通过构造函数注入依赖关系，也就是说，他们之间可以创建各种关系。而提供者只不过是一个用 `@Injectable()` 装饰器的简单类。

在类声明上，定义 `@Injectable()` 装饰器，即可将该类定义为提供者。如：
```js
import { Injectable } from '@nestjs/common';
@Injectable()
export class TestService {
  private readonly test: Test[] = [];

  async create(createTestDto: CreateTestDto) {
    this.test.push(createTestDto);
  }

  async remove(id: number) {
    this.test.splice(test.indexOf(test.find(t => t.id === id)), 1);
  }

  async update(id: number, updateTestDto: UpdateTestDto) {
      if(updateTestDto.name) this.test.find(t => t.id === id).name = updateTestDto.name;
  }

  async findOne(id: number): Test {
      return this.test.find(t => t.id === id);
  }
}
```
### Module
Module也是一个装饰器，Nest 使用 `Module`来组织应用程序结构，每个应用程序至少有一个模块，即根模块。根模块是 Nest 开始排列应用程序树的地方。当应用程序很小时，根模块可能是应用程序中唯一的模块。不过，大多数情况下，都有很多模块，每个模块都有一组与其密切相关的功能。

模块，是用来组织 `Controller` 和 `Provider`，为他们在 `同模块范围内` 建立依赖关系的。比如上面的 `Controller` 和 `Provider`，我们建立关系：
```js
import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestService } from './test.service';

@Module({
  controllers: [TestController],
  providers: [TestService],
})
export class TestModule {}
```
只有这样，Nest 才可以在 `TestController` 中通过其构造函数，依赖注入 `TestService`，才可以在 controller 中调用 service 服务。

而当不同模块之间的服务需要互相调用时，我们就要在对应的模块之间导出和导入了，例如：
```js
import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestService } from './test.service';

@Module({
  imports: [],
  controllers: [TestController],
  providers: [TestService],
  exports: [TestService]
})
export class TestModule {}
```
#### 全局模块
如果你必须在很多地方都导入相同的模块，这会出现大量的冗余。但是 Nest 将提供者封装在模块范围内，如果不导入模块，就无法在其他地方使用他们导出的提供者。但是有时候，你可能只是想提供一组随时可用的提供者，例如：`helpers、database connection` 等等。针对这种特殊情况，Nest 提供了一个很强大的功能 —— `全局模块`，全局模块一旦被导入到根模块，在其他所有模块中即可轻松的使用这个全局模块导出的提供者，而且也不用在其他模块导入这个全局模块。

将一个模块定义为全局模块，只需要在类上额外增加一个装饰器 ` @Global()` 即可，示例：
```js
import { Module, Global } from '@nestjs/common';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [],
  exports: []
})
export class TestModule {}
```
#### 动态模块
Nest 模块系统有一个称为动态模块的特性。它能够让我们创建可定制的模块，当导入模块并向其传入某些选项参数，这个模块根据这些选项参数来动态的创建不同特性的模块，这种通过导入时传入参数并动态创建模块的特性称为 `动态模块`。

```js
@Module({})
export class AppModule {
  static register(CustomController): DynamicModule {
    return {
      module: AppModule,
      controllers: [CustomController],
      providers: [],
      exports: [],
    };
  }
}
```

### NestFactory

在 Nest 中，我们通过在 main 入口中调用 `NestFactory.create` 来创建 Nest 应用实例，Nest 创建的实例默认是 `express` 实例。main 入口示例：
```js
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  // 使用 NestFactory 创建一个根模块为 AppModule 的 Nest app
  const app = await NestFactory.create(AppModule);
  // 将这个 Nest app 监听本地的 3000 端口，即：http://localhost:3000
  await app.listen(3000);
}
bootstrap();
```
### Middleware

Middleware 即中间件，它是请求发出者和路由处理器之间的桥梁，可以透明的、轻松的访问请求和响应对象。在 Nest 中，中间件可以有多个，他们之间使用 `next()` 方法作为连接，连接后的所有中间件将在整个请求-响应周期内通过 `next() `依次执行。
> 注：默认情况下，Nest 中间件等同于 Express 中间件。
Nest 中间件可以是一个函数，也可以是一个带有 `@Injectable()` 装饰器的类，且该类应该实现 NestMiddleware 接口，而函数没有任何特殊要求。如下简单示例：
```js
// 带有 `@Injectable()` 装饰器的类中间件
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class OAAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...: ', req);
    next();
  }
}
// 函数中间件
export function OAAuthMiddleware(req, res, next) {
  console.log('res: ', res);
  next();
}
```
与`Provider`和`Controller`一样，中间件也能够通过构造函数注入属于同一模块的依赖项。

#### 全局中间件使用
为了将中间件一次性绑定到每个注册的路由，我们可以通过 Nest 实例中的 `use()` 方法使用:
```js
const app = await NestFactory.create(ApplicationModule);
// 这里必须使用函数中间件
app.use(OAAuthMiddleware);
await app.listen(3000);
```
#### 模块中使用
既然中间件是请求发出者和路由处理器之间的桥梁，那么他就应该在一个模块的入口，即 `XXXModule` 类中被使用。在 Nest 中，我们只需要在模块类中实现 NestModule 接口：
```js
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { OAAuthMiddleware } from './common/middlewares/oAAuthMiddleware.middleware';
import { TestModule } from './test/test.module';

@Module({
  imports: [TestModule],
})
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(OAAuthMiddleware)
      .forRoutes('test');
  }
}
```
在上面的例子中，我们为 `/test` 路由处理器 `（@TestController('/test')）` 设置了鉴权中间件。
如果只需要给 `/test` 路由中的某几个请求方法设置这个中间件，那只需要改变一下 `forRoutes()` 方法中的参数即可：`forRoutes({ path: 'test', method: RequestMethod.GET })`，此时，只有 GET 请求才会被中间件拦截。如果存在很多路由规则，也可以使用通配符来处理。如：
```js
forRoutes({ path: 'ab*cd', method: RequestMethod.ALL })
```
而当你想排除一个控制器类中的某些路由不使用中间件时，使用 `exclude()` 方法即可，如：
```js
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { OAAuthMiddleware } from './common/middlewares/oAAuthMiddleware.middleware';
import { TestModule } from './test/test.module';

@Module({
  imports: [TestModule],
})
export class ApplicationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(OAAuthMiddleware)
      .exclude(
        { path: 'test', method: RequestMethod.GET },
      )
      .forRoutes('test');
  }
}
```
### 最后
了解了 Nest 的基本概念之后，可以安装`@nestjs/cli`来体验一下 Nest 项目，这里给大家出个思考题，如何把 Nest 项目抽离为 runtime(Nest框架) + faas(入口文件) 的形式呢？
### 参考资料
+ https://www.bookstack.cn/read/es6-3rd/docs-decorator.md
+ https://docs.nestjs.com
+ http://ourjs.com/wiki/view/nestjs/02.controller