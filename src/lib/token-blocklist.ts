interface TokenBlockList {
  add(jti: string): void;
  has(jti: string): boolean;
}

class InMemoryTokenBlocklist implements TokenBlockList {
  private blockedTokens = new Set<string>();

  add(jti: string): void {
    this.blockedTokens.add(jti);
  }

  has(jti: string): boolean {
    return this.blockedTokens.has(jti);
  }
}

export const tokenBlocklist: TokenBlockList = new InMemoryTokenBlocklist();
