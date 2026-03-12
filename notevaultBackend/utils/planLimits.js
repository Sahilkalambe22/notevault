const PLAN_LIMITS = {
  free: {
    notes: 50,
    attachments: 5,
    storage: 100 * 1024 * 1024 // 100MB
  },

  pro: {
    notes: Infinity,
    attachments: 50,
    storage: 5 * 1024 * 1024 * 1024 // 5GB
  }
};

module.exports = PLAN_LIMITS;