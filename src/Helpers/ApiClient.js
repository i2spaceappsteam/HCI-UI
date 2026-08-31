const BASE = import.meta.env.VITE_API_BASE_URL;
const _getParamString = (obj) => {
  let str = "";
  for (const key in obj) {
    if (str !== "") {
      str += "&";
    }
    str += key + "=" + encodeURIComponent(obj[key]);
  }
  return str;
};

const formatResponse = (res) => {
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/";
    return;
  }
  if (res.status !== 200) {
  } else {
    return res.json();
  }
};
const getToken = () => {
  let accessToken = localStorage.getItem("accessToken");
  return accessToken ? accessToken.replace(/^"(.*)"$/, "$1") : null;
};

class ApiClient {
  static async get(url, params = {}, accept = "application/json") {
    const paramString = _getParamString(params);
    url =
      Object.keys(params).length > 0
        ? `${BASE}${url}?${paramString}`
        : `${BASE}${url}`;

    return fetch(`${url}`, {
      method: "GET",
      headers: {
        "Access-Control-Request-Method": "GET",
        Accept: accept,
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: "Bearer " + getToken(),
      },
    })
      .then((res) => {
        return accept === "application/json" ? formatResponse(res) : res;
      })
      // .catch((err) => console.log("error ", err));
      .catch((err) => {
        console.log("error ", err)
        return err
      });
  }

  static async put(url, params = {}, body = {}, accept = "application/json") {
    const paramString = _getParamString(params);
    url =
      Object.keys(params).length > 0
        ? `${BASE}${url}?${paramString}`
        : `${BASE}${url}`;

    return fetch(`${url}`, {
      method: "PUT",
      headers: {
        "Access-Control-Request-Method": "PUT",
        Accept: accept,
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: "Bearer " + getToken(),
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        return accept === "application/json" ? formatResponse(res) : res;
      })
      .catch((err) => {
        console.log("error ", err)
        return err
      });
  }

  static async delete(url, params = {}, accept = "application/json") {
    const paramString = _getParamString(params);
    url =
      Object.keys(params).length > 0
        ? `${BASE}${url}?${paramString}`
        : `${BASE}${url}`;

    return fetch(`${url}`, {
      method: "DELETE",
      headers: {
        "Access-Control-Request-Method": "DELETE",
        Accept: accept,
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: "Bearer " + getToken(),
      },
    })
      .then((res) => {
        return accept === "application/json" ? formatResponse(res) : res;
      })
      .catch((err) => {
        console.log("error ", err)
        return err
      });
  }

  static async post(url, body = {}, contentType = "application/json") {
    let finalBody = "";
    const headers = {
      "Access-Control-Request-Method": "POST",
      Accept: "application/json",
      // "Access-Control-Allow-Origin": "*",
      Authorization: "Bearer " + getToken(),
    };

    if (contentType === "application/x-www-form-urlencoded") {
      for (const field in body) {
        finalBody += field + "=" + body[field] + "&";
      }
      headers["Content-Type"] = contentType;
    } else if (contentType === "application/json") {
      finalBody = JSON.stringify(body);
      headers["Content-Type"] = contentType;
    } else {
      finalBody = body;
    }
    url = BASE + url;
console.log("Url",url, BASE)
    return fetch(url, {
      method: "POST",
      body: finalBody,
      headers: headers,
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.clear();
          window.location.href = "/";
          return;
        }
        return res.json();
      })
      .catch((err) => {
        console.log("Post call error : ", err, err?.TypeError)
        return err
      });
  }
  static async CashFreepost(Curl, body = {}, contentType = "application/json") {
    let finalBody = "";
    const headers = {

      'x-client-secret': "50f91fb0906d0d109467c8cb2a4ec291a64e87c1",
      "x-client-id": "564763ac67eeb752470e086465",
      "x-api-version": '2023-08-01',

      "accept": "application/json",
      "Access-Control-Allow-Origin": "*",


    };

    if (contentType === "application/x-www-form-urlencoded") {
      for (const field in body) {
        finalBody += field + "=" + body[field] + "&";
      }
      headers["Content-Type"] = contentType;
    } else if (contentType === "application/json") {
      finalBody = JSON.stringify(body);
      headers["Content-Type"] = contentType;
    } else {
      finalBody = body;
    }


    return fetch(Curl, {
      method: "POST",
      
      body: finalBody,
      headers: headers,
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.clear();
          window.location.href = "/";
          return;
        }
        return res.json();
      })
      .catch((err) => {
        console.log("Post call error : ", err, err?.TypeError)
        return err
      });
  }
}

export default ApiClient;
