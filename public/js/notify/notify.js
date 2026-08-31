import { notification } from "antd";

const notify = (type, message, description = "") => {
  notification[type]({
    message,
    description,
    placement: "topRight",
    duration: 2
  });
};

export const notifySuccess = (msg, desc = "") =>
  notify("success", msg, desc);

export const notifyError = (msg, desc = "") =>
  notify("error", msg, desc);

export const notifyWarning = (msg, desc = "") =>
  notify("warning", msg, desc);

export const notifyInfo = (msg, desc = "") =>
  notify("info", msg, desc);
