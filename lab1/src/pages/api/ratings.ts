import type { APIRoute } from "astro";
import { allItems, allRating } from "../../modal/db";
import type { Rating } from "../../Utils";

export const GET: APIRoute = ({ params, request }) => {
  // console.log(request.url);
  // const searchTerm = Astro.url.searchParams.get("query")! || "";
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
  let productAllRating = allRating;

  if (productId != null) {
    productAllRating = productAllRating.filter(
      (item) => Number(item.productId) === Number(productId)
    );
  }

  return new Response(JSON.stringify(productAllRating), {
    status: 200,
    statusText: "OK",
  });
};

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
//   const name = data.name; 随机产生

  const productId = data.productId;
//   const date = data.date; 获取当前时间

    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth() + 1; 
    const date = now.getDate();
    const dateStr = year+"/"+month+"/"+date;

  const score = data.score;
  const maxId = allRating.reduce((max, item) => {
    return item.id > max ? item.id : max;
  }, 0);

  const item: Rating = {
    id: maxId + 1,
    name: "TestUser"+maxId + 1,
    productId: productId,
    date: dateStr,
    score: score,
  };

  allRating.push(item);

//   console.log(allRating);

  return new Response(
    JSON.stringify({
      message: "Success!",
    }),
    { status: 200 }
  );
};
