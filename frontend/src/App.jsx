import { useState, useEffect } from 'react'
import Note from './components/Note'
import noteService from './services/notes'
import Notification from './components/Notification'
import loginService from './services/login'
import logoutService from './services/logout'
import LoginForm from './components/LoginForm'
import Togglable from './components/Togglable'
import NoteForm from './components/NoteForm'

const App = () => {
  const [notes, setNotes] = useState([])
  const [showAll, setShowAll] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes)
      })
  }, [])


  useEffect(() => {
    const loggedUserJSON = localStorage.getItem('loggedNoteUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])

  const addNote = (noteObject) => {
    noteService
      .create(noteObject)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
      })
  }

  const toggleImportanceOf = id => {
    const note = notes.find(n => n.id === id)
    const changedNote = { ...note, important: !note.important }
  
    noteService
      .update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(n => n.id !== id ? n : returnedNote))
      })
      .catch(error => {
        alert(`the note '${note.content}' was already deleted from the server`)
        setNotes(notes.filter(n => n.id !== id))
      })
  }

  const notesToShow = showAll
    ? notes
    : notes.filter(note => note.important)

  const handleLogin = async (username, password) => {
    try {
      const user = await loginService.login({
        username, password,
      })
      // Save user to local storage to persist on specific browser
      localStorage.setItem(
        'loggedNoteUser', JSON.stringify(user)
      )
      // Set token to authorize user's note manipulation
      noteService.setToken(user.token)
      setUser(user)
    } catch(exception) {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  // Currently, logout is only hanlded on client side
  // by removing the user and their token from localStorage
  // Server side token invalidation techniques such as blacklisting, timeout 
  // may be considered in the future
  const handleLogout = () => {
    try {
      // await logoutService.logout()
      localStorage.removeItem('loggedNoteUser')
      setUser(null)
    } catch (exception) {
      setErrorMessage('cannot logout')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage}/>

      {user === null ? 
        <Togglable buttonLabel="log in">
          <LoginForm handleLogin={handleLogin}/>
        </Togglable> :
        <div>
          <p>{user.name} logged-in</p>
          <Togglable buttonLabel="new note">
            <NoteForm createNote={addNote}/>
          </Togglable>
          
          <button onClick={() => handleLogout()}>log out</button>
        </div>
      }

      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all' }
        </button>
      </div>      
      <ul>
        {notesToShow.map(note => 
          <Note 
            key={note.id} 
            note={note} 
            toggleImportance={() => toggleImportanceOf(note.id)}
          />
        )}
      </ul>
    </div>
  )
}

export default App