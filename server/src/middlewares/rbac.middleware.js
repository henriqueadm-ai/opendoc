/**
 * Middleware factory to guard routes based on user role and plan.
 * Must be used after `requireAuth` so `req.user` is available.
 * 
 * @param {Object} permissions 
 * @param {string[]} [permissions.roles] - Allowed roles (e.g., ['ADMIN', 'COORDINATOR'])
 * @param {string[]} [permissions.plans] - Allowed plans (e.g., ['PRO'])
 */
export function checkPermissions({ roles, plans }) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User context missing' });
    }

    if (roles && roles.length > 0) {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient role' });
      }
    }

    if (plans && plans.length > 0) {
      if (!plans.includes(req.user.plan)) {
        return res.status(403).json({ error: 'Forbidden: Plan restriction' });
      }
    }

    next();
  };
}
