import express from "express";
import userRouter from "./routes/user.route";
import paymentRouter from "./routes/payment.route";
import errorMiddleware from "./middlewares/error.middleware";
import morgan from "morgan";
import http from "http";

const app = express();
const port = process.env.PORT || 8080;

// Middlewares
app.use(morgan("tiny"));

// Use JSON parser for all non-webhook routes
app.use(
  (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void => {
    if (req.originalUrl === "/api/payments/verify-payment") {
      next(); // Continue processing the request
    } else {
      express.json()(req, res, next);
    }
  }
);

app.use("/api/users", userRouter);
app.use("/api/payments", paymentRouter);

// Error handling middleware should be the last middleware
app.use(errorMiddleware);

const server: http.Server = app.listen(port);
// @ts-expect-error
console.log(`Server available at http://localhost:${server.address().port}`);
