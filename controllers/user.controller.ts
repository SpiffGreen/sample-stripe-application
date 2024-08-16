import type { NextFunction, Request, Response } from "express";
import {
  ForbiddenException,
  ValidationException,
} from "../helpers/exceptions.helper";
import { db } from "../utils/db.util";
import { transactionsTable, usersTable } from "../migrations/schema";
import { and, desc, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function getProfile(req: Request, res: Response) {
  const user: Record<string, any> | undefined =
    await db.query.usersTable.findFirst({
      where: eq(usersTable.id, req.user!.sub),
    });
  const lastTransaction = await db.query.transactionsTable.findFirst({
    where: and(
      eq(transactionsTable.userId, req.user!.sub),
      eq(transactionsTable.status, "done")
    ),
    orderBy: desc(transactionsTable.id),
  });

  console.log(lastTransaction);

  user!.balance = lastTransaction?.balance ?? 0;
  return res.json({
    success: true,
    message: "User profile",
    data: user,
  });
}

export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password)
      throw new ValidationException("Please provide valid details");

    const oldUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    if (oldUser) throw new ForbiddenException("Email already in use");

    const hashedPassword = bcrypt.hashSync(password);

    await db
      .insert(usersTable)
      .values({ email, name, password: hashedPassword });

    return res.status(201).json({
      success: true,
      message: "Account created",
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

export async function signin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      throw new ValidationException("Please provide valid details");

    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    if (!user) throw new ForbiddenException("Incorrect email or password");

    const isMatch = bcrypt.compareSync(password, user.password);

    if (!isMatch) throw new ForbiddenException("Incorrect email or password");

    const payload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "2h",
    });

    return res.status(200).json({
      success: true,
      message: "Successful signin",
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
