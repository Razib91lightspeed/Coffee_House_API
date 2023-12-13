# Coffee House API Management

**Author:** Razib Hasan
**Location:** Tampere, Finland 🇫🇮

## Project Description
The "Api Development Final Project" is a Node.js and Express-based API for managing a coffee shop's data, including information about coffees, customers, orders, and order details. It utilizes the Sequelize ORM (Object-Relational Mapping) for interacting with an SQLite database. The API supports various CRUD (Create, Read, Update, Delete) operations, and error handling is implemented to ensure robustness.

### Features

#### Coffee Management:
- Create, read, update coffee information.
- Search for coffees by name or ID.

#### Customer Management:
- Create, read customer information.
- Search for customers by name.

#### Order Management:
- Create, read order information.
- Search for orders by date.

#### Order Detail Management:
- Create, read order detail information.
- Search for order details by coffee ID.

#### Error Handling:
- Demonstrates error handling for invalid input, non-existent resources, and other potential issues.

## Instructions to Setup and Run

### Setup Instructions

#### Install Dependencies:

```
npm install express sqlite3 sequelize
```

#### Start Programme

```
node server.js
```

#### Run and Test by Doing CRUD Operation and Error Handeling

#### Create(Post Requests):


Create a new coffee
```
curl -X POST -H "Content-Type: application/json" -d '{"CoffeeName":"special Coffee", "Price": 2.5}' http://localhost:8080/coffees
```


Create a new customer
```
curl -X POST -H "Content-Type: application/json" -d '{"FirstName":"John", "LastName": "Doe", "Email": "john@example.com", "Phone": "1234567890"}' http://localhost:8080/customers
```

Create a new order
```
curl -X POST -H "Content-Type: application/json" -d '{"CustomerID": 1, "OrderDate": "2023-12-01", "TotalAmount": 10, "OrderDetails": [{"CoffeeID": 1, "Quantity": 2, "Subtotal": 5}]}' http://localhost:8080/orders
```


Create a new order detail
```
curl -X POST -H "Content-Type: application/json" -d '{"OrderID": 1, "CoffeeID": 2, "Quantity": 1, "Subtotal": 3}' http://localhost:8080/orderdetails
```


#### Read (http get): 


Coffee endpoint:

Get all coffees
```
curl http://localhost:8080/coffees
```
Search by name
```
curl http://localhost:8080/coffees?name=Espresso
```
Search by ID
```
curl http://localhost:8080/coffees?id=1
```


Get all customers
```
curl http://localhost:8080/customers
```
Search by name
```
curl http://localhost:8080/customers?name=Maria
```


Get all orders
```
curl http://localhost:8080/orders
```
Search by date
```
curl http://localhost:8080/orders?date=2023-12-01
```


Get all order details
```
curl http://localhost:8080/orderdetails
```
Search by coffee ID
```
curl http://localhost:8080/orderdetails?coffeeID=1
```



#### Update(http put):

Update Coffee with ID 2
```
curl -X PUT -H "Content-Type: application/json" -d '{"CoffeeName":"UpdatedCoffee"}' http://localhost:8080/coffees/2
```

#### Error Handling:
 Update CoffeeName with invalid data (simulating an error)
 ```
curl -X PUT -H "Content-Type: application/json" -d '{"CoffeeName": "UpdatedCoffee"}' http://localhost:8080/coffees/999
```

