const db = require("../config/db");

exports.addAddress = async (req, res) => {
  const { user_id,name, mobile, pincode, state, city, house_no,  road_name, address_type,is_default} = req.body;

  if (!user_id || !name || !mobile || !pincode) {
    return res.json({ success: false, message: "All fields required" });
  }

  try {
    if (is_default == 1) {
      await db.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [user_id,]);
    }

    const sql = `INSERT INTO addresses (user_id, name, mobile, pincode, state, city, house_no, road_name, address_type, is_default)  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await db.query(sql, [user_id,  name,  mobile, pincode,state, city, house_no, road_name,address_type, is_default ]);

    res.json({
      success: true,
      message: "Address added successfully (VALUES)",
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

// ➤ Get All Addresses
exports.getAddresses = async (req, res) => {
  const { user_id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC",
      [user_id]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

// ➤ Get Single Address
exports.getSingleAddress = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query("SELECT * FROM addresses WHERE id = ?", [id]);

    if (!rows.length)
      return res.json({ success: false, message: "Address not found" });

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

// ➤ Update Address (NO SET ?)
exports.updateAddress = async (req, res) => {
  const { id } = req.params;
  const {
    user_id,
    name,
    mobile,
    pincode,
    state,
    city,
    house_no,
    road_name,
    address_type,
    is_default
  } = req.body;

  try {
    // If is default
    if (is_default == 1) {
      await db.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [
        user_id,
      ]);
    }

    const sql = `
      UPDATE addresses 
      SET name=?, mobile=?, pincode=?, state=?, city=?, house_no=?, road_name=?, address_type=?, is_default=? 
      WHERE id=?
    `;

    await db.query(sql, [
      name,
      mobile,
      pincode,
      state,
      city,
      house_no,
      road_name,
      address_type,
      is_default,
      id,
    ]);

    res.json({
      success: true,
      message: "Address updated successfully (VALUES)",
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

// ➤ Delete Address
exports.deleteAddress = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM addresses WHERE id = ?", [id]);

    res.json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};

// ➤ Set Default Address (NO SET ?)
exports.setDefaultAddress = async (req, res) => {
  const { id, user_id } = req.body;

  try {
    // Remove default from other addresses
    await db.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [
      user_id,
    ]);

    // Set selected one as default
    await db.query("UPDATE addresses SET is_default = 1 WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Default address updated (VALUES)",
    });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
};
