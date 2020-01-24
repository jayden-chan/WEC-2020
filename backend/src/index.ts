import * as express from "express";
import { readdir, unlink, mkdirSync, stat } from "fs";
import { resolve } from "path";

import { verify_token } from "./util";

import * as cors from "cors";
import * as fileUpload from "express-fileupload";
import * as bodyParser from "body-parser";
import * as jwt from "jsonwebtoken";
import * as sqlstring from "sqlstring";

const JWT_SECRET = process.env.JWT_SECRET || "Hello there testing";

const { Pool } = require("pg");
const client = new Pool({
  connectionString: "postgres://jayden@localhost/wec-2020",
  ssl: false
});

const PORT = 3000;

const app = express();
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
  })
);

app.use(bodyParser.json());
app.use(cors());

app.get("/hello", (req, res) => {
  res.status(200).send("Hello there testing");
});

app.post("/login", (req, res) => {
  const query = sqlstring.format(
    "SELECT username FROM data WHERE username = ? AND password = crypt(?, password)",
    [req.body.username, req.body.password]
  );

  client.query(query, (err, response) => {
    let result = [];
    if (err) {
      console.log(err);
      res.status(500).send("Error during db call");
      return;
    }

    for (let row of response.rows) {
      result.push(row);
    }

    switch (result.length) {
      case 1:
        let token = jwt.sign(result[0].username, JWT_SECRET);
        res.status(200).send(JSON.stringify({ token: token }));
        break;

      default:
        res.status(401).send("Bad username or password");
        break;
    }
  });
});

app.post("/signup", (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.status(400).send("Missing username or password");
    return;
  }
  const check_query = sqlstring.format(
    "SELECT * FROM data WHERE username = ?",
    [req.body.username]
  );

  const insert_query = sqlstring.format(
    `INSERT INTO data(username, password) VALUES(?, crypt(?, gen_salt('bf', 8)))`,
    [req.body.username, req.body.password]
  );

  client.query(check_query, (err, response) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error occurred with db check");
      return;
    }

    if (response.rows.length === 0) {
      client.query(insert_query, (err, response) => {
        if (err) {
          console.log(err);
          res.status(500).send("Error occurred with db check");
        } else {
          res.status(201).send("user created");
        }
      });
    } else {
      res.status(400).send("user already exists");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
