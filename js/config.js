/* 將 API 相關的部分資訊制定成變數，統一管理 */
const api_path = 'peihan';
const api_product = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`;
const api_carts = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`;
const api_reseveration = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`;
const api_orders = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`;
const token = 'BqN66ktE83hO8wrvMmM7i57Z0Y93';
const headers = {
  headers: {
    Authorization: token
  }
};