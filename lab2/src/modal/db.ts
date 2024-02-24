// import type { Rating } from "../Utils";
// import db from "./data/product.json";
//import mongo dependencies
import { MongoClient } from 'mongodb'
const uri = "mongodb://127.0.0.1:27017"; //mongodb地址
const options = {};

// const allItems = db;

// let allRating: Rating[] = [];

// const itemsMap = new Map(allItems.map((item) => [item.id, item]));

// export { allItems, itemsMap, allRating };

// mongodb operation
export const getLab2DB = async () => {
    const mongo = await new MongoClient(uri, options).connect();
    const db =  mongo.db("lab2");

    return db;
  };

export const ProductsCollection = async () => {
    const db = await getLab2DB();
    return db.collection("products");
};

export const RatingsCollection = async () => {
    const db = await getLab2DB();
    return db.collection("ratings");
};

export const OrdersCollection = async () => {
    const db = await getLab2DB();
    return db.collection("orders");
};
