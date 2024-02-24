import type { APIContext } from 'astro';
import { allRating } from '../../../modal/db';

export async function GET({ params }: APIContext) {

	const id = Number(params.id);
   
    const item = allRating.find(p => p.id === id);

    if (item==undefined) {
        return new Response(null, {
			status: 404,
			statusText: 'Not found',
		});
    } else{
        return new Response(JSON.stringify(item));
    }

}