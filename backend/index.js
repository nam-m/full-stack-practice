// const http = require('http')
require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/note')

const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to url')

mongoose.connect(url)

  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })
  
app.use(express.static('dist'))
app.use(cors())
app.use(express.json())

let notes = [  
  {    id: 1,    content: "HTML is easy",    important: true  },  
  {    id: 2,    content: "Browser can execute only JavaScript",    important: false  },  
  {    id: 3,    content: "GET and POST are the most important methods of HTTP protocol",    important: true  }
]

// const app = http.createServer((request, response) => {
//   response.writeHead(200, { 'Content-Type': 'application/json' })
//   response.end(JSON.stringify(notes))
// })

//Define event handler to handle HTTP GET requests made to application's root
app.get('/', (request, response) => {
  response.send('<h1>Hello World</h1>')
})

//Define event handler to handle HTTP GET requests made to the notes
app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id).then(note => {
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response) => {
  Note.findByIdAndDelete(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))

  response.status(204).end()
})

app.post('/api/notes', (request, response, next) => {
  const body = request.body
  
  const note = new Note ({
    content: body.content,
    important: body.important || false
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
  .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  const {content, important} = request.body

  Note.findByIdAndUpdate(
    request.params.id, 
    {content, important}, 
    { new: true, returnDocument: true, context: 'query'}
    )
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name == 'ValidationError') {
    return response.status(400).json({error: error.message})
  }
  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})