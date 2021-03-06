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

import { processStocks } from "./algorithm";

const JWT_SECRET = process.env.JWT_SECRET || "Hello there testing";
const DATABASE_URL =
  process.env.DATABASE_URL || "postgres://jayden@localhost/wec-2020";

const { Pool } = require("pg");
const client = new Pool({
  connectionString: DATABASE_URL,
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
    const { date, i_type, amount, title } = req.body;
    if (undef(date) || undef(i_type) || undef(amount) || undef(title)) {
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
          [date, i_type, amount, title, accepted]
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
        [date, i_type, amount, title, true]
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

  const { date, i_type, amount, title } = req.body;
  if (undef(date) || undef(i_type) || undef(amount) || undef(title)) {
    res.status(400).send("Missing data");
  }

  if (req.body.i_type === "Withdrawal") {
    bobby_bal(bal => {
      let accepted = true;
      if (bal < amount) {
        accepted = false;
        console.log("too low");
        res.status(400).send("Too low balance");
      }

      bobby_today(date, am => {
        if (accepted && am + amount > 100) {
          accepted = false;
          console.log("locked");
          res.status(400).send("Your account is locked sorry");
        }

        const insert_query = sqlstring.format(
          `INSERT INTO bobby(date, type, amount, title, accepted) VALUES(?, ?, ?, ?, ?)`,
          [date, i_type, amount, title, accepted]
        );

        client.query(insert_query, (err, response) => {
          if (err) {
            console.log(err);
            if (accepted) {
              res.status(500).send("Error occurred with db insert");
            }
          } else {
            if (accepted) {
              console.log("sent");
              res.status(201).send("Data added");
            }
          }
        });
      });
    });
  } else {
    const insert_query = sqlstring.format(
      `INSERT INTO bobby(date, type, amount, title, accepted) VALUES(?, ?, ?, ?, ?)`,
      [date, i_type, amount, title, true]
    );

    client.query(insert_query, (err, response) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error occurred with db insert");
      } else {
        console.log("added");
        res.status(201).send("Data added");
      }
    });
  }
});

