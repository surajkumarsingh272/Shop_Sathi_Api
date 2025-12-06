const db = require("../config/db");

exports.getMyProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone, profile_image FROM users WHERE id = ?",
      [req.user.id]
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    let imagePath = null;
    if (req.file) {
      imagePath = "uploads/" + req.file.filename;
    }

    await db.query(
      `UPDATE users 
       SET name = ?, 
           email = ?, 
           phone = ?, 
           profile_image = COALESCE(?, profile_image)
       WHERE id = ?`,
      [name, email, phone, imagePath, req.user.id]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      image: imagePath
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};