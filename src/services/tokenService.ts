import axios from "axios";
import { REFRESH_TOKEN } from "../const/apiUrl/baseUrl";

export const refreshToken = async (
  accessToken: string,
  refreshToken: string
) => {
  const response = await axios.post(REFRESH_TOKEN, {
    accessToken,
    refreshToken,
  });
  return response.data;
};
