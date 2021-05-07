const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

// to save users
const users = [];

function checksExistsUserAccount(request, response, next) {

  // get username header
  let { username } = request.headers;
  
  // find user by username
  let findUsername = users.find(user => user.username === username);

  // if not find username, return error
  if(!findUsername){
    return response.status(400).json({error: "Username not found"});
  }

  // get user data
  request.user = findUsername;

  // finish
  return next();

}

app.post('/users', (request, response) => {
  
  // get values
  let { name, username } = request.body;

  // check if username already existis
  let findUsername = users.some(user => user.username === username);

  // if find, return error
  if(findUsername){
    return response.status(400).json({error: "Username already exists, choose another!"});
  }

  // object to save a new user
  let newUser = {
    name,
    username,
    id: uuidv4(),
    todos: []
  };

  // increment on users array
  users.push(newUser);

  // finish
  return response.status(201).json(newUser);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  
  // data from user
  let { user } = request;

  // return totos from the user
  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  
  // get data
  let { user } = request;
  let { title, deadline } = request.body;

  // create object to save
  let newTodo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  };

  // increment todo
  user.todos.push(newTodo);

  // finsh
  return response.status(201).json(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  // get data
  let { user } = request;
  let { title, deadline } = request.body;
  let { id } = request.params;

  // find by id
  let findTodo = user.todos.find(todo => todo.id === id);

  // if finded
  if(!findTodo){
    return response.status(404).json({error: "Id not found"});
  }

  // change
  findTodo.title = title;
  findTodo.deadline = new Date(deadline);

  // finalize
  return response.json(findTodo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  
  // get data
  let { user } = request;
  let { id } = request.params;

  // find by id
  let findTodo = user.todos.find(todo => todo.id === id);

  // if finded
  if(!findTodo){
    return response.status(404).json({error: "Id not found"});
  }

  // change to done
  findTodo.done = true;

  // finish
  return response.json(findTodo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  
  // get data
  let { user } = request;
  let { id } = request.params;

  // find by id
  let findTodo = user.todos.find(todo => todo.id === id);

  // if finded
  if(!findTodo){
    return response.status(404).json({error: "Id not found"});
  }

  // remove
  user.todos.splice(findTodo, 1);

  // finish
  return response.status(204).json(user.todos);

});

module.exports = app;