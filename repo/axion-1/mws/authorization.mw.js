// authorization.middleware.js
const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return ResponseHandler.error(res, 'Unauthorized access', 403);
    }
    next();
  };
};
