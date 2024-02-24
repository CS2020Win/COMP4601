import type { Rating } from "../Utils";
import db from "./data/product.json";

const allItems = db;
let allRating: Rating[] = [];
const itemsMap = new Map(allItems.map((item) => [item.id, item]));

export { allItems, itemsMap, allRating };
