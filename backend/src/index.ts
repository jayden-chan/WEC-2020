import * as express from "express";
import { readdir, unlink, mkdirSync, stat } from "fs";
import { resolve } from "path";
import * as moment from "moment";

import { verify_token, undef } from "./util";

import * as cors from "cors";
import * as fileUpload from "express-fileupload";
import * as bodyParser from "body-parser";
import * as jwt from "jsonwebtoken";
import * as sqlstring from "sqlstring";
import * as parse from "csv-parse/lib/sync";

const JWT_SECRET = process.env.JWT_SECRET || "Hello there testing";

const { Pool } = require("pg");
const client = new Pool({
  connectionString: "postgres://jayden@localhost/wec-2020",
  ssl: false
});

const PORT = 3000;

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/hello", (req, res) => {
  res.status(200).send("Hello there testing");
});

app.get("/all", (req, res) => {
  const user_name = verify_token(req.headers.authorization, JWT_SECRET);
  if (!user_name) {
    res.status(401).send("Not authorized");
    return;
  }

  const k_c_query =
    "SELECT date, type, amount, title FROM karen_check WHERE accepted = true";

  const k_s_query =
    "SELECT date, type, amount, title FROM karen_sav WHERE accepted = true";

  const b_query =
    "SELECT date, type, amount, title FROM bobby WHERE accepted = true";

  if (user_name === "karen") {
    client.query(k_c_query, (e1, r1) => {
      if (e1) {
        console.log(e1);
        res.status(500).send("Error during db call");
      } else {
        client.query(k_s_query, (e2, r2) => {
          if (e2) {
            console.log(e2);
            res.status(500).send("Error during db call");
          } else {
            client.query(b_query, (e3, r3) => {
              if (e3) {
                console.log(e3);
                res.status(500).send("Error during db call");
              } else {
                res.status(200).send(
                  JSON.stringify({
                    chequing: r1.rows,
                    savings: r2.rows,
                    bobby: r3.rows
                  })
                );
              }
            });
          }
        });
      }
    });
  } else if (user_name === "bobby") {
    client.query(b_query, (e3, r3) => {
      if (e3) {
        console.log(e3);
        res.status(500).send("Error during db call");
      } else {
        res.status(200).send(
          JSON.stringify({
            bobby: r3.rows
          })
        );
      }
    });
  }
});

app.post("/karen", (req, res) => {
  const user_name = verify_token(req.headers.authorization, JWT_SECRET);
  if (!user_name || user_name !== "karen") {
    res.status(401).send("Not authorized");
    return;
  }

  const acc_t =
    req.body.acc === "c"
      ? "karen_check"
      : req.body.acc === "s"
      ? "karen_sav"
      : null;

  if (!acc_t) {
    res.status(400).send("Invalid account type");
  } else {
    const { i_type, amount, title } = req.body;
    if (undef(i_type) || undef(amount) || undef(title)) {
      res.status(400).send("Missing data");
    }

    if (req.body.i_type === "Withdrawal") {
      karen_bal(acc_t === "karen_sav", bal => {
        let accepted = true;
        if (bal < amount) {
          accepted = false;
          res.status(400).send("Too low balance");
        }

        const insert_query = sqlstring.format(
          `INSERT INTO ${acc_t}(date, type, amount, title, accepted) VALUES(?, ?, ?, ?, ?)`,
          [moment().format(), i_type, amount, title, accepted]
        );

        client.query(insert_query, (err, response) => {
          if (err) {
            console.log(err);
            if (accepted) {
              res.status(500).send("Error occurred with db insert");
            }
          } else {
            if (accepted) {
              res.status(201).send("Data added");
            }
          }
        });
      });
    } else {
      const insert_query = sqlstring.format(
        `INSERT INTO ${acc_t}(date, type, amount, title, accepted) VALUES(?, ?, ?, ?, ?)`,
        [moment().format(), i_type, amount, title, true]
      );

      client.query(insert_query, (err, response) => {
        if (err) {
          console.log(err);
          res.status(500).send("Error occurred with db insert");
        } else {
          res.status(201).send("Data added");
        }
      });
    }
  }
});

