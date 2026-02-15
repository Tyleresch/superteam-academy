// Sandboxed JavaScript Code Runner (Web Worker)
// Executes user code in an isolated context with captured console output.

self.onmessage = function (e) {
  const { code, testCases } = e.data;
  const logs = [];
  const errors = [];

  // Create a fake console that captures output
  const fakeConsole = {
    log: (...args) => logs.push(args.map(String).join(' ')),
    error: (...args) => errors.push(args.map(String).join(' ')),
    warn: (...args) => logs.push('[warn] ' + args.map(String).join(' ')),
    info: (...args) => logs.push(args.map(String).join(' ')),
    dir: (...args) => logs.push(JSON.stringify(args[0], null, 2)),
    table: (...args) => logs.push(JSON.stringify(args[0])),
  };

  // Provide some mock Solana objects so common code doesn't crash
  const mockSolana = {
    Connection: class Connection {
      constructor(endpoint) { this.endpoint = endpoint; }
      async getBalance() { return 1500000000; }
      async getAccountInfo() { return { lamports: 1500000000, owner: 'system', data: [] }; }
      async getSlot() { return 285000000; }
    },
    PublicKey: class PublicKey {
      constructor(key) { this._key = key; }
      toBase58() { return this._key; }
      toString() { return this._key; }
    },
    LAMPORTS_PER_SOL: 1000000000,
    Keypair: {
      generate: () => ({
        publicKey: new (class { toBase58() { return 'GEN' + Math.random().toString(36).slice(2, 10); } })(),
        secretKey: new Uint8Array(64),
      }),
    },
    SystemProgram: {
      programId: { toBase58: () => '11111111111111111111111111111111' },
      transfer: (params) => ({ programId: '11111111111111111111111111111111', keys: [], data: Buffer.from([]) }),
    },
    Transaction: class Transaction {
      constructor() { this.instructions = []; }
      add(ix) { this.instructions.push(ix); return this; }
    },
  };

  try {
    // Strip import/export statements and replace with mock access
    let processedCode = code
      .replace(/import\s+\{([^}]+)\}\s+from\s+['"]@solana\/web3\.js['"]\s*;?/g, (match, imports) => {
        const vars = imports.split(',').map(v => v.trim());
        return vars.map(v => `const ${v} = __solana__.${v};`).join('\n');
      })
      .replace(/import\s+.*?from\s+['"].*?['"]\s*;?/g, '// (import removed for sandbox)')
      .replace(/export\s+(default\s+)?/g, '');

    // Build the sandboxed function
    const wrappedCode = `
      "use strict";
      const console = __console__;
      const { Connection, PublicKey, LAMPORTS_PER_SOL, Keypair, SystemProgram, Transaction } = __solana__;

      // Provide common globals
      const Buffer = { from: (v) => new Uint8Array(typeof v === 'string' ? [...v].map(c => c.charCodeAt(0)) : v) };
      const setTimeout = (fn, ms) => { fn(); };
      const setInterval = () => {};
      const fetch = async () => ({ json: async () => ({}), text: async () => "" });

      ${processedCode}
    `;

    // Execute with timeout protection
    const fn = new Function('__console__', '__solana__', wrappedCode);

    // Set a 3-second timeout
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
    }, 3000);

    const result = fn(fakeConsole, mockSolana);

    // Handle async code (if it returns a promise)
    if (result && typeof result.then === 'function') {
      result
        .then(() => {
          clearTimeout(timer);
          if (timedOut) {
            self.postMessage({ logs: ['Execution timed out (3s limit)'], errors: ['Timeout'], testResults: [] });
            return;
          }
          const testResults = runTests(code, logs, testCases);
          self.postMessage({ logs, errors, testResults });
        })
        .catch((err) => {
          clearTimeout(timer);
          errors.push(err.message || String(err));
          self.postMessage({ logs, errors, testResults: [] });
        });
    } else {
      clearTimeout(timer);
      if (timedOut) {
        self.postMessage({ logs: ['Execution timed out (3s limit)'], errors: ['Timeout'], testResults: [] });
        return;
      }
      const testResults = runTests(code, logs, testCases);
      self.postMessage({ logs, errors, testResults });
    }
  } catch (err) {
    errors.push(err.message || String(err));
    self.postMessage({ logs, errors, testResults: [] });
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

    // Check pipe-separated patterns against both code and output
    const patterns = expected.split('|').map((p) => p.trim().toLowerCase());
    const allPresent = patterns.every(
      (p) => codeLower.includes(p) || allOutput.includes(p)
    );

    return { name: tc.name, passed: allPresent };
  });
}
