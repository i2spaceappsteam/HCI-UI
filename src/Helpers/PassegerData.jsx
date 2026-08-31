import ApiClient from "./ApiClient";

export const getPassengerData = async (userID) => {
  return new Promise((resolve, reject) => {
    ApiClient.get(`admin/b2c/user/${userID}`)
      .then((response) => {
        if (response.status === 200) {
          let res = { status: true, ...response.data.userDetails };

          if (res.Email) {
            if (res.Email.indexOf("@") == -1) {
              res.Email = "";
            }
          }

          resolve(res);
        }
      })
      .catch((e) => {
        resolve({ status: false });
      });
  });
};
