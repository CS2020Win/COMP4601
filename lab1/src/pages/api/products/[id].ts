import type { APIContext } from 'astro';
import { allRating, allItems } from '../../../modal/db';
import type { Product } from '../../../Utils';

export function GET({ params }: APIContext) {
	const id = Number(params.id);
    
    let item = allItems.find(p => p.id === id);
   
 
    if (item==undefined) {
        return new Response(null, {
			status: 404,
			statusText: 'Not found',
		});
    } else{
        const ratings=allRating.filter(r=>Number(r.productId)===id);
        const totalScore = ratings.reduce((sum:number, rating) => sum + Number(rating.score), 0);
        // 求出平均分 
        const avgScore = totalScore / ratings.length;
        // console.log(avgScore);
        // console.log(ratings);
        const result: Product = {
            id: item.id,
            name: item.name,
            price: item.price,
            dimensions: {
              x: item.dimensions.x,
              y: item.dimensions.y, 
              z: item.dimensions.z
            },
            stock: item.stock,
            rating: avgScore
          };
      
        
        return new Response(JSON.stringify(result));
    }

}