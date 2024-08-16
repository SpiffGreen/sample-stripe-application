# Try-stripe-connect

The root of the application houses the backend and has a client folder which contains the frontend code. To run this project follow the steps below:

To install dependencies:
```bash
# For backend
bun install
# For frontend change directory into the client folder and run the comand
```

Setup database
```bash
bun db:migrate
```

Run app in development mode
```bash
bun dev # For both client and backend
```

This project was created using `bun init` in bun v1.1.16. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
