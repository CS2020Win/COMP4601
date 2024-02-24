import type { APIContext, APIRoute } from "astro";
import { RatingsCollection, allItems, allRating } from "../../modal/db";
import type { Rating } from "../../Utils";

export async function GET({ params, request }: APIContext) {
  // console.log(request.url);
  // const searchTerm = Astro.url.searchParams.get("query")! || "";
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");

  let db_ratings = await RatingsCollection();

  // let productAllRating = allRating;
  console.log("productId==" + productId);
  let query = {};
  if (productId != null) {
    query = {
      productId: {
        $eq: Number(productId),
      },
    };
  }
  console.log(query);

  const productAllRating = await db_ratings.find(query).toArray();
  console.log(productAllRating);
  return new Response(JSON.stringify(productAllRating), {
    status: 200,
    statusText: "OK",
  });
}

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  //   const name = data.name; 随机产生

  const productId = data.productId;
  //   const date = data.date; 获取当前时间

  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const dateStr = year + "/" + month + "/" + date;

  const score = data.score;

  let db_ratings = await RatingsCollection();

  //获取已有的最大 id
  const result = await db_ratings
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
  if (result.length > 0) {
    maxId = result[0].maxId;
  }

  const item: Rating = {
    id: maxId + 1,
    name: "TestUser" + maxId + 1,
    productId: Number(productId),
    date: dateStr,
    score: Number(score),
  };

  console.log("insert ratings\n" + JSON.stringify(item));
  let insertResult = await db_ratings.insertOne(item);
  // allRating.push(item);

  console.log(JSON.stringify(insertResult));

  return new Response(
    JSON.stringify({
      message: "Success!",
    }),
    { status: 200 }
  );
};
