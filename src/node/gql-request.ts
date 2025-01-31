import { catchError, CommonError, CustomError } from "../types/utils";

import { LOGIN_TOKEN, URL_ENDPOINT } from "../types/constants";

import axios from 'axios';

export async function gqlRequest<Response, Variable extends unknown = any>(query: string, operationName: string, variables: Variable = {} as Variable) {
  return catchError<Response, CustomError>((async () => {
    try {
      const url = URL_ENDPOINT;
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${LOGIN_TOKEN}`
      }
      const payload = {
        query,
        variables,
        operationName,
      }

      const request = await axios.post<Response>(url, payload, {
        headers: headers
      })

      return request.data
    } catch (error: any) {
      throw new CommonError(error.message);
    }
  })());
}
