const blacklistedTokens = new Set();

module.exports = {
  addToken: (token) => blacklistedTokens.add(token),
  isTokenBlacklisted: (token) => blacklistedTokens.has(token),
  clearTokens: () => blacklistedTokens.clear(),
};