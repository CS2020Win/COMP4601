import type { APIContext } from "astro";
import { OrdersCollection, ProductsCollection } from "../../modal/db";
import type { Order, OrderView, Product } from "../../Utils";

export async function POST({ cookies, request }: APIContext) {
  const data = await request.json();
  // console.log(data);
  const productId = Number(data.id);
  const purchaser = data.purchaser;

  const db_orders = await OrdersCollection();
  const db_products = await ProductsCollection();
  //计算一个 order id
  const orderResults = await db_orders
    .aggregate([
      {
        $group: {
          _id: null,
          maxId: { $max: "$id" },
        },
      },
    ])
    .toArray();
  let maxId = 0;
  if (orderResults.length > 0) {
    maxId = orderResults[0].maxId;
  }

  // Missing the purchaser’s name

  if (purchaser == null || purchaser == undefined) {
    return new Response(
      JSON.stringify({
        message: "Missing the purchaser’s name!",
        result: "",
      }),
      { status: 409 }
    );
  }

  // If the order is invalid, the server should send a response code of 409
  const product: Product = await db_products.findOne({ id: productId });
  if (product == null) {
    return new Response(
      JSON.stringify({
        message: "Product does not exist!",
        result: "",
      }),
      { status: 409 }
    );
  }
  if (product.stock <= 0) {
    return new Response(
      JSON.stringify({
        message: "Out of stock!",
        result: "",
      }),
      { status: 409 }
    );
  }

  console.log("productId=" + productId);
  // 数据库中原有订单的商品数量
  const db_order_data = await db_orders.findOne({
    productId: productId,
    status: 1,
  });
  console.log("orders数据\n" + JSON.stringify(db_order_data));
  let db_order_quntity = 0;
  if (db_order_data != null) {
    db_order_quntity = db_order_data.quantity;
  }

  const orderItem: Order = {
    id: maxId + 1,
    productId: productId,
    quantity: db_order_quntity + 1,
    name: purchaser,
    status: 1,
  };
  //插入到orders collection
  let ret;
  try {
    if (db_order_data != null) {
      // 修改
      ret = await db_orders.updateOne(
        { productId: productId,status:1 }, // 查询条件
        {
          $set: { ...orderItem }, //赋值
        }
      );
    } else {
      //新增
      ret = await db_orders.insertOne(orderItem);
    }
  } catch (error) {
    console.log("插入或更新MongoDB orders失败\n" + JSON.stringify(orderItem));
    return new Response(
      JSON.stringify({
        message: "Server error!",
        result: ret,
      }),
      { status: 500 }
    );
  }

  if (ret.acknowledged == true) {
    console.log("orders插入成功");
    return new Response(
      JSON.stringify({
        message: "Add to Order Success!",
        result: ret,
      }),
      { status: 201 }
    );
  } else {
    console.log("orders插入失败");
    return new Response(
      JSON.stringify({
        message: "Add to Order Failed!",
        result: ret,
      }),
      { status: 500 }
    );
  }
}

export async function GET({ cookies, request }: APIContext) {
  const db_orders = await OrdersCollection();
  const db_products = await ProductsCollection();

  const allOrders = await db_orders.find({status:1}).toArray();
  // const allProducts = await db_products.find({}).toArray();

  const productIds = allOrders.map((o) => o.productId);
  console.log("productIds=" + JSON.stringify(productIds));

  //查询order关联的products
  const order_products = await db_products
    .find({
      id: { $in: productIds },
    })
    .toArray();
  // 保存到 Map
  const productMap = new Map();
  for (let product of order_products) {
    productMap.set(product.id, product);
  }

  //构造返回数据
  let orderViewArray: OrderView[] = [];
  let totalQuantity = 0;
  let totalAmount = 0; //总金额
  for (let order of allOrders) {
    totalQuantity += order.quantity;
    const product = productMap.get(order.productId);
    const orderViewItem = {
      id: order.id,
      productId: product.id,
      productName: product.name,
      price: product.price,
      dimensions: {
        x: product.dimensions.x,
        y: product.dimensions.y,
        z: product.dimensions.z,
      },
      stock: product.stock,
      quantity: order.quantity,
      name: order.name,
    };
    orderViewArray.push(orderViewItem);
    totalAmount += order.quantity * product.price;
  }

  // console.log(
  //   "ret=" +
  //     JSON.stringify({
  //       productCount: allOrders.length,
  //       quantity: totalQuantity,
  //       totalAmount:totalAmount,
  //       data: orderViewArray,
  //     })
  // );

  return new Response(
    JSON.stringify({
      productCount: allOrders.length,
      quantity: totalQuantity,
      totalAmount: totalAmount,
      data: orderViewArray,
    }),
    {
      status: 200,
      statusText: "OK",
    }
  );
}
