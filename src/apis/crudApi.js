import baseApi from "./baseApi";

const getTokenHeader = ()=> {
  return {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };
};

const crudApi = {
  read: (source, where) => {
    return baseApi.post(`/api/read?source=${source}`, {
      source: source,
      where: where,
    },
    getTokenHeader());
  },
  create: (source, data) => {
    return baseApi.post(`/api/create?source=${source}`, {
      source: source,
      data: data,
    },
    getTokenHeader());
  },
  update: (source, where, data) => {
    return baseApi.post(`/api/update?source=${source}`, {
      source: source,
      where: where,
      data: data,
    },
    getTokenHeader());
  },
  delete: (source, where) => {
    return baseApi.post(`/api/delete?source=${source}`, {
      source: source,
      where: where,
    },
    getTokenHeader());
  },
};

export default crudApi;