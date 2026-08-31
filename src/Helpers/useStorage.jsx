import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue, notParse = false) {
  const prefixedKey = key;
  const [value, setValue] = useState(() => {
    const jsonValue = localStorage.getItem(prefixedKey);
    if (notParse) return jsonValue;
    if (jsonValue != null) return JSON.parse(jsonValue);
    if (typeof initialValue === "function") {
      return initialValue();
    } else {
      return initialValue;
    }
  });

  useEffect(() => {
    let data = "";
    if (notParse) {
      data = value;
    } else {
      data = JSON.stringify(value);
    }
    localStorage.setItem(prefixedKey, data);
  }, [prefixedKey, value, notParse]);

  return [value, setValue];
}

export function useSessionStorage(key, initialValue) {
  const prefixedKey = key;
  const [value, setValue] = useState(() => {
    const jsonValue = sessionStorage.getItem(prefixedKey);
    if (jsonValue != null) return JSON.parse(jsonValue);
    if (typeof initialValue === "function") {
      return initialValue();
    } else {
      return initialValue;
    }
  });

  useEffect(() => {
    sessionStorage.setItem(prefixedKey, JSON.stringify(value));
  }, [prefixedKey, value]);

  return [value, setValue];
}
