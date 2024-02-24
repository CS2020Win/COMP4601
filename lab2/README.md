# Astro Starter Kit: Basics
启动
```
cd e-shop
npm run start
```

# MongoDB
本地需要安装MongoDB

# Lab1
描述您的实施的 RESTful 设计
A. 您拥有哪些资源以及它们的结构是什么？
RESTful把所有东西看作资源,然后通过统一的接口访问资源, 每个资源都有一个唯一标识，现阶段是对商品、评论资源的操作，商品的资源标识是products,评论的资源表示是ratings。商品和评论之间是一对多的关系，一个商品可以有多个评论，它们之间通过商品id进行关联。


b. 您使用哪些 HTTP 方法来执行各种操作？为什么？
使用GET、POST、PUT HTTP方法进行资源的操作，按照RESTful规范，GET方法用于查询资源，POST方法用于新增资源，PUT方法用于修改资源的情况。

C. 您的 URI 命名方案是什么？
- GET /api/products - 获取商品列表
- GET /api/products?name=test&instock=1 - 搜索商品
- GET /api/products/{id} - 获取单个商品信息
- POST /api/products - 新增商品
- PUT /api/products - 修改商品

- GET /api/ratings - 获取评论列表
- GET /api/ratings?productId=1 - 按productId获取评论
- GET /api/ratings/{id} - 获取单个评论信息
- POST /api/ratings - 新增评论列表

d. 您发送什么响应代码以及原因
发送200、404响应状态码，当请求正常被处理时，发送200表示请求正常响应；当请求未找到对应的资源时，返回404状态码，表示未找到资源。

使用的开源组建库
daisyUI
tailwind css


# Lab2
## 问题
1. Discuss the collections and documents that you store in the database (e.g., what data are you storing about products, orders, etc.).
在MongoDB中，创建了一个lab2的database，在database下面创建了produtcts、ratings和orders三个 collections，分别存储商品数据、商品的评分数据和订单数据。每个collecton中都以一个json对象代表一个记录。
```
Product  {
  id: number; //unique ID for each product
  name: string; //the name of the product
  price: number; //price of the product
  dimensions: { x: number; y: number; z: number }; //size dimensions of the product
  stock: number; //the number of units in stock
  rating:number;
};

Order  {
  id: number; //unique ID for each product
  productId:number;
  quantity:number;
  name: string; //the name of the product
  status:number; // status of order
};

Rating  {
  id: number; //unique ID for each product
  productId: number; //the name of the product
  name: string; //price of the product
  date: string;
  score:number;
};
```


2. What is the structure of your new order data? How is it sent to the server (e.g., through an HTML form, JSON request)?

Order  {
  id: number; //unique ID for each order
  productId:number; id of  product
  quantity:number; 
  name: string; //the name of the purchaser
  status:number; // status of order. 0 complete, 1 wait process, -1 delete
};

通过调用POST接口 /api/orders ，以json的形式将订单数发送到接口，在接口中组装订单数据，写入MongoDB的orders collection中保存

3. How do you load the data for a specific order so it can be displayed to the user?
本网站中，目前以列表的形式分商品展示所有订单，通过调用GET接口 /api/orders 获取所有的待处理的订单。/api/orders接口中首先通过MongoDB的查询语句将status为1的订单查询出来，再通过订单的productId与
商品collection进行关联，构造一个给前端展示用的对象OrderView，其将 orders 和 products collection中的一些字段组合一起以json的形式返回给前端。
OrderView  {
  id: number; //unique ID for each product
  productId:number;
  productName:string,
  price:number,
  dimensions:{ x: number; y: number; z: number };
  stock: number; 
  quantity:number;
  name: string; //the name of the person
};

前端拿到返回的json数据后解析展示到页面。

## 视频说明
这次Lab2实验基于Lab1进行的开发，将原来的json文件存储的数据改为MongoDB进行存储，通过与MongoDB交互进行数据的读取和存储操作。Lab2在Lab1的基础上增加了订单的功能，可以对商品进行下单处理，下单会对订单信息进行校验，同时会对MongoDB中存储的商品库存数据进行扣减。下面演示Lab2的功能。
首先，因为没有往MongoDB里初始化商品数据，所以页面没有任何商品信息，先在MongoDB中创建一个Lab2的database和products的collection，导入Lab1中使用的JSON文件初始化collections，再新建名为ratings和orders的collection。现在刷新页面，可以看到商品数据已经展示到页面上来了。
接着，验证下Lab1中的功能再改成MongoDB后是否正常使用。
搜索功能，在所有商品、有/无货的商品中搜索，都能够准确的返回搜索结果。
商品修改功能，点击编辑按钮，对商品信息进行修改，查看MongoDB中products collection里对应的商品数据，可以看到数据被正确的更新了。
评分功能，点击添加评分，可以看到界面正常展示商品所有的评分，查看MongoDB中的ratings collections里，新增了商品的评分记录。
新增商品功能，点击新增商品按钮，在弹出框里输入商品信息，保存后页面正常展示新增的商品数据，同时MongoDB中products中也保存了对应的新增商品数据，对新增商品进行一系列操作，都能够正确的处理。Lab1的所有功能均正常使用。
再看orders相关的功能，点击购物车按钮，将商品加入了订单，右上角会显示订单所有的商品数量，对于无货的商品，创建订单的HTTP POST请求 /api/orders 会返回409状态码，页面会提示 Out of stock，商品无法创建订单。
点击右上角的购物车图标，进入订单列表页，订单列表页以商品的维度展示订单信息，每一行展示一个商品的订单信息，如商品名、购买的数量，商品总价等。我们点击商品右边的PROCEED TO PURCHASE按钮，可以完成商品的订单。点击PROCEED TO PURCHASE按钮，会调用POST接口/api/orders/{id}，将订单id传递给接口，在接口中，对products中的关联的商品库存进行扣减，同时将orders中的status改为0。点击DELETE 按钮，调用接口/api/orders/{id}的DELETE方法，将orders中关联的订单状态改为-1。在处理订单时，会对商品的库存状态进行校验，如果不满足要求则无法完成订单。比如我们修改MongoDB中的记录将这个商品的库存改为0，再点击PROCEED TO PURCHASE按钮，回提示Out of stock，无法完成订单的处理。
以上就是Lab2的演示内容。



```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.




## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
