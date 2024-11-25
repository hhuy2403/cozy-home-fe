import axiosClient from "./axiosClient";

const baseApi = {
  // Phương thức GET
  get: async (url, config) => {
    try {
      const response = await axiosClient.get(url, config);
      return response.data;
    } catch (error) {
      return { error: error?.response?.data?.error?.message || "Có lỗi xảy ra" };
    }
  },

  // Phương thức POST
  post: async (url, data, config) => {
    try {
      const response = await axiosClient.post(url, data, config);
      return response.data;
    } catch (error) {
      return { error: error?.response?.data?.error?.message || "Có lỗi xảy ra" };
    }
  },

  // Phương thức PUT
  put: async (url, data, config) => {
    try {
      const response = await axiosClient.put(url, data, config);
      return response.data;
    } catch (error) {
      return { error: error?.response?.data?.error?.message || "Có lỗi xảy ra" };
    }
  },

  // Phương thức DELETE
  delete: async (url, config) => {
    try {
      const response = await axiosClient.delete(url, config);
      return response.data;
    } catch (error) {
      return { error: error?.response?.data?.error?.message || "Có lỗi xảy ra" };
    }
  },
};

export default baseApi;
