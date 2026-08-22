import axios from "axios";

const BASE_URL = "https://www.emsifa.com/api-wilayah-indonesia/api";

export interface Region {
  id: string;
  name: string;
}

export const getProvinces = async (): Promise<Region[]> => {
  try {
    const res = await axios.get(`${BASE_URL}/provinces.json`);
    return res.data;
  } catch (error) {
    console.error("Error fetching provinces", error);
    return [];
  }
};

export const getRegencies = async (provinceId: string): Promise<Region[]> => {
  try {
    const res = await axios.get(`${BASE_URL}/regencies/${provinceId}.json`);
    return res.data;
  } catch (error) {
    console.error("Error fetching regencies", error);
    return [];
  }
};

export const getDistricts = async (regencyId: string): Promise<Region[]> => {
  try {
    const res = await axios.get(`${BASE_URL}/districts/${regencyId}.json`);
    return res.data;
  } catch (error) {
    console.error("Error fetching districts", error);
    return [];
  }
};

export const getVillages = async (districtId: string): Promise<Region[]> => {
  try {
    const res = await axios.get(`${BASE_URL}/villages/${districtId}.json`);
    return res.data;
  } catch (error) {
    console.error("Error fetching villages", error);
    return [];
  }
};
