import type { APIContext } from "astro";
import { OrdersCollection, ProductsCollection } from "../../../modal/db";
import type { OrderView } from "../../../Utils";

export async function GET({ params }: APIContext) {
  const orderId = Number(params.id);
  const db_orders = await OrdersCollection();

  const allOrders = await db_orders.find({ id: orderId, status: 1 }).toArray();
  const db_products = await ProductsCollection();

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

export async function POST({ cookies, request }: APIContext) {
  const data = await request.json();
  const orderId = Number(data.orderId);
  const db_orders = await OrdersCollection();
  const db_products = await ProductsCollection();

  const processed_order = await db_orders.findOne({ id: orderId,status:1 });
  if (processed_order == null) {
    return new Response(
      JSON.stringify({
        message: "Order " + orderId + " doesn't exist!",
      }),
      {
        status: 404,
        statusText: "Not Found",
      }
    );
  }

  console.log("processed_order==" + JSON.stringify(processed_order));

  const order_quntity = processed_order.quantity;
  console.log("processed_order.productId=" + processed_order.productId);
  const order_product = await db_products.findOne({
    id: processed_order.productId,
  });
  console.log("order_product==" + JSON.stringify(order_product));

  if (order_product == null) {
    return new Response(
      JSON.stringify({
        message: "Product " + processed_order.productId + " doesn't exist!",
      }),
      {
        status: 404,
        statusText: "Not Found",
      }
    );
  }

  // stock 校验
  const product_stock = order_product.stock;
  if (product_stock < order_quntity) {
    return new Response(
      JSON.stringify({
        message: "Out of stock!",
      }),
      {
        status: 409,
        statusText: "Confict",
      }
    );
  }

  // 更新product中的stock数量
  const productId = processed_order.productId;
  let updateItem = order_product;
  updateItem.stock = product_stock - order_quntity;
  //   console.log("updateItem="+JSON.stringify(updateItem));
  const ret = await db_products.updateOne(
    { id: productId }, // 查询条件
    {
      $set: { ...updateItem }, //赋值
    }
  );
  const purchaserName = processed_order.name;

  //   console.log("update product ret=="+JSON.stringify(ret));
  // 完成订单，从orders 集合中删除
//   const result = await db_orders.deleteOne({ id: orderId });
  let updateOrderItem = processed_order;
  updateOrderItem.status=0;
  const updateRet = await db_orders.updateOne(
    { id: orderId }, // 查询条件
    {
      $set: { ...updateOrderItem }, //赋值
    }
  );
  console.log("update order ret==" + JSON.stringify(updateRet));

  return new Response(
    JSON.stringify({
      message:
        purchaserName +
        " complete  order " +
        orderId +
        ", quantity=" +
        order_quntity +
        " success!",
    }),
    {
      status: 201,
      statusText: "OK",
    }
  );
}

export async function DELETE({ request }: APIContext) {
  const data = await request.json();
  const orderId = Number(data.orderId);

  const db_orders = await OrdersCollection();
  // 删除文档
  const processed_order = await db_orders.findOne({ id: orderId });
  let updateOrderItem = processed_order;
  updateOrderItem.status=-1;
  const ret = await db_orders.updateOne(
    { id: orderId }, // 查询条件
    {
      $set: { ...updateOrderItem }, //赋值
    }
  );
  return new Response(
    JSON.stringify({
      message: "Delete order " + orderId + " success!",
    })
  );
}
