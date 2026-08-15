process.env.JWT_SECRET =
  process.env.JWT_SECRET || "jest-test-only-secret-not-used-in-production";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
