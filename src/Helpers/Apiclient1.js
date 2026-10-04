const BASE = import.meta.env.VITE_HOTEL_API_BASE_URL;
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

const formatResponse = async (res) => {
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/";
    return;
  }
  if (!res.ok) {
    const contentType = res.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      try {
        return await res.json(); // Return the error JSON so .then() can parse validation errors
      } catch (e) {
        // Ignore JSON parse error and throw the default error
      }
    }
    throw new Error(`HTTP error! Status: ${res.status}`);
  }

  const contentType = res.headers.get("Content-Type");
  if (contentType && contentType.includes("application/json")) {
    try {
      return await res.json(); // Safely parse JSON response
    } catch (error) {
      console.error("Failed to parse JSON:", error);
      throw new Error("Invalid JSON response from server.");
    }
  }
  return null; // Return null for empty or non-JSON responses
};

const getToken = () => {
  let accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    try {
      let parsed = JSON.parse(accessToken);
      if (typeof parsed === "string" && parsed) return parsed;
      if (typeof parsed === "object" && parsed !== null) {
        let t = parsed.tokenId || parsed.token || parsed.accessToken;
        if (t) return t;
      }
      if (parsed) return parsed;
    } catch (e) {
      return accessToken.replace(/^"(.*)"$/, "$1");
    }
  }

  let userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      let userObj = JSON.parse(userStr);
      let t = userObj?.tokenId || userObj?.token || userObj?.accessToken;
      if (t) return t;
    } catch (e) {}
  }

  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3ByaW1hcnlncm91cHNpZCI6IjIifQ.JuOXvhAHDi1GX5ZV8s5naLw5upBOi5sb8_uqB3Lrs90";
};

const getFullUrl = (url) => {
  if (url.startsWith("http") || url.startsWith("/")) {
    return url;
  }
  return `${BASE}${url}`;
};

class Apiclient1 {
  static async get(url, params = {}, accept = "application/json") {
    try {
      const paramString = _getParamString(params);
      const baseUrl = getFullUrl(url);
      const fullUrl =
        Object.keys(params).length > 0 ? `${baseUrl}?${paramString}` : baseUrl;

      const res = await fetch(fullUrl, {
        method: "GET",
        headers: {
          "Access-Control-Request-Method": "GET",
          Accept: accept,
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + getToken(),
        },
      });

      return accept === "application/json" ? formatResponse(res) : res;
    } catch (err) {
      console.log("error ", err);
      return err;
    }
  }

  static async put(url, params = {}, body = {}, accept = "application/json") {
    try {
      const paramString = _getParamString(params);
      const baseUrl = getFullUrl(url);
      const fullUrl =
        Object.keys(params).length > 0 ? `${baseUrl}?${paramString}` : baseUrl;

      const res = await fetch(fullUrl, {
        method: "PUT",
        headers: {
          "Access-Control-Request-Method": "PUT",
          Accept: accept,
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + getToken(),
        },
        body: JSON.stringify(body),
      });

      return accept === "application/json" ? formatResponse(res) : res;
    } catch (err) {
      console.log("error ", err);
      return err;
    }
  }

  static async delete(url, params = {}, accept = "application/json") {
    try {
      const paramString = _getParamString(params);
      const baseUrl = getFullUrl(url);
      const fullUrl =
        Object.keys(params).length > 0 ? `${baseUrl}?${paramString}` : baseUrl;

      const res = await fetch(fullUrl, {
        method: "DELETE",
        headers: {
          "Access-Control-Request-Method": "DELETE",
          Accept: accept,
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + getToken(),
        },
      });

      return accept === "application/json" ? formatResponse(res) : res;
    } catch (err) {
      console.log("error ", err);
      return err;
    }
  }

  static async post(url, body = {}, contentType = "application/json") {
    try {
      let finalBody = "";
      const headers = {
        "Access-Control-Request-Method": "POST",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: "Bearer " + getToken(),
        "Accept-Encoding": "gzip",
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

      const fullUrl = getFullUrl(url);
      const res = await fetch(fullUrl, {
        method: "POST",
        body: finalBody,
        headers: headers,
      });

      return formatResponse(res);
    } catch (err) {
      console.log("Post call error : ", err);
      return err;
    }
  }
}

export default Apiclient1;
