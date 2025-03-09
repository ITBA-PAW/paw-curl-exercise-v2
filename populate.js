const postgres = require("postgres");
require('dotenv').config()

const groupsQty = process.env.GROUPS_QTY
const sql = postgres(process.env.DB_URL)

const populate = async () => {
  for (let i = 1; i <= groupsQty; i++) {
    const result = await sql`
      INSERT INTO styles (group_number, style)
      VALUES (${i}, ${""})
      ON CONFLICT (group_number)
      DO NOTHING RETURNING *`
    console.log(result.length > 0 ? `Group ${result[0].group_number} populated` : `Group ${i} already exists`)
  }
}

populate()
  .then(r => console.log("Done"))
  .catch(e => console.error(e))
