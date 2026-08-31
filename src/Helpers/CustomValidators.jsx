

import dayjs from "dayjs";

const OnlyFutureDateValidator = (rule, value) => {
  const currentDate = Date.now();
  if (currentDate > value) {
    return Promise.reject("Only Future Date Allowed");
  } else {
    return Promise.resolve();
  }
};

export const DepartureAndArrivalDatevalidator = (rule, value) => {
  if (!value) {
    return Promise.reject("");
  } else {
    const currentDate = Date.now();

    if (currentDate >= value[0]) {
      return Promise.reject("Select Future Date");
    } else {
      return Promise.resolve();
    }
  }
};

export const PaxAgeValidator1 = (paxType, value) => {
 
  return new Promise((resolve, reject) => {
  

    if (!value) {
      reject("Date of Birth is required"); // ✅ Use reject() instead of returning Promise.reject()
    }

    const age = dayjs().diff(value, "years"); // Calculate age from date


    if (paxType === "ADT" && age < 12) {
      reject("Adult must be at least 12 years old");
    } else if (paxType === "CHD" && (age < 2 || age >= 12)) {
      reject("Child must be between 2 and 12 years old");
    } else if (paxType === "INF" && age >= 2) {
      reject("Infant must be under 2 years old");
    } else {
      resolve(); // ✅ Valid age
    }
  });
};



export const PaxAgeValidator = (paxType, dob) => {


  if (!dob) {
    return Promise.reject("Invalid Date");
  }

  // Ensure proper parsing of the date
  const DoB = dayjs(dob).startOf("day"); // Parse dob correctly and remove time part
  if (!DoB.isValid()) {
    return Promise.reject("Invalid Date Format");
  }

  const age = dayjs().diff(DoB, "years");
  const days = dayjs().diff(DoB, "days");


  if (paxType === "ADT") {
    if (age >= 12) {
      return Promise.resolve();
    } else {
      return Promise.reject("Age above 12 years");
    }
  } else if (paxType === "CHD") {
    if (age < 12 && age >= 2) {
      return Promise.resolve();
    } else {
      return Promise.reject("Age between 2 & 12 years");
    }
  } else if (paxType === "INF") {
    if (days < 730) {
      return Promise.resolve();
    } else {
      return Promise.reject("Age less than 2 years old");
    }
  } else {
    return Promise.reject("Please Select Pax Type First");
  }
};

export const OriDesValidate = (origin, destination) => {

  if (origin && destination) {
    if (origin === destination) {
      return Promise.reject("Origin and Destination cannot be same");
    }
  }
  return Promise.resolve();
};

export { OnlyFutureDateValidator };
