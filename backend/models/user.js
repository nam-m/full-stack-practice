const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true // this ensures the uniqueness of username
  },
  name: String,
  passwordHash: String,
  // Note ids are stored as array of ObjectIds
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      // model to use during population
      ref: 'Note'
    }
  ]
})

// Modify the object returned from the db before returning to the application
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    //password hash should not be revealed
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)
module.exports = User