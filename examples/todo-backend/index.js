require("dotenv").config();
const app = require("express")();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { createClient } = require("../../lib");

const endpoint = process.env.ENDPOINT;
const key = process.env.KEY;

const todos = createClient({ endpoint, key })
  .database("starchart-test")
  .container("todos");

// ----- Parse JSON requests
app.use(bodyParser.json());

// ----- Allow CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(morgan("dev"));

app.get("/", async function(req, res) {
  const result = [];
  for await (const todo of todos.all()) {
    result.push(todo);
  }
  res.json(result);
});

app.get("/:id", async function(req, res) {
  res.json(await todos.find(req.params.id));
});

app.post("/", async function(req, res) {
  const todo = await todos.save({ ...req.body, completed: false });
  todo.url = `http://localhost:5000/${todo.id}`;
  res.json(await todos.save(todo));
});

app.patch("/:id", async function(req, res) {
  const todo = await todos.find(req.params.id);
  Object.assign(todo, req.body);
  res.json(await todos.save(todo));
});

app.delete("/", async function(req, res) {
  for await (const todo of todos.all()) {
    await todos.destroy(todo.id);
  }
  res.end();
});

app.delete("/:id", async function(req, res) {
  await todos.destroy(req.params.id);
  res.end();
});

app.listen(Number(process.env.PORT || 5000));
