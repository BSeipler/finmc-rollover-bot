require('dotenv').config()

const express = require('express')
const cors = require('cors')
const offerRoute = require('./routes/offer.js')

const app = express()

// middleware
app.use(cors())
app.use(express.json())


// routes
app.use('/api/v1/offers', offerRoute)

// server
const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
