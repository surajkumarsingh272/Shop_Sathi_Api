
const db = require("../config/db");

exports.getMobileDetails = async (req, res) => {
    try {
        const productId = req.params.id;
        const sql="SELECT * FROM `products` WHERE id=?";
        const [productData] = await db.query(sql,
            [productId]
        );

        if (productData.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const product = productData[0];

        const [colors] = await db.query(
            `SELECT id AS color_id, color_name, color_code 
             FROM product_colors 
             WHERE product_id = ?`,
            [productId]
        );


        const [premiumPhones] = await db.query(
            `SELECT id, name, image, new_price AS price 
             FROM products 
             WHERE rating >= 4 
             LIMIT 10`
        );

        res.status(200).json({
            success: true,
            product,
            colors,
            premium: premiumPhones
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Mobile details fetch error" });
    }
};
