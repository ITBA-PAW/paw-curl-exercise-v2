const express = require('express')
const bodyParser = require('body-parser')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const app = express()
const port = process.env.PORT || 3000

const groupsQty = 9
const styles = new Array(groupsQty).fill("")

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())

app.use((req, res, next) => {
  console.log(`${req.method} @ ${req.path}`)
  next()
})

app.get('/', (req, res) => {
    res.json('Hello paw student! We expect students to POST their styles at /styles')
})

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post('/styles', (req, res) => {
  if (!req.body) {
    res.status(400)
    return res.json({
      error: 'Missing body. Try with \{"group": 1, "style": "..."\}'
    })
  }
  if (!req.body.group || isNaN(req.body.group) || req.body.group < 1 || req.body.group > groupsQty) {
    res.status(400)
    return res.json({
      error: 'Missing or invalid group.'
    })
  }
  if (!req.body.style) {
      res.status(400)
      return res.json({
      error: 'Missing style.'
      })
  }

  styles[req.body.group - 1] = req.body.style
  res.status(201)
  return res.json({ style: req.body.style, group: req.body.group })
})

app.get('/styles', (req, res, next) => {
  res.status(201)
  const body = styles.map((style, index) => {
      return {group: index + 1, style: style ?? ""}
  })
  return res.json(body)
})

app.get('/styles/:group', (req, res) => {
    const group = parseInt(req.params.group)
    if (isNaN(group) || group < 1 || group > groupsQty) {
        res.status(400)
        return res.json({ error: 'Invalid group' })
    }
    const style = styles[group-1] ?? ""
    res.json({ style: style, group })
})

app.use((req, res) => {
  res.status(404)
  res.json({ message: 'Nothing here!' })
})

app.listen(port, () => {
  console.log(`PAW CURL exercise listening at port: ${port}.`)
  console.log('We expect students to POST their styles at /styles')
})
