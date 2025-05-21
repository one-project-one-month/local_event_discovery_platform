// successMiddleWare.js
function successHandler(data, message = "Success", status = 200) {
  return {
    data,
    message,
    status,
  };
}

export default successHandler;