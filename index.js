const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());

const usersFilePath = 'users.json';

const readUsersFromFile = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const writeUsersToFile = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

const userSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  secondName: Joi.string().min(1).required(),
  age: Joi.number().integer().min(0).max(150).required(),
  city: Joi.string().min(1).optional(),
});

// Получение всех пользователей
app.get('/users', (req, res) => {
  const users = readUsersFromFile();
  res.json(users);
});

// Создание пользователя
app.post('/users', (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const newUser = {
    id: uuidv4(),
    ...req.body,
  };

  const users = readUsersFromFile();
  users.push(newUser);
  writeUsersToFile(users);

  res.status(201).json(newUser);
});

// Получение отдельного пользователя
app.get('/users/:id', (req, res) => {
  const users = readUsersFromFile();
  const user = users.find(u => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  res.json(user);
});

// Обновление пользователя
app.put('/users/:id', (req, res) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const users = readUsersFromFile();
  const userIndex = users.findIndex(u => u.id === req.params.id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  users[userIndex] = { id: req.params.id, ...req.body };
  writeUsersToFile(users);

  res.json(users[userIndex]);
});

// Удаление пользователя
app.delete('/users/:id', (req, res) => {
  const users = readUsersFromFile();
  const userIndex = users.findIndex(u => u.id === req.params.id);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  users.splice(userIndex, 1);
  writeUsersToFile(users);

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
