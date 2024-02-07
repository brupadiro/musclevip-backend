const axios = require("axios");
const qs = require("qs");
const XMLSerializer = require('xmlserializer').XMLSerializer;
class AxiosHelper {
  constructor(apiToken, baseUrl, source='Prestashop') {
    var authorizationData = ''
    if(source == 'Prestashop') {
      authorizationData = {
        ws_key:Buffer.from(`${apiToken}`).toString("base64")
      }
    } else {
      authorizationData = `Bearer ${apiToken}`

    }

    this.baseUrl = baseUrl;
    this.authorization = authorizationData
  }

  async getRequest(url, params = {}) {
    const apiUrl = `${this.baseUrl}${url}`;

    this.config = {
      paramsSerializer: function (params) {
        return qs.stringify(params);
      },
      params:{
        ...params,
        ...this.authorization
      },
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
