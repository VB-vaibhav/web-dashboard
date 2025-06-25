// 📁 backend/utils/userFieldUtils.js
const db = require('../config/db');

// Map of static columns per page
const STATIC_COLUMNS_MAP = {
  serviceAccess: [
    'id', 'name', 'role', 'is_vps', 'is_cerberus', 'is_proxy', 'is_storage', 'is_varys'
  ],
  panelAccess: [
    'id', 'name', 'role', 'is_notification', 'is_mail', 'is_reports', 'is_settings'
  ],

  manageRole: [
    'id', 'name', 'username', 'email', 'role'
  ],

  userManagement: ['id', 'name', 'username', 'role'], 
  
  clients: [
    'id', 'name', 'email', 'phone', 'middleman_id', 'service', 'plan', 'start_date', 'expiry_date'
  ],
  reports: [
    'id', 'name', 'revenue', 'paid_to', 'status'
  ],
  excludeClients: [
    'id', 'client_name', 'service', 'expiry_date'
  ],

};

async function getUserFieldsForPage(pageKey) {
  const staticCols = STATIC_COLUMNS_MAP[pageKey] || [];

  try {
    // ✅ Fetch custom fields only linked to the requested page
    const [rows] = await db.promise().query(`
      SELECT column_name FROM custom_user_fields WHERE page_key = ?
    `, [pageKey]);

    const customCols = rows.map(row => row.column_name);
    return staticCols.concat(customCols);
  } catch (err) {
    console.error(`Error getting user fields for ${pageKey}:`, err);
    return staticCols; // fallback to static only
  }
}


// async function getUserFieldsForPage(pageKey) {
//   const staticCols = STATIC_COLUMNS_MAP[pageKey] || [];

//   try {
//     const [rows] = await db.promise().query(`
//       SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
//       WHERE TABLE_SCHEMA = ?
//         AND TABLE_NAME = 'users'
//         AND COLUMN_NAME LIKE 'custom_%'
//     `, [process.env.DB_NAME]);

//     const customCols = rows.map(row => row.COLUMN_NAME);
//     return staticCols.concat(customCols);
//   } catch (err) {
//     console.error(`Error getting user fields for ${pageKey}:`, err);
//     return staticCols; // fallback to static only
//   }
// }

module.exports = { getUserFieldsForPage };
