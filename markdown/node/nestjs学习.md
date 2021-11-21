### 简介
> Nest 是一个用于构建高效，可扩展的 `Node.js` 服务器端应用程序的框架。它使用渐进式 JavaScript，内置并完全支持 TypeScript（但仍然允许开发人员使用纯 JavaScript 编写代码）并结合了 `OOP（面向对象编程）`，`FP（函数式编程）`和 `FRP（函数式响应编程）`的元素。在底层，Nest 使用强大的 HTTP Server 框架，如 Express（默认）和 Fastify。Nest 在这些框架之上提供了一定程度的抽象，同时也将其 API 直接暴露给开发人员。这样可以轻松使用每个平台的无数第三方模块。

支持 `TypeScript`（也支持纯 js 编写代码）,默认支持最新的 ES6 等语法和特性(用 babel 做代码转换)。node 版本要求 `>= 10.13.0, v13 版本除外`。
### 基本概念
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

#### Controller
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
#### Provider

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
#### Module
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
##### 全局模块
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
##### 动态模块
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