import type { APIContext } from "astro";
import {ProductsCollection, RatingsCollection } from "../../../modal/db";
import type { Product } from "../../../Utils";

export async function GET({ params }: APIContext) {
  const id = Number(params.id);

  const db_products = await ProductsCollection();
  //构建查询语句
  let query = {
    id: {
      $eq: id,
    },
  };

  // console.log(query);

  let item = (await db_products.find(query).toArray())[0];
  //求平均评分值
  const db_ratings = await RatingsCollection();
  const product_ratings = await db_ratings.aggregate([
    {
      $match: {
        productId: id
      }
    },
    {
      $group: {
        _id: null,
        score: { $avg: "$score" }
      }
    }
  ]).toArray();
  let avgRating = 0.0;
  if (product_ratings.length>0) {
    avgRating= product_ratings[0].score;
  }

  console.log(avgRating);

  item.rating=Number(avgRating);
  console.log(JSON.stringify(item));
  // const result: Product = {
  //   id: item.id,
  //   name: item.name,
  //   price: item.price,
  //   dimensions: {
  //     x: item.dimensions.x,
  //     y: item.dimensions.y, 
  //     z: item.dimensions.z
  //   },
  //   stock: item.stock,
  //   rating: avgScore
  // };

  // console.log(JSON.stringify(item));
  if (item == undefined) {
    return new Response(JSON.stringify(""), {
      status: 404,
      statusText: "Not found",
    });
  } else {
    return new Response(JSON.stringify(item), {
      status: 200,
      statusText: "OK",
    });
  }
}
