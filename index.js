const { addUser, getUsers, updateUser, deleteUser } = require("./crud");

async function main() {

  const userId = await addUser(
    "vipul juneja",
    "viipul@email.com",
    "hashed_password",
    "parker"
  );

  // 2️Read Users
  console.log("Fetching Users:");
  await getUsers();

  // 3 Update User
  await updateUser(userId, { name: "Johnathan Doe" });

  // 3 Delete User
  // await deleteUser(userId);
}

main();
