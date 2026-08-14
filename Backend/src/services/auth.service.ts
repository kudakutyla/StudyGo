import { prisma } from "../config/database";
import { HttpError } from "../middleware/error.middleware";
import { comparePassword, hashPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { loginSchema, registerSchema } from "../validators/auth.validator";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export const registerUser = async (input: RegisterInput) => {
  const parsed = registerSchema.parse(input);

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.email.toLowerCase() },
  });

  if (existingUser) {
    throw new HttpError(409, "An account with this email already exists.");
  }

  const hashedPassword = await hashPassword(parsed.password);

  const user = await prisma.user.create({
    data: {
      name: parsed.name.trim(),
      email: parsed.email.toLowerCase(),
      password: hashedPassword,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

export const loginUser = async (input: LoginInput) => {
  const parsed = loginSchema.parse(input);

  const user = await prisma.user.findUnique({
    where: { email: parsed.email.toLowerCase() },
  });

  if (!user) {
    throw new HttpError(401, "Invalid email or password.");
  }

  const isValidPassword = await comparePassword(parsed.password, user.password);

  if (!isValidPassword) {
    throw new HttpError(401, "Invalid email or password.");
  }

  const token = signToken(user.id);

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
};

export const getCurrentUserFromId = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return user;
};
