const db = require("../config/db");

exports.addToCart = async (req, res) => {
    try {
        const { user_id, product_id, color_id, quantity } = req.body;

        const [existing] = await db.query(
            "SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND color_id = ?",
            [user_id, product_id, color_id || null]
        );

    
        const [product] = await db.query("SELECT new_price FROM products WHERE id = ?", [product_id]);
        if (product.length === 0) return res.status(400).json({ success: false, message: "Product not found" });

        const price = product[0].new_price;
        const total_price = price * quantity;

        if (existing.length > 0) {
        
            const newQty = existing[0].quantity + quantity;
            const newTotal = price * newQty;
            await db.query("UPDATE cart SET quantity = ?, total_price = ? WHERE id = ?", [newQty, newTotal, existing[0].id]);
            return res.status(200).json({ success: true, message: "Cart updated" });
        }

    
        await db.query(
            "INSERT INTO cart (user_id, product_id, color_id, quantity, price, total_price) VALUES (?, ?, ?, ?, ?, ?)",
            [user_id, product_id, color_id || null, quantity, price, total_price]
        );

        res.status(200).json({ success: true, message: "Added to cart" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Cart insert error" });
    }
};


exports.getCart = async (req, res) => {
    try {
        const userId = req.params.user_id;

        const sql = `
            SELECT 
                c.id AS cart_id,
                p.id AS product_id,
                p.name,
                p.image,
                p.new_price,
                p.old_price,
                p.rating,
                c.quantity,
                c.color_id,
                pc.color_name AS color_name,   -- FIXED
                c.price,
                c.total_price,
                (SELECT COUNT(*) FROM product_reviews pr WHERE pr.product_id = p.id) AS reviews_count
            FROM cart c
            JOIN products p ON p.id = c.product_id
            LEFT JOIN product_colors pc ON pc.id = c.color_id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `;

        const [result] = await db.query(sql, [userId]);
        res.status(200).json({ success: true, cart: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Cart fetch error" });
    }
};



exports.updateCartQuantity = async (req, res) => {
    try {
        const { cart_id, quantity } = req.body;

        const [item] = await db.query("SELECT price FROM cart WHERE id = ?", [cart_id]);
        if (item.length === 0) return res.status(404).json({ success: false, message: "Cart item not found" });

        const total_price = item[0].price * quantity;

        await db.query("UPDATE cart SET quantity = ?, total_price = ? WHERE id = ?", [quantity, total_price, cart_id]);
        res.status(200).json({ success: true, message: "Cart updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Cart update error" });
    }
};


exports.removeFromCart = async (req, res) => {
    try {
        const cartId = req.params.cart_id;
        await db.query("DELETE FROM cart WHERE id = ?", [cartId]);
        res.status(200).json({ success: true, message: "Removed from cart" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Cart remove error" });
    }
};
