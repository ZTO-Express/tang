# tang-tang

tang 基础库

## 关于

tang 核心库包含 tang 体系的主要核心概念的抽象

## 概念

目前 tang 核心库中包含如下概念：编译器、处理器、钩子等

### 编译器 (compiler)

编译器是 tang 的核心概念，支持对各类资源进行加载，以及生成各类文件。如下为示例代码：

```typescript
import tang from 'tang-tang';

const compile = async () => {
  // 创建编译器
  const compiler = tang({});

  // 加载文档
  const compilation = await compiler.load('http://example.com/openapi.yaml');

  // 生成文档
  const output = await compiler.generate(compilation.document);

  console.log(output.files);
};

compile();
```

### 处理器 (processor)

tang 的编译过程涉及到目标文档的加载、解析、生成以及输出，其对应了一下 4 种类型处理器：加载器(loader)，解析器(parser)，生成器(generator)。

所有处理器在编译器进行加载或生成过程中，按照优先级和顺序选择特定的处理器进行处理。

1. 加载器（loader）

   加载器用于从各类资源加载文档并返回字符串。目前内核内置两类加载器：

   - localLoader: 支持从本地文件系统加载文件
   - urlLoader: 支持通过请求 url 地址加载文件

2. 解析器（parser）

   解析器用于解析字符串为对象，并存储在 compilation 中的 document 对象中。目前内置两类解析器：

   - jsonParser: 支持将 json 文本解析对对象
   - yamlParser: 支持将 yaml 文本解析对对象

3. 生成器（generator）

   生成器用于将对象生成文本并存储在 generation 对象中。目前内置两类生成器：

   - jsonGenerator: 支持将对象生成 json 文档字符串
   - yamlGenerator: 支持将对象生成 yaml 文档字符串

4. 输出器（outputer）

   输出器用于对生成器生成的文档字符进行输出。目前内置两类输出器：

   - localOutputer: 将字符文件输出到本地文件系统。
   - memoryOutputer: 将字符文件输出到内存文件系统。

### 钩子 (hook)

钩子支持在编译器进行加载或生成的过程中加入额外的处理逻辑，以达到功能扩展的目的。

当前支持的 hook 触发点有：

1. 加载时钩子

   - load: 加载文档前
   - parse: 加载文档后，解析文档前
   - loaded: 加载文档

2. 生成时钩子

   - generate: 生成操作前
   - output: 生成操作后，输出操作前
   - generated: 输出操作后

3. 全局钩子

   - \*: 所有操作

除了 generated 钩子执行时为并行执行外，其他所有钩子方法都是顺序执行。
