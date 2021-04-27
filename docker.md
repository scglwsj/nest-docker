# Nest in docker

在 Nest.js 项目中，为了部署到服务器上，Dockers 镜像是必不可少的。而 Nest 本身并没有带有 dockerfile，所以这一部分需要我们自己手动创建。现在我们尝试为一个 Nest 项目书写 DockerFile。

## 项目准备

使用 Nest CLI 创建一个全新的 Nest 项目

``` bash
npm i -g @nestjs/cli
nest new project-name
```

项目结构如下图：

![newNest1.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2103cc6d5ebf4ff3b8396c39dce8412b~tplv-k3u1fbpfcp-watermark.image)

## 编译

在本机调试 Nest 时可以直接运行 TS 代码，但实际上 node.js 并不是一个 TS 的运行时，所以事实上 Nest 是依靠 ts-node 将代码在内存中编译为了 js 代码再运行。而在服务器上代码是不会变动且不需要调试的，所以没有必要继续使用 TS 代码，而应该将其编译为 JS 代码。

``` bash
yarn build
```

得到 dist 文件夹：

![dist1.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/399f495e0f054d089360e31235df4c35~tplv-k3u1fbpfcp-watermark.image)

## 编写最简 dockerfile

新建 dockerfile 文件

``` dockerfile
FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY ./dist .
EXPOSE 3000
CMD ["node", "main.js"]
```

## 为 docker 中添加 node_modules
最简镜像是无法使用的，因为没有 node_modules 的支持，项目是无法启动的。也不能将本机的 node_modules 拷贝进 docker 中，不同操作系统不同环境的 node_modules 不能混用。正确的做法是添加 package.json 文件放入 docker，再下载依赖，然后再将其删除（也可以不删，不过之后这个文件就没有用了）。

``` dockerfile
FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn --production --silent
RUN rm package.json yarn.lock
COPY ./dist .
EXPOSE 3000
CMD ["node", "main.js"]
```

## 限定文件的拷贝

虽然能够通过访问 `http://localhost:3000/` 得到 `Hello World!`，但观察 docker 镜像发现文件结构如下：

![distInDocker.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/15d24b2920294b278511865f48c61cc6~tplv-k3u1fbpfcp-watermark.image)

很容易发现这里面有个很大的问题：多出很多非 .js 文件，增加了 docker 的空间。事实上 .ts.d 和 .js.map 是调试用的文件，而 tsconfig.build.tsbuildinfo 是编译信息，这些文件再运行时是不需要的。虽然修改 tscofig.josn 文件可以不生成这些文件，但又会影响调试，所以不推荐这么做。最简单的做法是在拷贝文件时只拷贝 js 和 json（某些配置会在 json 文件中） 文件。

``` dockerfile
FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn --production --silent
RUN rm package.json yarn.lock
COPY ["./dist/*.js", "./dist/*.json", "./"]
EXPOSE 3000
CMD ["node", "main.js"]
```

之后再观察文件夹发现只会得到纯净的运行文件

![distInDocker2.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/709ede089fc84a3c9f5f84df74eccc47~tplv-k3u1fbpfcp-watermark.image)

## 子目录的拷贝

随着项目的开发，目录结构不再是单层的文件，层级会变得复杂，我们希望最终镜像中的 JS 文件需要保持和原始 TS 一样的目录层级和结构。

假如我们的项目引入了 cats 模块，因此创建了子文件 cats。这是原始文件夹：

![newNest2.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9aae0dd1c83a49d4abe6ff81c1ce94ca~tplv-k3u1fbpfcp-watermark.image)

编译后的 dist 文件夹如下

![dist2.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/03a7b60d5f634525884a8f208b21e015~tplv-k3u1fbpfcp-watermark.image)

但是在 docker 镜像中并没有 cats 文件夹

![distInDocker2.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/709ede089fc84a3c9f5f84df74eccc47~tplv-k3u1fbpfcp-watermark.image)

COPY 命令仅仅拷贝文件夹下的文件，并没有拷贝文件夹，更没有保持目录层级。要保持文件层级只有在 copy 的时候使用 `.dist/`，但这样又会导致多拷贝文件，除了选择要拷贝什么文件之外，还有一种办法是使用 `.dockerignore` 文件反过来将不需要的文件排除出去。dockerfile 如下：

``` dockerfile
FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "yarn.lock", "./"]
RUN yarn --production --silent
RUN rm package.json yarn.lock
COPY ./dist/ .
EXPOSE 3000
CMD ["node", "main.js"]
```

然后在 `.dockerignore` 文件中添加

``` txt
**/*.js.map
**/*.d.ts
**/tsconfig.build.tsbuildinfo
```
之后再构建就能得到一个既保持了文件层级又只有 js 和 json 文件的 docker 镜像。

![distInDocker3.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a8f4a81011964947958e7e92c979ac5c~tplv-k3u1fbpfcp-watermark.image)

## 用起来

dockerfile 写完之后需要在 CI 上用起来，但并不是简单的直接就用的。下载好代码之后，运行 `docker build` 之前还是需要先运行 `yarn lint` `yarn build` `yarn test` 。还有就是依赖缓存，如果不做的话每次继承都需要去 npm 源下载依赖。这些都做完了之后，一个简易的 CI 就搭建好了。
