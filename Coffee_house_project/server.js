// npm install express sqlite3
// npm install sequelize
//This section initializes the Sequelize instance, defines the Coffee,
// Customer, Order, and OrderDetail models, establishes associations,
// and synchronizes with the database.

const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(express.json());
const port = 8080;

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.db',
    logging: false,
});

const Coffee = sequelize.define('Coffee', {
    CoffeeID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    CoffeeName: {
        type: DataTypes.TEXT,
        unique: true,
    },
    Price: {
        type: DataTypes.REAL,
        validate: {
            min: 0,
        },
    },
}, {
    timestamps: false,
});

const Customer = sequelize.define('Customer', {
    CustomerID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    FirstName: {
        type: DataTypes.TEXT,
    },
    LastName: {
        type: DataTypes.TEXT,
    },
    Email: {
        type: DataTypes.TEXT,
    },
    Phone: {
        type: DataTypes.TEXT,
        unique: true,
    },
}, {
    timestamps: false,
});

const Order = sequelize.define('Order', {
    OrderID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    CustomerID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    OrderDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    TotalAmount: {
        type: DataTypes.REAL,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
}, {
    timestamps: false,
});

const OrderDetail = sequelize.define('OrderDetail', {
    OrderDetailID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    OrderID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    CoffeeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    Quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    Subtotal: {
        type: DataTypes.REAL,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
}, {
    timestamps: false,
});

Order.hasMany(OrderDetail, { foreignKey: 'OrderID', as: 'OrderDetails' });
OrderDetail.belongsTo(Order, { foreignKey: 'OrderID' });

sequelize.sync({ force: false })
    .then(() => {
        console.log('Database and tables synced');
    })
    .catch((error) => {
        console.error('Error syncing database:', error);
    });


    // API Endpoints for Retrieving Data:
    // Root route
app.get('/', (req, res) => {
    res.send('Welcome to Coffee Shop API!');
});

// Coffee API endpoints
//These routes handle the retrieval of coffee, customer, order, and order detail data.
app.get('/coffees', async (req, res) => {
    const coffeeName = req.query.name;
    const coffeeID = req.query.id;

    try {
        let coffees;

        if (coffeeID) {
            coffees = await Coffee.findByPk(coffeeID);
        } else if (coffeeName) {
            coffees = await Coffee.findAll({
                where: {
                    CoffeeName: {
                        [Sequelize.Op.like]: `%${coffeeName}%`,
                    },
                },
            });
        } else {
            coffees = await Coffee.findAll();
        }

        res.json(coffees);
    } catch (error) {
        console.error('Error fetching coffees:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/customers', async (req, res) => {
    const customerName = req.query.name;

    try {
        if (!customerName) {
            const customers = await Customer.findAll();
            res.json(customers);
        } else {
            const customers = await Customer.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { FirstName: customerName },
                        { LastName: customerName },
                    ],
                },
            });
            res.json(customers);
        }
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/orders', async (req, res) => {
    try {
        let whereCondition = {};

        if (req.query.date) {
            whereCondition.OrderDate = req.query.date;
        }

        const orders = await Order.findAll({
            where: whereCondition,
            include: { model: OrderDetail, as: 'OrderDetails' },
        });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/orderdetails', async (req, res) => {
    try {
        let whereCondition = {};

        if (req.query.coffeeID) {
            whereCondition.CoffeeID = req.query.coffeeID;
        }

        const orderDetails = await OrderDetail.findAll({
            where: whereCondition,
            include: { model: Order },
        });

        res.json(orderDetails);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




//API Endpoints for Creating Data:
// These routes handle the creation of coffee, customer, order, and order detail data.
app.post('/coffees', async (req, res) => {
    try {
        const { CoffeeName, Price } = req.body;

        const newCoffee = await Coffee.create({
            CoffeeName,
            Price,
        });

        const coffees = await Coffee.findAll();

        res.status(201).json({
            message: 'Coffee created successfully',
            coffees,
        });
    } catch (error) {
        console.error('Error creating coffee:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/customers', async (req, res) => {
    try {
        const { FirstName, LastName, Email, Phone } = req.body;

        const newCustomer = await Customer.create({
            FirstName,
            LastName,
            Email,
            Phone,
        });

        const customers = await Customer.findAll();

        res.status(201).json({
            message: 'Customer created successfully',
            customers,
        });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/orders', async (req, res) => {
    try {
        const { CustomerID, OrderDate, TotalAmount, OrderDetails } = req.body;

        if (!CustomerID || !OrderDate || !TotalAmount) {
            return res.status(400).json({ error: 'Invalid input. Make sure CustomerID, OrderDate, and TotalAmount are provided.' });
        }

        const newOrder = await Order.create({
            CustomerID,
            OrderDate,
            TotalAmount,
        });

        if (OrderDetails && OrderDetails.length > 0) {
            await OrderDetail.bulkCreate(OrderDetails.map(detail => ({
                OrderID: newOrder.OrderID,
                CoffeeID: detail.CoffeeID,
                Quantity: detail.Quantity,
                Subtotal: detail.Subtotal,
            })));
        }

        const orderWithDetails = await Order.findByPk(newOrder.OrderID, {
            include: OrderDetail,
        });

        res.status(201).json({
            message: 'Order created successfully',
            order: orderWithDetails,
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/orderdetails', async (req, res) => {
    try {
        const { OrderID, CoffeeID, Quantity, Subtotal } = req.body;

        if (!OrderID || !CoffeeID || !Quantity || !Subtotal) {
            return res.status(400).json({ error: 'Invalid input. Make sure OrderID, CoffeeID, Quantity, and Subtotal are provided.' });
        }

        const newOrderDetail = await OrderDetail.create({
            OrderID,
            CoffeeID,
            Quantity,
            Subtotal,
        });

        res.status(201).json({
            message: 'Order detail created successfully',
            orderDetail: newOrderDetail,
        });
    } catch (error) {
        console.error('Error creating order detail:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// API Endpoint for Updating Data:
app.put('/coffees/:id', async (req, res) => {
    try {
        const CoffeeID = req.params.id;
        const { CoffeeName } = req.body;

        const coffee = await Coffee.findByPk(CoffeeID);

        if (!coffee) {
            return res.status(404).json({ error: 'Coffee not found' });
        }

        coffee.CoffeeName = CoffeeName;

        await coffee.save();

        res.json({
            message: 'Coffee updated successfully',
            coffee,
        });
    } catch (error) {
        console.error('Error updating coffee:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// command to run 
// node server.js
// sqlite3 database.db
// .table
// SELECT * FROM Coffees;
// SELECT * FROM Customers;
// SELECT * FROM OrderDetails;
// SELECT * FROM Orders;
// .exit

// API Endpoints for Retrieving Data:
// Root route: http://localhost:8080/
// Coffee: http://localhost:8080/coffees
// Search by name: http://localhost:8080/coffees?name=Espresso
// Customers: http://localhost:8080/customers
// Search by name: http://localhost:8080/customers?name=Maria
// Orders: http://localhost:8080/orders
// Search by date: http://localhost:8080/orders?date=2023-12-01
// Order Details: http://localhost:8080/orderdetails
// Search by coffee ID: http://localhost:8080/orderdetails?coffeeID=1


// API Endpoints for Adding Data:
// Coffee: POST http://localhost:8080/coffees
// Customers: POST http://localhost:8080/customers
// Orders: POST http://localhost:8080/orders
// Order Details: POST http://localhost:8080/orderdetails

// API Endpoint for Updating Data:
// Coffee: PUT http://localhost:8080/coffees?id=2
// Update CoffeeName and check: http://localhost:8080/coffees?id=2

