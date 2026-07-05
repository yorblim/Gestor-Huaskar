import { Request, Response, NextFunction } from "express";
import { getAllUsers, createUser, updateUser, deleteUser } from "./user.service";

export async function getAllUsersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = (req.query.search as string) || "";
    const result = await getAllUsers(page, limit, search);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function createUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await createUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string);
    const user = await updateUser(id, req.body);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function deleteUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id as string);
    await deleteUser(id);
    res.status(200).json({ success: true, message: "Usuario eliminado." });
  } catch (error) {
    next(error);
  }
}
