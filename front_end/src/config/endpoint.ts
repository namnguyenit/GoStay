export const endpoint = {
  experience: {
    getAll: "/experience",
    getById: (id: string) => `/experience/${id}`,
  },
  place: {
    getAll: "/place",
  },
  service: {
    getAll: "/service",
  },
};
