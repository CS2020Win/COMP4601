import type { APIRoute } from "astro";
import { allItems } from "../../modal/db";
import type { Product } from "../../Utils";

export const GET: APIRoute = ({ params, request }) => {
  // console.log(request.url);
  // const searchTerm = Astro.url.searchParams.get("query")! || "";
  const url = new URL(request.url);

  const searchParams = url.searchParams;
  // console.log(searchParams);
  const searchTerm = searchParams.get("name");
  const instock = searchParams.get("instock");
  const productData = allItems;
  let inStockItems = productData;
  if (searchTerm) {
    inStockItems = productData.filter((item) => item.name.includes(searchTerm));
  }

  if (instock != undefined) {
    // console.log(instock);
    if (Number(instock) === 1) {
      // console.log(instock + "==1");

      inStockItems = inStockItems.filter((item) => Number(item.stock) > 0);
    } else if (Number(instock) == 0) {
      inStockItems = inStockItems.filter((item) => Number(item.stock) === 0);
    } else {
      console.log("参数非法，不过滤");
    }
  }

  return new Response(JSON.stringify(inStockItems), {
    status: 200,
    statusText: "OK",
  });
};

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  // console.log(data);
  const name = data.name;
  const price = data.price;
  const stock = data.stock;
  const x_val = data.x_val;
  const y_val = data.y_val;
  const z_val = data.z_val;

  //自动获取最大的id值
  const maxId = allItems.reduce((max, item) => {
    return item.id > max ? item.id : max;
  }, 0);

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

  allItems.push(item);

  return new Response(
    JSON.stringify({
      message: "Success!",
    }),
    { status: 200 }
  );
};

export const PUT: APIRoute = async ({ request }) => {
  const data = await request.json();
  // console.log(data);

  let item = allItems.find((p) => p.id === Number(data.id));
  // console.log(item);
  const index = allItems.indexOf(item);
  const ratingScore = item.rating;
  // 删除元素
  if (index !== -1) {
    allItems.splice(index, 1);
  }

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
    rating: ratingScore,
  };

  allItems.push(updateItem);

  return new Response(
    JSON.stringify({
      message: "Success!",
    }),
    { status: 200 }
  );
};
