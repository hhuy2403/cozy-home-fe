import axios from "axios";

const baseURL = `https://prepared-breeze-81c4a8dee5.strapiapp.com/admin/content-manager/collection-types`;

const JWT = () => {
    return localStorage.getItem("token");
};

const callApi = async (method, subURL, data = null) => {
  try {
    const config = {
      method,
      url: `${baseURL}/${subURL}`,
      headers: {
        Authorization: `Bearer ${JWT()}`,
        "Content-Type": "application/json",
      },
      data,
    };

    const response = await axios(config);
    console.log(`API ${method.toUpperCase()} Response:`, response.data.results);
    return response.data.results;
  } catch (error) {
    console.error(
      `API ${method.toUpperCase()} Error:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getApi = async (subURL, conditionQuery) => {
  if (conditionQuery) {
    const fieldName = Object.keys(conditionQuery)[0];
    const fieldValue = conditionQuery[fieldName];
    return callApi(
      "get",
      `${subURL}?filters[$and][0][email][$eq]=${fieldValue}`
    );
  }
  return callApi("get", subURL);
};

export const postApi = async (subURL, data) => {
  return callApi("post", subURL, data);
};

export const putApi = async (subURL, data) => {
  return callApi("put", subURL, data);
};

export const deleteApi = async (subURL) => {
  return callApi("delete", subURL);
};
