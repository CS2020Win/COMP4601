import type { APIContext, APIRoute } from "astro";
import { ProductsCollection } from "../../modal/db";
import { type Product } from "../../Utils";

export async function GET({ cookies, request }: APIContext) {
  // console.log(request.url);
  // const searchTerm = Astro.url.searchParams.get("query")! || "";

  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const searchTerm = searchParams.get("name");
  const instock = searchParams.get("instock");

  //构建MongoDB中的查询条件
  let query = {};
  // 名称的查询条件
  let nameRegex;
  if (searchTerm) {
    // i 表示忽略大小写
    nameRegex = new RegExp(searchTerm, "i");
  } else {
    nameRegex = /.*/;
  }

  query = {
    name: {
      $regex: nameRegex,
    },
  };

  //库存的查询条件
  if (instock != undefined) {
    if (Number(instock) === 1) {
      // 添加 stock 查询
      query.stock = {
        $gt: 0,
      };
    } else if (Number(instock) === 0) {
      query.stock = {
        $eq: 0,
      };
    }
  }

  console.log(query);

    // get products collection data from mongodb
  const db_products = await (await ProductsCollection()).find(query).toArray();

  // console.log(db_products);

  return new Response(JSON.stringify(db_products), {
    status: 200,
    statusText: "OK",
  });
}

export async function POST({ cookies, request }: APIContext) {
  const data = await request.json();
  // console.log(data);
  const name = data.name;
  const price = data.price;
  const stock = data.stock;
  const x_val = data.x_val;
  const y_val = data.y_val;
  const z_val = data.z_val;

  const db_products=await ProductsCollection();

  //获取已有的最大 id
  const result = await db_products.aggregate([
    {
      $group: {
        _id: null,
        maxId: { $max: "$id" }  
      } 
    }
  ]).toArray();
  let maxId=0;
  if(result.length>0){
    maxId = result[0].maxId;
  }


  console.log("maxId="+maxId);

  const item: Product = {
    id: maxId + 1,
    name: name,
    price: Number(price),
    dimensions: {
      x: Number(x_val),
      y: Number(y_val),
      z: Number(z_val),
    },
    stock: Number(stock),
    rating: 0,
  };

  // 获取 MongoDB中的products collection，并往其中插入条数据
  let ret;
  try {
    ret = await db_products.insertOne(item);
  } catch (error) {
    console.log("插入MongoDB失败\n"+JSON.stringify(item));
    return new Response(
      JSON.stringify({
        message: "Server error!",
        result:ret,
      }),
      { status: 500 }
    );
  }

  if (ret.acknowledged==true) {
    console.log('products插入成功');
    return new Response(
      JSON.stringify({
        message: "Success!",
        result:ret,
      }),
      { status: 200 }
    );
  } else {
    console.log('products插入失败'); 
    return new Response(
      JSON.stringify({
        message: "insert to mongodb failed!",
        result:ret,
      }),
      { status: 500 }
    );
  }
  
}

export const PUT: APIRoute = async ({ request }) => {
  const data = await request.json();
  // console.log(data);

  const productId = Number(data.id);
  //获取 products collection
  const db_products= await ProductsCollection();

  const updateItem: Product = {
    id: Number(data.id),
    name: data.name,
    price: Number(data.price),
    dimensions: {
      x: Number(data.x_val),
      y: Number(data.y_val),
      z: Number(data.z_val),
    },
    stock: Number(data.stock),
    rating: 22,
  };

  const ret = await db_products.updateMany(
    {id:productId}, // 查询条件
    {
      $set: {...updateItem} //赋值
    }
  );

  console.log(JSON.stringify(ret)); 

  if(ret.modifiedCount<1){
    return new Response(
      JSON.stringify({
        message: "save update failed!",
      }),
      { status: 500 }
    );
  }else{
    return new Response(
      JSON.stringify({
        message: "Success!",
      }),
      { status: 200 }
    );
  }
  
  
};
