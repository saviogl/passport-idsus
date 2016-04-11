exports.redirectUrl = function (params){
  return params.authURL +
  '/oauth/authorize/?state=random_state_string' +
  '&client_id=' + params.clientID +
  '&response_type=code';
};
