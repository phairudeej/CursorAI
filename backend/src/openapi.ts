const errorSchema = {
  type: "object",
  required: ["error", "fields"],
  properties: {
    error: { type: "string" },
    fields: { type: "array", items: { type: "string" } },
  },
};

const vehicleTypeSchema = {
  type: "object",
  required: ["id", "name"],
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
  },
};

const brandSchema = {
  type: "object",
  required: ["id", "name"],
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
  },
};

const modelSchema = {
  type: "object",
  required: ["id", "brandId", "name"],
  properties: {
    id: { type: "integer" },
    brandId: { type: "integer" },
    name: { type: "string" },
  },
};

const productImageSchema = {
  type: "object",
  required: ["id", "url", "sortOrder"],
  properties: {
    id: { type: "integer" },
    url: { type: "string", description: "Public path starting with /uploads/" },
    sortOrder: { type: "integer", minimum: 0, maximum: 3 },
  },
};

const productSchema = {
  type: "object",
  required: [
    "id",
    "name",
    "description",
    "price",
    "year",
    "vehicleType",
    "brand",
    "model",
    "sellerName",
    "sellerPhone",
    "sellerLineUrl",
    "sellerAvatar",
    "viewCount",
    "createdAt",
    "images",
  ],
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
    description: { type: "string", nullable: true },
    price: { type: "integer", minimum: 0, maximum: 99999999 },
    year: { type: "integer", nullable: true },
    vehicleType: { nullable: true, allOf: [vehicleTypeSchema] },
    brand: { nullable: true, allOf: [brandSchema] },
    model: { nullable: true, allOf: [modelSchema] },
    sellerName: { type: "string", nullable: true },
    sellerPhone: { type: "string", nullable: true },
    sellerLineUrl: { type: "string", nullable: true },
    sellerAvatar: { type: "string", nullable: true },
    viewCount: { type: "integer", minimum: 0 },
    createdAt: { type: "string", format: "date-time" },
    images: { type: "array", items: productImageSchema },
  },
};

const productFormProperties = {
  name: { type: "string" },
  description: { type: "string" },
  price: { type: "integer", minimum: 0, maximum: 99999999 },
  vehicleTypeId: { type: "integer" },
  brandId: { type: "integer" },
  modelId: { type: "integer" },
  year: { type: "integer" },
  sellerName: { type: "string" },
  sellerPhone: { type: "string" },
  sellerLineUrl: { type: "string" },
  sellerAvatar: { type: "string", format: "binary" },
  images: {
    type: "array",
    items: { type: "string", format: "binary" },
    minItems: 1,
    maxItems: 4,
  },
  imageOrder: {
    type: "string",
    description: "Create: JSON array of file indexes, for example [0,1]. Update: JSON array of {id} or {fileIndex}.",
    example: "[0,1]",
  },
  coverIndex: { type: "integer", enum: [0] },
};

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Truck2Hand API",
    version: "1.0.0",
    description: "Used-truck marketplace API. Listing text is rejected when it contains the configured blocklist terms.",
  },
  servers: [{ url: "http://localhost:3001" }],
  tags: [
    { name: "Vehicle types" },
    { name: "Brands" },
    { name: "Models" },
    { name: "Products" },
  ],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": { description: "Server is running and SQLite is in WAL mode" },
        },
      },
    },
    "/api/vehicle-types": {
      get: {
        tags: ["Vehicle types"],
        summary: "List vehicle types",
        responses: {
          "200": {
            description: "Vehicle types ordered by name",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: { data: { type: "array", items: vehicleTypeSchema } },
                },
              },
            },
          },
        },
      },
    },
    "/api/brands": {
      get: {
        tags: ["Brands"],
        summary: "List brands",
        responses: {
          "200": {
            description: "Brands ordered by name",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: { data: { type: "array", items: brandSchema } },
                },
              },
            },
          },
        },
      },
    },
    "/api/models": {
      get: {
        tags: ["Models"],
        summary: "List models for a brand",
        parameters: [
          {
            name: "brandId",
            in: "query",
            required: true,
            schema: { type: "integer", minimum: 1 },
          },
        ],
        responses: {
          "200": {
            description: "Models for the brand, ordered by name. Unknown brands return an empty list.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: { data: { type: "array", items: modelSchema } },
                },
              },
            },
          },
          "400": {
            description: "brandId is missing or not a positive integer",
            content: { "application/json": { schema: errorSchema } },
          },
        },
      },
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "List products",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, default: 10 } },
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: ["newest", "oldest", "views", "price", "price_desc"],
              default: "newest",
            },
          },
          { name: "vehicleTypeId", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "brandId", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "modelId", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "minPrice", in: "query", schema: { type: "integer" } },
          { name: "maxPrice", in: "query", schema: { type: "integer" } },
          { name: "minYear", in: "query", schema: { type: "integer" } },
          { name: "maxYear", in: "query", schema: { type: "integer" } },
        ],
        responses: {
          "200": {
            description: "Matching products. Filters are combined with AND.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data", "meta"],
                  properties: {
                    data: { type: "array", items: productSchema },
                    meta: {
                      type: "object",
                      required: ["page", "pageSize", "total"],
                      properties: {
                        page: { type: "integer" },
                        pageSize: { type: "integer" },
                        total: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Invalid query",
            content: { "application/json": { schema: errorSchema } },
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create a product",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "price", "images", "imageOrder", "coverIndex"],
                properties: productFormProperties,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Created product. images[0] is the cover and viewCount is 0.",
            content: { "application/json": { schema: productSchema } },
          },
          "400": {
            description: "Validation failed",
            content: { "application/json": { schema: errorSchema } },
          },
          "409": {
            description: "Product name already exists",
            content: { "application/json": { schema: errorSchema } },
          },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get a product and increment viewCount",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          "200": {
            description: "Product after viewCount is incremented",
            content: { "application/json": { schema: productSchema } },
          },
          "404": {
            description: "Product not found",
            content: { "application/json": { schema: errorSchema } },
          },
        },
      },
      put: {
        tags: ["Products"],
        summary: "Replace a product",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name", "price", "imageOrder", "coverIndex"],
                properties: {
                  ...productFormProperties,
                  imageOrder: {
                    type: "string",
                    description: 'JSON array of {"id": number} for kept images or {"fileIndex": number} for new files.',
                    example: '[{"id":1},{"fileIndex":0}]',
                  },
                  sellerAvatar: {
                    type: "string",
                    description: "New .png or .jpg file replaces the avatar. Send an empty value to clear it. Omit the field to keep it.",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Updated product. The first imageOrder entry is stored at sortOrder 0.",
            content: { "application/json": { schema: productSchema } },
          },
          "400": {
            description: "Validation failed",
            content: { "application/json": { schema: errorSchema } },
          },
          "404": {
            description: "Product not found",
            content: { "application/json": { schema: errorSchema } },
          },
          "409": {
            description: "Product name already exists on another listing",
            content: { "application/json": { schema: errorSchema } },
          },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete a product, its images, and its avatar file",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer", minimum: 1 } }],
        responses: {
          "204": { description: "Deleted" },
          "404": {
            description: "Product not found",
            content: { "application/json": { schema: errorSchema } },
          },
        },
      },
    },
  },
};
