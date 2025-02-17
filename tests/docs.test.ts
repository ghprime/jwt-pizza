import { test, expect } from "playwright-test-coverage";
import { testUrl } from "./testUtils";

test.describe("docs page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testUrl);
  });

  test("exists", async ({ page }) => {
    await page.route(`*/**/api/docs`, async (route) => {
      expect(route.request().method()).toBe('GET');

      await route.fulfill({ 
        body: JSON.stringify({
          "version": "20240518.154317",
          "endpoints": [
              {
                  "method": "POST",
                  "path": "/api/auth",
                  "description": "Register a new user",
                  "example": "curl -X POST localhost:3000/api/auth -d '{\"name\":\"pizza diner\", \"email\":\"d@jwt.com\", \"password\":\"diner\"}' -H 'Content-Type: application/json'",
                  "response": {
                      "user": {
                          "id": 2,
                          "name": "pizza diner",
                          "email": "d@jwt.com",
                          "roles": [
                              {
                                  "role": "diner"
                              }
                          ]
                      },
                      "token": "tttttt"
                  }
              },
              {
                  "method": "PUT",
                  "path": "/api/auth",
                  "description": "Login existing user",
                  "example": "curl -X PUT localhost:3000/api/auth -d '{\"email\":\"a@jwt.com\", \"password\":\"admin\"}' -H 'Content-Type: application/json'",
                  "response": {
                      "user": {
                          "id": 1,
                          "name": "常用名字",
                          "email": "a@jwt.com",
                          "roles": [
                              {
                                  "role": "admin"
                              }
                          ]
                      },
                      "token": "tttttt"
                  }
              },
              {
                  "method": "PUT",
                  "path": "/api/auth/:userId",
                  "requiresAuth": true,
                  "description": "Update user",
                  "example": "curl -X PUT localhost:3000/api/auth/1 -d '{\"email\":\"a@jwt.com\", \"password\":\"admin\"}' -H 'Content-Type: application/json' -H 'Authorization: Bearer tttttt'",
                  "response": {
                      "id": 1,
                      "name": "常用名字",
                      "email": "a@jwt.com",
                      "roles": [
                          {
                              "role": "admin"
                          }
                      ]
                  }
              },
              {
                  "method": "DELETE",
                  "path": "/api/auth",
                  "requiresAuth": true,
                  "description": "Logout a user",
                  "example": "curl -X DELETE localhost:3000/api/auth -H 'Authorization: Bearer tttttt'",
                  "response": {
                      "message": "logout successful"
                  }
              },
              {
                  "method": "GET",
                  "path": "/api/order/menu",
                  "description": "Get the pizza menu",
                  "example": "curl localhost:3000/api/order/menu",
                  "response": [
                      {
                          "id": 1,
                          "title": "Veggie",
                          "image": "pizza1.png",
                          "price": 0.0038,
                          "description": "A garden of delight"
                      }
                  ]
              },
              {
                  "method": "PUT",
                  "path": "/api/order/menu",
                  "requiresAuth": true,
                  "description": "Add an item to the menu",
                  "example": "curl -X PUT localhost:3000/api/order/menu -H 'Content-Type: application/json' -d '{ \"title\":\"Student\", \"description\": \"No topping, no sauce, just carbs\", \"image\":\"pizza9.png\", \"price\": 0.0001 }'  -H 'Authorization: Bearer tttttt'",
                  "response": [
                      {
                          "id": 1,
                          "title": "Student",
                          "description": "No topping, no sauce, just carbs",
                          "image": "pizza9.png",
                          "price": 0.0001
                      }
                  ]
              },
              {
                  "method": "GET",
                  "path": "/api/order",
                  "requiresAuth": true,
                  "description": "Get the orders for the authenticated user",
                  "example": "curl -X GET localhost:3000/api/order  -H 'Authorization: Bearer tttttt'",
                  "response": {
                      "dinerId": 4,
                      "orders": [
                          {
                              "id": 1,
                              "franchiseId": 1,
                              "storeId": 1,
                              "date": "2024-06-05T05:14:40.000Z",
                              "items": [
                                  {
                                      "id": 1,
                                      "menuId": 1,
                                      "description": "Veggie",
                                      "price": 0.05
                                  }
                              ]
                          }
                      ],
                      "page": 1
                  }
              },
              {
                  "method": "POST",
                  "path": "/api/order",
                  "requiresAuth": true,
                  "description": "Create a order for the authenticated user",
                  "example": "curl -X POST localhost:3000/api/order -H 'Content-Type: application/json' -d '{\"franchiseId\": 1, \"storeId\":1, \"items\":[{ \"menuId\": 1, \"description\": \"Veggie\", \"price\": 0.05 }]}'  -H 'Authorization: Bearer tttttt'",
                  "response": {
                      "order": {
                          "franchiseId": 1,
                          "storeId": 1,
                          "items": [
                              {
                                  "menuId": 1,
                                  "description": "Veggie",
                                  "price": 0.05
                              }
                          ],
                          "id": 1
                      },
                      "jwt": "1111111111"
                  }
              },
              {
                  "method": "GET",
                  "path": "/api/franchise",
                  "description": "List all the franchises",
                  "example": "curl localhost:3000/api/franchise",
                  "response": [
                      {
                          "id": 1,
                          "name": "pizzaPocket",
                          "admins": [
                              {
                                  "id": 4,
                                  "name": "pizza franchisee",
                                  "email": "f@jwt.com"
                              }
                          ],
                          "stores": [
                              {
                                  "id": 1,
                                  "name": "SLC",
                                  "totalRevenue": 0
                              }
                          ]
                      }
                  ]
              },
              {
                  "method": "GET",
                  "path": "/api/franchise/:userId",
                  "requiresAuth": true,
                  "description": "List a user's franchises",
                  "example": "curl localhost:3000/api/franchise/4  -H 'Authorization: Bearer tttttt'",
                  "response": [
                      {
                          "id": 2,
                          "name": "pizzaPocket",
                          "admins": [
                              {
                                  "id": 4,
                                  "name": "pizza franchisee",
                                  "email": "f@jwt.com"
                              }
                          ],
                          "stores": [
                              {
                                  "id": 4,
                                  "name": "SLC",
                                  "totalRevenue": 0
                              }
                          ]
                      }
                  ]
              },
              {
                  "method": "POST",
                  "path": "/api/franchise",
                  "requiresAuth": true,
                  "description": "Create a new franchise",
                  "example": "curl -X POST localhost:3000/api/franchise -H 'Content-Type: application/json' -H 'Authorization: Bearer tttttt' -d '{\"name\": \"pizzaPocket\", \"admins\": [{\"email\": \"f@jwt.com\"}]}'",
                  "response": {
                      "name": "pizzaPocket",
                      "admins": [
                          {
                              "email": "f@jwt.com",
                              "id": 4,
                              "name": "pizza franchisee"
                          }
                      ],
                      "id": 1
                  }
              },
              {
                  "method": "DELETE",
                  "path": "/api/franchise/:franchiseId",
                  "requiresAuth": true,
                  "description": "Delete a franchises",
                  "example": "curl -X DELETE localhost:3000/api/franchise/1 -H 'Authorization: Bearer tttttt'",
                  "response": {
                      "message": "franchise deleted"
                  }
              },
              {
                  "method": "POST",
                  "path": "/api/franchise/:franchiseId/store",
                  "requiresAuth": true,
                  "description": "Create a new franchise store",
                  "example": "curl -X POST localhost:3000/api/franchise/1/store -H 'Content-Type: application/json' -d '{\"franchiseId\": 1, \"name\":\"SLC\"}' -H 'Authorization: Bearer tttttt'",
                  "response": {
                      "id": 1,
                      "name": "SLC",
                      "totalRevenue": 0
                  }
              },
              {
                  "method": "DELETE",
                  "path": "/api/franchise/:franchiseId/store/:storeId",
                  "requiresAuth": true,
                  "description": "Delete a store",
                  "example": "curl -X DELETE localhost:3000/api/franchise/1/store/1  -H 'Authorization: Bearer tttttt'",
                  "response": {
                      "message": "store deleted"
                  }
              }
          ],
          "config": {
              "factory": "https://pizza-factory.cs329.click",
              "db": "127.0.0.1"
          }
        }),
      });
    });

    await page.goto(`${testUrl}/docs`);

    await expect(page.getByRole('main')).toContainText('[POST] /api/auth');
  });

  test("has factory docs", async ({ page }) => {
    await page.route(`**/api/docs`, async (route) => {
      expect(route.request().method()).toBe('GET');

      await route.fulfill({ 
        body: JSON.stringify({
          "message": "welcome to JWT Pizza Factory",
          "version": "20240518.154317",
          "endpoints": [
              {
                  "method": "POST",
                  "path": "/api/order",
                  "requiresAuth": true,
                  "description": "Create a JWT pizza",
                  "example": "curl -X POST $host/api/order -H 'authorization: Bearer xyz' -d '{\"diner\":{\"id\":719,\"name\":\"j\",\"email\":\"j@jwt.com\"},\"order\":{\"items\":[{\"menuId\":1,\"description\":\"Veggie\",\"price\":0.0038}],\"storeId\":\"5\",\"franchiseId\":4,\"id\":278}}' -H 'Content-Type: application/json'",
                  "response": {
                      "jwt": "JWT here"
                  }
              },
              {
                  "method": "POST",
                  "path": "/api/order/verify",
                  "requiresAuth": true,
                  "description": "Verifies a pizza order",
                  "example": "curl -X POST $host/api/order/verify -d '{\"jwt\":\"JWT here\"}' -H 'Content-Type: application/json'",
                  "response": {
                      "message": "valid",
                      "payload": {
                          "vendor": {
                              "id": "student-netid",
                              "name": "Student Name",
                              "created": "2024-06-01T00:00:00Z",
                              "validUntil": "2025-12-31T23:59:59Z"
                          },
                          "diner": {
                              "name": "joe"
                          },
                          "order": {
                              "pizzas": [
                                  "pep",
                                  "cheese"
                              ]
                          }
                      }
                  }
              },
              {
                  "method": "GET",
                  "path": "/.well-known/jwks.json",
                  "requiresAuth": false,
                  "description": "Get the JSON Web Key Set (JWKS) for independent JWT verification",
                  "example": "curl -X POST $host/.well-known/jwks.json",
                  "response": {
                      "keys": [
                          {
                              "kty": "RSA",
                              "kid": "KID here",
                              "n": "Key value here",
                              "e": "AQAB"
                          }
                      ]
                  }
              },
              {
                  "method": "POST",
                  "path": "/api/vendor",
                  "requiresAuth": true,
                  "description": "Add a new vendor",
                  "example": "curl -X POST $host/api/admin/vendor -H 'authorization: Bearer abcxyz' -H 'Content-Type:application/json' -d '{\"id\":\"byustudent27\", \"name\":\"cs student\"}'",
                  "response": {
                      "apiKey": "abcxyz",
                      "vendor": {
                          "id": "byustudent27",
                          "name": "cs student",
                          "created": "2024-06-14T16:43:23.754Z",
                          "validUntil": "2024-12-14T16:43:23.754Z"
                      }
                  }
              },
              {
                  "method": "PUT",
                  "path": "/api/vendor/:vendorToken",
                  "requiresAuth": true,
                  "description": "Updates a vendor. Only supply the changed fields. Use null to remove a field.",
                  "example": "curl -X POST $host/api/admin/vendor/111111 -H 'authorization: Bearer abcxyz' -H 'Content-Type:application/json' -d '{\"chaos\":{\"type\":\"throttle\"}}'",
                  "response": {
                      "vendor": {
                          "id": "byustudent27",
                          "name": "cs student",
                          "website": "pizza.byucsstudent.click",
                          "chaos": "fail"
                      }
                  }
              },
              {
                  "method": "GET",
                  "path": "/api/support/:vendorToken/report/:fixCode",
                  "requiresAuth": false,
                  "description": "Report a problem",
                  "example": "curl -X POST $host/api/support/abcxyz/report/123",
                  "response": {
                      "message": "ticket status"
                  }
              }
          ]
        }),
      });
    });

    await page.goto(`${testUrl}/docs/factory`);

    await expect(page.getByRole('main')).toContainText('Create a JWT pizza');
  });
});
