import { prisma } from "@/lib/prisma";

interface GetUserAccountRequest {
  userId: string;
}

interface GetUserAccountResponse {
  id: string;
  email: string;
  name: string;
  status: string;
  activatedAt: Date | null;
  createdAt: Date;
}

export async function getUserAccount({
  userId,
}: GetUserAccountRequest): Promise<GetUserAccountResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      activatedAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
