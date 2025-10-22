import prisma from "../prismaClient.js";

export const createUser = async (data) => {
  try {
    // Checking for missing fields
    if (!data.email || !data.firstName || !data.lastName || !data.passwordHash) {
      throw new Error("Missing required user fields (email, firstName, lastName, passwordHash)");
    }

    // Log the data
    // console.log("🟦 Creating user with data:", {
    //   ...data,
    //   passwordHash: "HIDDEN_FOR_SECURITY"
    // });

    const user = await prisma.user.create({
      data,
      include: {
        userType: true,
        userStatus: true,
      },
    });

    console.log("User successfully created:", {
      id: user.id,
      email: user.email,
      userType: user.userType.name,
      userStatus: user.userStatus.name,
    });

    return user;

  } catch (error) {
    console.error("Prisma user.create() failed:", error);
    throw new Error(error.message || "Failed to create user");
  }
};

export const findUserByEmail = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userType: true,
        userStatus: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Prisma findUserByEmail() failed:", error);
    throw new Error("Database error while finding user by email");
  }
};
