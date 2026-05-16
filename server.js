require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

/* MIDDLEWARE */

app.use(cors());

app.use(express.json());

app.use(express.static(__dirname));

/* DATABASE CONNECTION */

const db = mysql.createPool({

    host: process.env.MYSQLHOST,

    user: process.env.MYSQLUSER,

    password: process.env.MYSQLPASSWORD,

    database: process.env.MYSQLDATABASE,

    port: process.env.MYSQLPORT,

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0
});




/* SAVE ORDER */

app.post("/orders", (req, res) => {

    const {

        customerName,

        phone,

        orderType,

        address,

        street,

        location,

        paymentMethod,

        paymentStatus,

        items,

        total

    } = req.body;

    const sql = `

    INSERT INTO orders (

        customer_name,

        phone,

        order_type,

        address,

        street,

        payment,

        location,

        items,

        total,

        status

    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    `;

    /* CONVERT ITEMS */

    const itemsData =

    typeof items === "string"

    ? items

    : JSON.stringify(items);

    const values = [

        customerName,

        phone,

        orderType,

        address || "N/A",

        street || "N/A",

        paymentMethod,

        location || "N/A",

        itemsData,

        total,

        paymentStatus || "Pending"
    ];

    db.query(sql, values, (err, result) => {

        if(err){

            console.error(
                "Database Error:",
                err
            );

            return res.status(500).json({

                success: false,

                error: err.message
            });
        }

        res.json({

            success: true,

            id: result.insertId
        });
    });
});

/* GET ALL ORDERS */

app.get("/orders", (req, res) => {

    db.query(

        "SELECT * FROM orders ORDER BY id DESC",

        (err, results) => {

            if(err){

                return res.status(500)
                .json(err);
            }

            res.json(results);
        }
    );
});

/* GET SINGLE ORDER */

app.get("/orders/:id", (req, res) => {

    const orderId = req.params.id;

    db.query(

        "SELECT * FROM orders WHERE id = ?",

        [orderId],

        (err, results) => {

            if(err){

                return res.status(500)
                .json(err);
            }

            if(results.length > 0){

                res.json(results[0]);

            } else {

                res.status(404).json({

                    success: false
                });
            }
        }
    );
});

/* UPDATE ORDER STATUS */

app.put("/orders/:id", (req, res) => {

    const { status } = req.body;

    db.query(

        "UPDATE orders SET status=? WHERE id=?",

        [status, req.params.id],

        (err, result) => {

            if(err){

                return res.status(500)
                .json(err);
            }

            res.json({

                success: true
            });
        }
    );
});

/* STAFF LOGIN */

app.post("/login", (req, res) => {

    const {

        username,

        password,

        role

    } = req.body;

    const sql = `

    SELECT * FROM admins

    WHERE
    username = ?
    AND password = ?
    AND role = ?

    `;

    db.query(

        sql,

        [

            username,

            password,

            role

        ],

        (err, results) => {

            if(err){

                console.log(err);

                return res.status(500).json({

                    success: false
                });
            }

            /* LOGIN SUCCESS */

            if(results.length > 0){

                res.json({

                    success: true,

                    role: results[0].role
                });
            }

            /* LOGIN FAILED */

            else {

                res.json({

                    success: false
                });
            }
        }
    );
});

/* SERVER */

const PORT =
process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(

        `Server Running On Port ${PORT}`
    );
});