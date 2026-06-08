import HostService from "./host.service";
import { Api } from "@/shared/api";

const EnterpriseService = {
  ...HostService,

  getComplex: async (id: string) => {
    return await Api.get(`/v1/catalog/host/complexes/${id}`);
  },

  updateComplex: async (id: string, data: unknown) => {
    return await Api.put(`/v1/catalog/host/complexes/${id}`, data);
  },

  deleteComplex: async (id: string) => {
    return await Api.delete(`/v1/catalog/host/complexes/${id}`);
  },
};

export default EnterpriseService;
