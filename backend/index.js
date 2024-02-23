// const http = require('http')
require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/note')

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

app.get('/api/notes/:id', (request, response) => {
  Note.findById(request.params.id).then(note => {
    response.json(note)
  })
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (body.content === undefined) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }
  
  const note = new Note ({
    content: body.content,
    important: body.important || false
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})