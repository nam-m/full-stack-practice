const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const supertest = require('supertest')
const Note = require('../models/note')
const app = require('../app')

const api = supertest(app)

describe('when there are some notes saved', () => {

  beforeEach(async () => {
    await Note.deleteMany({})
    const noteObjects = helper.initialNotes.map(note => new Note(note))
    const promiseArray = noteObjects.map(note => note.save())
    // All note objects are resolved with save() in parallel in Promise.all
    await Promise.all(promiseArray)
  })

  test('notes are returned as json', async () => {
    console.log('entered test')
    await api
      .get('/api/notes')
      .expect('Content-Type', /application\/json/)
      .expect(200)
  })

  test('all notes are returned', async () => {
    const response = await api.get('/api/notes')
    assert.strictEqual(response.body.length, helper.initialNotes.length)
  })

  test('there are two notes', async () => {
    const response = await api.get('/api/notes')
    assert.strictEqual(response.body.length, 2)
  })

  test('the first note is about HTTP methods', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map(e => e.content)
    assert(contents.includes('HTML is easy'), true)
  })

  describe('viewing a specific note', () => {

    test('succeeds with valid id', async () => {
      const notesAtStart = await helper.notesInDb()
      const noteToView = notesAtStart[0]
      const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.deepStrictEqual(resultNote.body, noteToView)
    })

    test('fails with code 404 if note does not exist', async () => {
      const validNonExistingId = await helper.nonExistingId()
      await api
        .get(`/api/notes/${validNonExistingId}`)
        .expect(404)
    })

    test('fails with code 400 if id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'
      await api
        .get(`/api/notes/${invalidId}`)
        .expect(400)
    })
  })

  describe('addition of a new note', () => {
    test('succeeds with valid data', async () => {
      const newNote = {
        content: 'async/await simplifies making async calls',
        important: true,
      }

      await api
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const notesAtEnd = await helper.notesInDb()
      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)

      const contents = notesAtEnd.map(n => n.content)
      assert(contents.includes('async/await simplifies making async calls'))
    })

    test('fails with code 400 with invalid data', async () => {
      const newNote = {
        important: true
      }

      await api
        .post('/api/notes')
        .send(newNote)
        .expect(400)

      const notesAtEnd = await helper.notesInDb()
      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
    })
  })

  describe('deletion of a note', () => {

    test('succeeds with code 204 if id is valid', async () => {
      const notesAtStart = await helper.notesInDb()
      const noteToDelete = notesAtStart[0]

      await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .expect(204)

      const notesAtEnd = await helper.notesInDb()

      const contents = notesAtEnd.map(r => r.content)
      assert(!contents.includes(noteToDelete.content))

      assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})