app.post("/transfer", (req, res) => {
  const user_name = verify_token(req.headers.authorization, JWT_SECRET);
  if (!user_name) {
    res.status(401).send("Not authorized");
    return;
  }
  const { amount } = req.body;

  if (undef(amount) || amount === "") {
    res.status(400).send("Missing amount");
    return;
  }

  karen_bal(false, bal => {
    if (bal < amount) {
      res.status(400).send("Too low balance");
    } else {
      const time = moment().format("YYYY-MM-DD");
      const insert_query = sqlstring.format(
        `INSERT INTO karen_check(date, type, amount, title, accepted) VALUES(?, ?, ?, ?, ?)`,
        [time, "Withdrawal", amount, "Transfer to Bobby", true]
      );

      const bobby_query = sqlstring.format(
        `INSERT INTO bobby(date, type, amount, title, accepted) VALUES(?, ?, ?, ?, ?)`,
        [time, "Deposit", amount, "Transfer from Karen", true]
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

app.post("/update_stocks", (req, res) => {
  const user_name = verify_token(req.headers.authorization, JWT_SECRET);
  if (!user_name || user_name !== "karen") {
    res.status(401).send("Not authorized");
    return;
  }

  const { date } = req.body;
  if (!date) {
    console.log(req.body);
    res.status(401).send("No date");
    return;
  }

  const our_stocks = `SELECT * FROM stocks`;

  const query = s =>
    sqlstring.format(
      `SELECT * FROM ${s} WHERE date < ? ORDER BY date DESC LIMIT 30`,
      [date]
    );

  // node-postgres does not support sync requests so we need to
  // nest them like this, sorry
  client.query(query("tesla"), (e1, r1) => {
    if (e1) {
      console.log(e1);
      res.status(500).send("err in db");
    } else {
      client.query(query("loblaws"), (e2, r2) => {
        if (e2) {
          console.log(e2);
          res.status(500).send("err in db");
        } else {
          client.query(query("macys"), (e3, r3) => {
            if (e3) {
              console.log(e3);
              res.status(500).send("err in db");
            } else {
              client.query(query("costco"), (e4, r4) => {
                if (e4) {
                  console.log(e4);
                  res.status(500).send("err in db");
                } else {
                  client.query(our_stocks, (e5, r5) => {
                    if (e5) {
                      console.log(e5);
                      res.status(500).send("err in db");
                    } else {
                      karen_inv_bal(bal => {
                        const data = {
                          tesla: r1.rows.reverse(),
                          loblaws: r2.rows.reverse(),
                          macys: r3.rows.reverse(),
                          costco: r4.rows.reverse()
                        };

                        const updates = processStocks(data, r5.rows[0], bal);
                        console.log(updates);
                        let query = `INSERT INTO investments(date, type, amount, title, accepted) VALUES`;
                        const q2 = `UPDATE stocks SET costco = ?, macys = ?, loblaws = ?, tesla = ?`;
                        console.log(r5.rows);

                        const stocks = {};
                        let did_insert = false;
                        Object.entries(updates).forEach(([k, v]) => {
                          stocks[k] = {
                            count: v + r5.rows[0][k],
                            price: data[k][29].open
                          };
                          if (v === 0) return;
                          const i_type = v > 0 ? "Withdrawal" : "Deposit";
                          const price = Math.abs(v) * data[k][29].open;
                          const name = k.charAt(0).toUpperCase() + k.slice(1);
                          const title =
                            i_type === "Withdrawal"
                              ? `StockBot: Purchase ${v} stocks from ${name}`
                              : `StockBot: Sell ${Math.abs(
                                  v
                                )} stocks from ${name}`;
                          query += sqlstring.format("(?, ?, ?, ?, ?)\n,", [
                            date,
                            i_type,
                            price,
                            title,
                            true
                          ]);
                          did_insert = true;
                        });

                        if (did_insert) {
                          client.query(query.slice(0, -2) + ";", (e6, r6) => {
                            if (e6) {
                              console.log(e6);
                              res.status(500).send("err in db");
                            } else {
                              client.query(
                                "SELECT * FROM investments WHERE accepted = true",
                                (e7, r7) => {
                                  if (e7) {
                                    console.log(e7);
                                    res.status(500).send("err in db");
                                  } else {
                                    client.query(
                                      sqlstring.format(q2, [
                                        stocks["costco"].count,
                                        stocks["macys"].count,
                                        stocks["loblaws"].count,
                                        stocks["tesla"].count
                                      ]),
                                      (e8, r8) => {
                                        if (e8) {
                                          console.log(e8);
                                          res.status(500).send("err in db");
                                        } else {
                                          res.status(200).send(
                                            JSON.stringify({
                                              stocks: Object.entries(
                                                stocks
                                              ).map(([k, v]) => {
                                                return {
                                                  name: k,
                                                  count: v["count"],
                                                  price: v["price"]
                                                };
                                              }),
                                              investments: r7.rows
                                            })
                                          );
                                        }
                                      }
                                    );
                                  }
                                }
                              );
                            }
                          });
                        } else {
                          client.query(
                            "SELECT * FROM investments WHERE accepted = true",
                            (e7, r7) => {
                              if (e7) {
                                console.log(e7);
                                res.status(500).send("err in db");
                              } else {
                                if (!did_insert) {
                                  res.status(200).send(
                                    JSON.stringify({
                                      stocks: Object.entries(stocks).map(
                                        ([k, v]) => {
                                          return {
                                            name: k,
                                            count: v["count"],
                                            price: v["price"]
                                          };
                                        }
                                      ),
                                      investments: r7.rows
                                    })
                                  );
                                } else {
                                  client.query(
                                    query.slice(0, -2) + ";",
                                    (e6, r6) => {
                                      if (e6) {
                                        console.log(e6);

                                        res.status(500).send("err in db");
                                      } else {
                                        client.query(
                                          sqlstring.format(q2, [
                                            stocks["costco"].count,
                                            stocks["macys"].count,
                                            stocks["loblaws"].count,
                                            stocks["tesla"].count
                                          ]),
                                          (e8, r8) => {
                                            if (e8) {
                                              console.log(e8);
                                              res.status(500).send("err in db");
                                            } else {
                                              res.status(200).send(
                                                JSON.stringify({
                                                  stocks: Object.entries(
                                                    stocks
                                                  ).map(([k, v]) => {
                                                    return {
                                                      name: k,
                                                      count: v["count"],
                                                      price: v["price"]
                                                    };
                                                  }),
                                                  investments: r7.rows
                                                })
                                              );
                                            }
                                          }
                                        );
                                      }
                                    }
                                  );
                                }
                              }
                            }
                          );
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
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

  let query = `INSERT INTO ${process.argv[4]}(date, type, amount, title, accepted) VALUES`;
  records.slice(1).forEach(s => {
    query += sqlstring.format("(?, ?, ?, ?, ?),\n", [
      moment(s[0]).format("YYYY-MM-DD"),
      s[1] === "Withdrawl" ? "Withdrawal" : s[1],
      s[2],
      s[3],
      true
    ]);
  });

  query = query.slice(0, -2) + ";";
  console.log(query);

  client.query(query, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      console.log("inserted");
      process.exit(0);
    }
  });
} else if (process.argv[2] === "--stocks") {
  const input = require("fs")
    .readFileSync(process.argv[3])
    .toString();

  const records = parse(input, {
    comment: "#"
  });

  let query = `INSERT INTO ${process.argv[4]}(date, open, high, low, close) VALUES`;
  records.slice(1).forEach(s => {
    query += sqlstring.format("(?, ?, ?, ?, ?),\n", [
      moment(s[0], "YYYY-MM-DD").format("YYYY-MM-DD"),
      s[1].slice(1),
      s[2].slice(1),
      s[3].slice(1),
      s[4].slice(1)
    ]);
  });

  query = query.slice(0, -2) + ";";
  console.log(query);

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

function karen_inv_bal(cb: any) {
  const acc_t = "investments";
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