app.post("/bobby", (req, res) => {
  const user_name = verify_token(req.headers.authorization, JWT_SECRET);
  if (!user_name || (user_name !== "karen" && user_name !== "bobby")) {
    res.status(401).send("Not authorized");
    return;
  }

  const { i_type, amount, title } = req.body;
  if (undef(i_type) || undef(amount) || undef(title)) {
    res.status(400).send("Missing data");
  }

  if (req.body.i_type === "Withdrawal") {
    bobby_bal(bal => {
      let accepted = true;
      if (bal < amount) {
        accepted = false;
        res.status(400).send("Too low balance");
      }

      bobby_today(moment().format("YYYY-MM-DD"), am => {
        if (accepted && am + amount > 100) {
          accepted = false;
          res.status(400).send("Your account is locked sorry");
        }

        const insert_query = sqlstring.format(
          `INSERT INTO bobby(date, type, amount, title, accepted) VALUES(?, ?, ?, ?, ?)`,
          [moment().format(), i_type, amount, title, accepted]
        );

        client.query(insert_query, (err, response) => {
          if (err) {
            console.log(err);
            if (accepted) {
              res.status(500).send("Error occurred with db insert");
            }
          } else {
            if (accepted) {
              res.status(201).send("Data added");
            }
          }
        });
      });
    });
  } else {
    const insert_query = sqlstring.format(
      `INSERT INTO bobby(date, type, amount, title, accepted) VALUES(?, ?, ?, ?, ?)`,
      [moment().format(), i_type, amount, title, true]
    );

    client.query(insert_query, (err, response) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error occurred with db insert");
      } else {
        res.status(201).send("Data added");
      }
    });
  }
});

app.post("/transfer", (req, res) => {
  const { amount } = req.body;

  karen_bal(false, bal => {
    if (bal < amount) {
      res.status(400).send("Too low balance");
    } else {
      const time = moment().format("YYYY-MM-DD");
      const insert_query = sqlstring.format(
        `INSERT INTO karen_check(date, type, amount, title) VALUES(?, ?, ?, ?)`,
        [time, "Withdrawal", amount, "Transfer to Bobby"]
      );

      const bobby_query = sqlstring.format(
        `INSERT INTO bobby(date, type, amount, title) VALUES(?, ?, ?, ?)`,
        [time, "Deposit", amount, "Transfer from Karen"]
      );

      client.query(insert_query, (e1, r1) => {
        if (e1) {
          console.log(e1);
          res.status(500).send("Error occurred with db insert");
        } else {
          client.query(bobby_query, (e2, r2) => {
            if (e2) {
              console.log(e2);
              res.status(500).send("Error occurred with db insert");
            } else {
              res.status(201).send("Data added");
            }
          });
        }
      });
    }
  });
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

if (process.argv[2] === "--import") {
  const input = require("fs")
    .readFileSync(process.argv[3])
    .toString();

  const records = parse(input, {
    comment: "#"
  });

  let query = `INSERT INTO ${process.argv[4]}(date, type, amount, title) VALUES`;
  records.slice(1).forEach(s => {
    query += sqlstring.format("(?, ?, ?, ?),\n", [
      moment(s[0]).format("YYYY-MM-DD"),
      s[1] === "Withdrawl" ? "Withdrawal" : s[1],
      s[2],
      s[3]
    ]);
  });

  query = query.slice(0, -2) + ";";

  client.query(query, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      console.log("inserted");
      process.exit(0);
    }
  });
} else {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

function karen_bal(is_sav: boolean, cb: any) {
  const acc_t = is_sav ? "karen_sav" : "karen_check";

  const w_query = sqlstring.format(
    `SELECT SUM(amount) FROM ${acc_t} WHERE type = ?`,
    ["Withdrawal"]
  );

  const d_query = sqlstring.format(
    `SELECT SUM(amount) FROM ${acc_t} WHERE type = ?`,
    ["Deposit"]
  );

  client.query(d_query, (e1, r1) => {
    if (e1) {
      console.log(e1);
      return -1;
    } else {
      client.query(w_query, (e2, r2) => {
        if (e2) {
          console.log(e2);
          return -1;
        } else {
          cb(r1.rows[0].sum - r2.rows[0].sum);
        }
      });
    }
  });
}

function bobby_bal(cb: any) {
  const w_query = sqlstring.format(
    `SELECT SUM(amount) FROM bobby WHERE type = ? AND accepted = true`,
    ["Withdrawal"]
  );

  const d_query = sqlstring.format(
    `SELECT SUM(amount) FROM bobby WHERE type = ? AND accepted = true`,
    ["Deposit"]
  );

  client.query(d_query, (e1, r1) => {
    if (e1) {
      console.log(e1);
      return -1;
    } else {
      client.query(w_query, (e2, r2) => {
        if (e2) {
          console.log(e2);
          return -1;
        } else {
          cb(r1.rows[0].sum - r2.rows[0].sum);
        }
      });
    }
  });
}

function bobby_today(date: string, cb: any) {
  const d_query = sqlstring.format(
    `SELECT * FROM bobby WHERE date = ? AND type = ?`,
    [moment(date).format("YYYY-MM-DD"), "Withdrawal"]
  );

  client.query(d_query, (e1, r1) => {
    if (e1) {
      console.log(e1);
      return -1;
    } else {
      cb(
        r1.rows.reduce((acc, curr) => {
          return acc + curr.amount;
        }, 0)
      );
    }
  });
}
