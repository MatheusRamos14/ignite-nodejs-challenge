const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(userInfo => userInfo.username === username)
  if (!user) return response.status(404).json({ error: 'Usuário não encontrado' })

  request.user = user

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const verify = users.find(user => user.username === username)
  if (verify) return response.status(400).json({ error: 'Já existe um usuário com o username escolhido' })

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()

  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const task = user.todos.find(todo => todo.id === id)
  if (!task) return response.status(404).json({ error: 'Tarefa com o ID fornecido não encontrada.' })

  task.title = title
  task.deadline = deadline

  return response.status(200).json(task)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const task = user.todos.find(todo => todo.id === id)
  if (!task) return response.status(404).json({ error: 'Tarefa com o ID fornecido não encontrada.' })

  task.done = !task.done

  return response.status(200).json(task)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const taskIndex = user.todos.findIndex(todo => todo.id === id)
  if (taskIndex === -1) return response.status(404).json({ error: 'Tarefa com o ID fornecido não encontrada.' })

  user.todos.splice(taskIndex, 1)

  return response.sendStatus(204)
});

module.exports = app;