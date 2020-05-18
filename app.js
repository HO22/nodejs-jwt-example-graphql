/* =======================
    LOAD THE DEPENDENCIES
==========================*/
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const graphqlHTTP = require('express-graphql')
const {schema, root} = require('./graphql/schema')

/* =======================
    LOAD THE CONFIG
==========================*/
const config = require('./config')
const port = process.env.PORT || 3000

/* =======================
    EXPRESS CONFIGURATION
==========================*/
const app = express()

// parse JSON and url-encoded query
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// print the request log on console
app.use(morgan('dev'))

// set the secret key variable for jwt
app.set('jwt-secret', config.secret)

// index page, just for testing
app.get('/', (req, res) => {
    res.send('Hello JWT')
})

// open the server
app.listen(port, () => {
    console.log(`Express is running on port ${port}`)
})

/* =======================
    CONNECT TO MONGODB SERVER
==========================*/
mongoose.connect(config.mongodbUri)
const db = mongoose.connection
db.on('error', console.error)
db.once('open', () => {
    console.log('connected to mongodb server')
})

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}))

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'))
