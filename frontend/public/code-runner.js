// Sandboxed JavaScript Code Runner (Web Worker)
// Executes user code in an isolated context with captured console output.

self.onmessage = function (e) {
  const { code, testCases } = e.data;
  const logs = [];
  const errors = [];

  // Create a fake console that captures output
  const fakeConsole = {
    log: (...args) => logs.push(args.map(stringify).join(' ')),
    error: (...args) => errors.push(args.map(stringify).join(' ')),
    warn: (...args) => logs.push('[warn] ' + args.map(stringify).join(' ')),
    info: (...args) => logs.push(args.map(stringify).join(' ')),
    dir: (...args) => logs.push(stringify(args[0])),
    table: (...args) => logs.push(stringify(args[0])),
  };

  function stringify(val) {
    if (val === undefined) return 'undefined';
    if (val === null) return 'null';
    if (typeof val === 'object') {
      try { return JSON.stringify(val, null, 2); } catch { return String(val); }
    }
    return String(val);
  }

  // Mock Solana objects so common code runs without errors
  class MockConnection {
    constructor(endpoint) { this.endpoint = endpoint; this.rpcEndpoint = endpoint; }
    async getBalance() { return 1500000000; }
    async getAccountInfo() { return { lamports: 1500000000, owner: 'system', data: [], executable: false }; }
    async getSlot() { return 285000000 + Math.floor(Math.random() * 1000); }
    async getBlockHeight() { return 240000000 + Math.floor(Math.random() * 1000); }
    async getLatestBlockhash() { return { blockhash: 'DEMO' + Math.random().toString(36).slice(2, 12), lastValidBlockHeight: 240000000 }; }
    async getMinimumBalanceForRentExemption(size) { return size * 6960 + 890880; }
    async getTokenAccountBalance() { return { value: { amount: '1000000', decimals: 6, uiAmount: 1.0 } }; }
    async confirmTransaction() { return { value: { err: null } }; }
    async sendTransaction() { return 'DEMO_TX_' + Math.random().toString(36).slice(2, 12); }
  }

  class MockPublicKey {
    constructor(key) { this._key = typeof key === 'string' ? key : 'Unknown'; }
    toBase58() { return this._key; }
    toString() { return this._key; }
    toBuffer() { return new Uint8Array(32); }
    equals(other) { return this._key === (other?._key || other); }
    static findProgramAddressSync(seeds, programId) {
      return [new MockPublicKey('PDA_' + Math.random().toString(36).slice(2, 10)), 255];
    }
    static createWithSeed(base, seed, programId) {
      return new MockPublicKey('SEED_' + seed);
    }
  }

  const mockKeypair = {
    generate: () => ({
      publicKey: new MockPublicKey('GEN' + Math.random().toString(36).slice(2, 10)),
      secretKey: new Uint8Array(64),
    }),
  };

  try {
    // Strip ALL import/export statements completely
    let processedCode = code
      .replace(/import\s+\{[^}]*\}\s+from\s+['"][^'"]*['"]\s*;?/g, '// (import handled by sandbox)')
      .replace(/import\s+\*\s+as\s+\w+\s+from\s+['"][^'"]*['"]\s*;?/g, '// (import handled by sandbox)')
      .replace(/import\s+\w+\s+from\s+['"][^'"]*['"]\s*;?/g, '// (import handled by sandbox)')
      .replace(/import\s+['"][^'"]*['"]\s*;?/g, '// (import handled by sandbox)')
      .replace(/export\s+(default\s+)?/g, '');

    // Wrap user code with all mock globals provided via var (allows redeclaration)
    const wrappedCode = `
      var console = __console__;
      var Connection = __Connection__;
      var PublicKey = __PublicKey__;
      var LAMPORTS_PER_SOL = 1000000000;
      var Keypair = __Keypair__;
      var SystemProgram = {
        programId: new __PublicKey__('11111111111111111111111111111111'),
        transfer: function(p) { return { programId: '11111111111111111111111111111111', keys: [], data: new Uint8Array() }; }
      };
      var Transaction = class Transaction {
        constructor() { this.instructions = []; this.feePayer = null; this.recentBlockhash = null; }
        add(ix) { this.instructions.push(ix); return this; }
      };
      var Buffer = {
        from: function(v) { return new Uint8Array(typeof v === 'string' ? Array.from(v).map(function(c) { return c.charCodeAt(0); }) : v); },
        alloc: function(size) { return new Uint8Array(size); }
      };
      var clusterApiUrl = function(cluster) { return 'https://api.' + (cluster || 'devnet') + '.solana.com'; };
      var fetch = function() { return Promise.resolve({ json: function() { return Promise.resolve({}); }, text: function() { return Promise.resolve(''); } }); };

      // --- User Code ---
      ${processedCode}
    `;

    // Execute (no strict mode so var redeclaration is OK)
    const fn = new Function('__console__', '__Connection__', '__PublicKey__', '__Keypair__', wrappedCode);

    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; }, 3000);

    const result = fn(fakeConsole, MockConnection, MockPublicKey, mockKeypair);

    if (result && typeof result.then === 'function') {
      result
        .then(() => {
          clearTimeout(timer);
          if (timedOut) {
            self.postMessage({ logs: ['Execution timed out (3s limit)'], errors: ['Timeout'], testResults: [] });
            return;
          }
          self.postMessage({ logs, errors, testResults: runTests(code, logs, testCases) });
        })
        .catch((err) => {
          clearTimeout(timer);
          errors.push(err.message || String(err));
          self.postMessage({ logs, errors, testResults: runTests(code, logs, testCases) });
        });
    } else {
      clearTimeout(timer);
      if (timedOut) {
        self.postMessage({ logs: ['Execution timed out (3s limit)'], errors: ['Timeout'], testResults: [] });
        return;
      }
      self.postMessage({ logs, errors, testResults: runTests(code, logs, testCases) });
    }
  } catch (err) {
    errors.push(err.message || String(err));
    self.postMessage({ logs, errors, testResults: runTests(code, logs, testCases) });
  }
};

function runTests(code, logs, testCases) {
  if (!testCases || testCases.length === 0) return [];

  const allOutput = logs.join('\n').toLowerCase();
  const codeLower = code.toLowerCase();

  return testCases.map((tc) => {
    const expected = (tc.expectedOutput || '').trim();

    if (!expected) {
      return { name: tc.name, passed: code.trim().length > 20 };
    }

    if (expected.startsWith('REGEX:')) {
      try {
        const regex = new RegExp(expected.slice(6), 'i');
        return { name: tc.name, passed: regex.test(code) || regex.test(allOutput) };
      } catch {
        return { name: tc.name, passed: false };
      }
    }

    // Check pipe-separated patterns against both code and console output
    const patterns = expected.split('|').map((p) => p.trim().toLowerCase());
    const allPresent = patterns.every(
      (p) => codeLower.includes(p) || allOutput.includes(p)
    );

    return { name: tc.name, passed: allPresent };
  });
}
