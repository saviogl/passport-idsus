exports.redirectUrl = function (params){
  return params.loginURL +
  '/oauth/authorize/?state=random_state_string' +
  '&client_id=' + params.clientID +
  '&response_type=code';
};
