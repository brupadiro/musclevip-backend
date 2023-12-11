const axios = require("axios");
const qs = require("qs");
const XMLSerializer = require('xmlserializer').XMLSerializer;
class AxiosHelper {
  constructor(apiToken, baseUrl) {
    this.config = {
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiToken}:`).toString("base64")}`
      },
      
    };
    this.baseUrl = baseUrl;
  }

  async getRequest(url, params = {}) {
    const apiUrl = `${this.baseUrl}${url}`;

    this.config = {
      ...this.config,
      paramsSerializer: function (params) {
        return qs.stringify(params);
      },
      params:params,
    }
    const response = await axios.get(apiUrl, this.config);
    return response;
  }
  async putRequest(url, data = {}) {
    const xmls = new XMLSerializer().serializeToString(data);
    this.config = {
      ...this.config,
      headers: {
        ...this.config.headers,
        'Content-Type': 'application/xml'
      },
    };
    const response = await axios.put(apiUrl, xmls, this.config);
    return response;
  }
}

module.exports = AxiosHelper;
