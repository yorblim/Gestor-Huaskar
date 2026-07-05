import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

export async function getAllUsers(page = 1, limit = 50, search = "") {
  const where = search
    ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { data: users, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createUser(data: { name: string; email: string; password: string; role: "ADMIN" | "USER" }) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError("El correo ya está registrado.", 409);

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, password: hashedPassword, role: data.role },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });
  return user;
}

export async function updateUser(id: number, data: { name?: string; email?: string; password?: string; role?: "ADMIN" | "USER" }) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError("Usuario no encontrado.", 404);

  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError("El correo ya está registrado.", 409);
  }

  const updateData: any = {};
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  if (data.role) updateData.role = data.role;
  if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });
}

export async function deleteUser(id: number) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError("Usuario no encontrado.", 404);

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (user.role === "ADMIN" && adminCount <= 1) {
    throw new AppError("No se puede eliminar el único administrador.", 400);
  }

  await prisma.user.delete({ where: { id } });
  return true;
}
