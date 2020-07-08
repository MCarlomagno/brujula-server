import express from "express";
import { router } from "./routes/index";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT || 4000; // default port to listen

// middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// start the Express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});

// Routes
app.use(router);