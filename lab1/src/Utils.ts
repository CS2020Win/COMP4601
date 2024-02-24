
export interface  Product  {
  id: number; //unique ID for each product
  name: string; //the name of the product
  price: number; //price of the product
  dimensions: { x: number; y: number; z: number }; //size dimensions of the product
  stock: number; //the number of units in stock
  rating:number;
};

export interface  Rating  {
  id: number; //unique ID for each product
  productId: number; //the name of the product
  name: string; //price of the product
  date: string;
  score:number;
};


export async function httpFetch(endpoint:string, options = {}) {
    const res = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  
    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`); 
    }
  
    return res.json();
  }

  export async function fetchPostList(url, category, pageNum, pageSize){
    let page=1;
    if (pageNum===undefined||pageNum==='') {
      //
    } else {
      page = Math.max(Number.parseInt(pageNum),1);
    }
    const res = httpFetch(url,{
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(
          {
              'categorySlug':category,
              'pageNum':page,
              'pageSize':pageSize
          }
      ),
  })
    return res;
  }

  
  export async function searchPostList(url, title, pageNum, pageSize){
    // console.log('utils='+pageNum);
    let page=1;
    if (pageNum===undefined||pageNum==='') {
      //
    } else {
      page = Math.max(Number.parseInt(pageNum),1);
    }
    const res = httpFetch(url,{
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(
          {
              'title':title,
              'pageNum':page,
              'pageSize':pageSize
          }
      ),
  })
    return res;
  }