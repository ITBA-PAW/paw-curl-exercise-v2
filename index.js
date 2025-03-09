require('dotenv').config()

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const postgres = require('postgres')
const status = require('http-status-codes')

const app = express()
const port = process.env.PORT || 3000
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css"
const options = {
    customCss:
        '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL,
};

const groupsQty = process.env.GROUPS_QTY
const sql = postgres(process.env.DB_URL)

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())

app.use(cors())

app.use((req, res, next) => {
  console.log(`${req.method} @ ${req.path}`)
  next()
})

app.get('/', (req, res) => {
    res.json('Hello paw student! We expect students to POST their styles at /styles')
})

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

app.post('/styles', async (req, res) => {
  try {
    if (!req.body) {
      res.status(status.BAD_REQUEST);
      return res.json({
        error: 'Missing body. Try with {"group": 1, "style": "..."}'
      });
    }

    if (!req.body.group || isNaN(req.body.group) || req.body.group < 1 || req.body.group > groupsQty) {
      res.status(status.BAD_REQUEST);
      return res.json({
        error: 'Missing or invalid group.'
      });
    }

    if (!req.body.style) {
      res.status(status.BAD_REQUEST);
      return res.json({
        error: 'Missing style.'
      });
    }

    const group = parseInt(req.body.group);
    const style = req.body.style;
    console.log(`Group: ${group}, Style: ${style}`);

    const result = await sql`
      INSERT INTO styles (group_number, style) 
      VALUES (${group}, ${style}) 
      ON CONFLICT (group_number) 
      DO UPDATE SET style = ${style} 
      RETURNING *
    `;

    res.status(status.CREATED);
    return res.json({group: result[0].group_number, style: result[0].style });
  } catch (error) {
    console.error(error);
    res.status(status.INTERNAL_SERVER_ERROR);
    return res.json({ error: 'Internal server error' });
  }
});

app.get('/styles', async (req, res) => {
  try {
    const result = await sql`
        SELECT group_number AS "group", style
        FROM styles
        ORDER BY group_number
    `;

    res.status(status.OK);
    return res.json(result);
  } catch (error) {
    console.error(error);
    res.status(status.INTERNAL_SERVER_ERROR);
    return res.json({ error: 'Internal server error' });
  }
});

app.get('/styles/:group', async (req, res) => {
  try {
    const group = parseInt(req.params.group);

    if (isNaN(group) || group < 1 || group > groupsQty) {
      res.status(status.BAD_REQUEST);
      return res.json({ error: 'Invalid group' });
    }

    const result = await sql`
      SELECT group_number, style 
      FROM styles 
      WHERE group_number = ${group}
    `;

    if (result.length === 0) {
      res.status(status.NOT_FOUND);
      return res.json({ error: 'Group not found' });
    }

    res.status(status.OK);
    return res.json({ group: result[0].group_number, style: result[0].style });
  } catch (error) {
    console.error(error);
    res.status(status.INTERNAL_SERVER_ERROR);
    return res.json({ error: 'Internal server error' });
  }
});

app.use((req, res) => {
  res.status(status.NOT_FOUND)
  res.json({ message: 'Nothing here!' })
})

app.listen(port, () => {
  console.log(`PAW CURL exercise listening at port: ${port}.`)
  console.log('We expect students to POST their styles at /styles')
})
