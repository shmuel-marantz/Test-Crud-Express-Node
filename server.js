import express from "express";
import fs from "fs/promises";
const app = express();
const PORT = 3000;
app.use(express.json());

const readUsers = async () => {
  try {
    const data = await fs.readFile("./users.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeUsers = async (users) => {
  await fs.writeFile("./users.json", JSON.stringify(users, null, 2), "utf8");
};

const readEvents = async () => {
  try {
    const data = await fs.readFile("./events.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeEvents = async (events) => {
  await fs.writeFile("./events.json", JSON.stringify(events, null, 2), "utf8");
};

const readReceipts = async () => {
  try {
    const data = await fs.readFile("./receipts.json", "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeReceipts = async (receipts) => {
  await fs.writeFile(
    "./receipts.json",
    JSON.stringify(receipts, null, 2),
    "utf8"
  );
};

app.post("/user/register", async (req, res) => {
  try {
    const users = await readUsers();
    const validation = users.find((u) => u.username === req.body.username);

    if (validation) {
      return res.json({ msg: "The user already exists" });
    }
    const newUser = {
      username: req.body.username,
      password: req.body.password,
    };
    users.push(newUser);
    await writeUsers(users);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "error" + err.message, data: null });
  }
});

app.post("/creator/events", async (req, res) => {
  try {
    const users = await readUsers();
    const validation = users.find((u) => u.username === req.body.username);

    if (!validation) {
      return res.json({ msg: "The User does not exist" });
    }
    if (validation.password !== req.body.password) {
      return res.json({ msg: "The password is incorrect" });
    }
    const events = await readEvents();
    const newEvent = {
      eventName: req.body.eventName,
      ticketsForSale: req.body.ticketsForSale,
      username: req.body.username,
      password: req.body.password,
    };
    events.push(newEvent);
    await writeEvents(events);
    res.status(201).json({ message: "Event created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "error" + err.message, data: null });
  }
});

app.post("/users/tickets/buy", async (req, res) => {
  try {
    const users = await readUsers();
    const validation = users.find((u) => u.username === req.body.username);

    if (!validation) {
      return res.json({ msg: "The User does not exist" });
    }
    if (validation.password !== req.body.password) {
      return res.json({ msg: "The password is incorrect" });
    }
    const events = await readEvents();
    const event = events.find((e) => e.eventName === req.body.eventName);

    if (req.body.quantity > event.ticketsForSale) {
      return res.json({ msg: "תפסת מרובה לא תפסת" });
    }

    const receipts = await readReceipts();

    const newReceipt = {
      username: req.body.username,
      eventName: req.body.eventName,
      ticketsBought: req.body.quantity,
    };
    receipts.push(newReceipt);
    await writeReceipts(receipts);

    event.ticketsForSale -= req.body.quantity;
    await writeEvents(events);

    res.status(201).json({ message: "Tickets purchased successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "error" + err.message, data: null });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
