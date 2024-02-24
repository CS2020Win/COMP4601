# Astro Starter Kit: Basics
Startup
``
cd e-shop
npm run start
```

Describe the RESTful design of your implementation
A. What resources do you have and how are they structured?
RESTful treats everything as a resource, and then accesses the resource through a unified interface, each resource has a unique identifier, at this stage it is the product and review resources that are manipulated, the resource identifiers for the products are products, and the resource representations for the reviews are ratings. there is a one-to-many relationship between the products and the reviews, a product can have more than one review, which are associated with each other by the id of the product. They are associated with each other by the product id.


b. What HTTP methods do you use to perform various operations? Why?
Use GET, POST, PUT HTTP methods to perform operations on resources. According to the RESTful specification, the GET method is used to query resources, the POST method is used to add new resources, and the PUT method is used to modify the status of resources.

C. What is your URI naming scheme?
- GET /api/products - to get the list of products
- GET /api/products?name=test&instock=1 - search for products
- GET /api/products/{id} - Get individual product information
- POST /api/products - Add new product
- PUT /api/products - Modify products

- GET /api/ratings - Get the list of ratings.
- GET /api/ratings?productId=1 - get reviews by productId
- GET /api/ratings/{id} - Get individual review information
- POST /api/ratings - add a list of new reviews

d. What response codes you send and why
Send 200, 404 response status code, when the request is normally processed, send 200 to indicate that the request is normally responded to; when the request does not find the corresponding resource, return 404 status code, indicating that the resource was not found.

The use of open source libraries
daisyUI
tailwind css

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.




## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
