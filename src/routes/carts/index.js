const express = require("express")
const db = require("../../db")

const cartRoutes = express.Router()

cartRoutes.post("/", async (req, res)=>{
    const response = await db.query("INSERT INTO shoppingcarts (productid, userid) VALUES ($1, $2) RETURNING _id",
                                [ req.body.productid, req.body.userid])

    res.send(response.rows[0])
})

cartRoutes.get("/:userId", async (req, res) => {
    const response = await db.query(`SELECT productid, product_name, brand, description, imageurl, category, price as unitary_price, COUNT(*) As quantity, COUNT(*) * price as total
    FROM shoppingcarts JOIN "products" ON shoppingcarts.productid = "products"._id
    WHERE userid =$1
    GROUP BY productid, 
    product_name, brand, description, imageurl, category, price
                                     `, [ req.params.userId])

    res.send(response.rows)
})

cartRoutes.delete("/:userId/:productid", async (req, res) =>{
    

    const response = await db.query(`DELETE FROM shoppingcarts where _id IN
                                     (SELECT _id FROM shoppingcarts 
                                      WHERE productid = $1 AND userid = $2
                                      LIMIT 1)`,
                                      [ req.params.productid, req.params.userId])
    
    if (response.rowCount === 0)
        return res.status(404).send("Not found")
    
    res.send("DELETED")
})


module.exports = cartRoutes;