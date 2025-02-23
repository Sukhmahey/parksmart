import { getParkingSpaces } from "../../crud.js";

const fetchParkingSpots = async () => {
  const data = await getParkingSpaces();

  console.log("Data---", data);
};

window.onload = function () {
  fetchParkingSpots();
};
