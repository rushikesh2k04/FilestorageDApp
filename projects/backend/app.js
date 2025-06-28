const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const fileRoutes = require('./routes/fileRoutes')
const { syncDatabase } = require('./models')

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/files', fileRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, async () => {
  await syncDatabase()
  console.log(`🚀 Server running at http://localhost:${PORT}`)
})
