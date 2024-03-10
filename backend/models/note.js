const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    minLength: 5,
    required: true
  },
  important: Boolean,
})

// Use id instead of _id
// and remove auto-generated _id and __v for each object
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    // document: the mongoose document being converted
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Note', noteSchema)