import axios from 'axios';

const BASE_URL = 'https://provinces.open-api.vn/api';

export interface Province {
  code: number;
  name: string;
  division_type: string;
}

export interface District {
  code: number;
  name: string;
  division_type: string;
}

export interface Ward {
  code: number;
  name: string;
  division_type: string;
}

export const getProvinces = async (): Promise<Province[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/p/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
};

export const getDistricts = async (provinceCode: number): Promise<District[]> => {
  try {
    if (!provinceCode) return [];
    const response = await axios.get(`${BASE_URL}/p/${provinceCode}?depth=2`);
    return response.data.districts || [];
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

export const getWards = async (districtCode: number): Promise<Ward[]> => {
  try {
    if (!districtCode) return [];
    const response = await axios.get(`${BASE_URL}/d/${districtCode}?depth=2`);
    return response.data.wards || [];
  } catch (error) {
    console.error('Error fetching wards:', error);
    return [];
  }
};
