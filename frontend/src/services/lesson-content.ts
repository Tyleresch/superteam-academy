// Rich markdown content for each lesson, keyed by lesson ID
// This would come from a CMS in production

export const LESSON_CONTENT: Record<string, string> = {
  // ============================================
  // Solana Fundamentals — Chapter 1
  // ============================================

  'lesson-1-1': `## The Solana Vision

Solana was created to solve the **blockchain trilemma** — achieving decentralization, security, and scalability simultaneously. Founded by Anatoly Yakovenko in 2017, Solana introduced a breakthrough consensus mechanism that enables transaction speeds previously thought impossible on a decentralized network.

### Why Solana Matters

| Feature | Solana | Ethereum | Bitcoin |
|---------|--------|----------|---------|
| TPS (Theoretical) | 65,000 | ~30 | ~7 |
| Block Time | 400ms | 12s | 10min |
| Avg Tx Cost | $0.00025 | $1-50 | $1-20 |
| Consensus | PoH + PoS | PoS | PoW |

### Key Innovations

1. **Proof of History (PoH)** — A cryptographic clock that orders transactions before consensus, eliminating the need for validators to communicate timestamps.

2. **Tower BFT** — An optimized version of PBFT that uses PoH as a reference clock, reducing communication overhead.

3. **Gulf Stream** — Transaction forwarding without mempools. Validators forward transactions to the expected leader before the current slot ends.

4. **Turbine** — Block propagation protocol inspired by BitTorrent. Breaks data into smaller packets for efficient distribution.

> **Fun Fact:** Solana processes more transactions daily than all other Layer 1 blockchains combined. The network has processed over 200 billion transactions since launch.

### The Solana Ecosystem

Solana hosts a thriving ecosystem of:
- **DeFi protocols** (Jupiter, Raydium, Marinade)
- **NFT marketplaces** (Magic Eden, Tensor)
- **Payment systems** (Solana Pay)
- **Infrastructure** (Helius, Triton, GenesysGo)

### Practice

Open the code editor and try connecting to the Solana devnet. What is the current slot number?

\`\`\`typescript
import { Connection } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");
const slot = await connection.getSlot();
console.log("Current slot:", slot);
\`\`\`
`,

  'lesson-1-2': `## Proof of History

Proof of History (PoH) is Solana's most important innovation. It's a **cryptographic clock** that creates a verifiable ordering of events without requiring validators to communicate with each other about time.

### The Problem with Time in Blockchains

In traditional blockchains, validators must agree on the order of transactions. This requires multiple rounds of communication:

1. A validator proposes a block
2. Other validators receive and verify it
3. They vote on whether to accept it
4. The block is finalized after enough votes

This back-and-forth communication is **slow** and limits throughput.

### How PoH Works

PoH uses a sequential SHA-256 hash chain:

\`\`\`
hash(1) = SHA256(initial_value)
hash(2) = SHA256(hash(1))
hash(3) = SHA256(hash(2))
...
hash(n) = SHA256(hash(n-1))
\`\`\`

Each hash depends on the previous one, creating an **unforgeable sequence** that proves time has passed. Events can be inserted into the chain at specific positions, proving they occurred at a particular moment.

> **Key Insight:** PoH is not a consensus mechanism — it's a clock. Solana uses PoH *with* Proof of Stake (Tower BFT) for consensus.

### PoH in Practice

\`\`\`typescript
import { Connection } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");

// Get recent block production info
const perfSamples = await connection.getRecentPerformanceSamples(5);
perfSamples.forEach(sample => {
  console.log(
    \`Slot \${sample.slot}: \${sample.numTransactions} txs in \${sample.samplePeriodSecs}s\`
  );
});
\`\`\`

### Leader Schedule

Solana rotates block producers (leaders) every 4 slots (~1.6 seconds). The schedule is determined ahead of time based on stake weight:

| Slot Range | Leader | Stake Weight |
|-----------|--------|-------------|
| 0-3 | Validator A | 15% |
| 4-7 | Validator B | 12% |
| 8-11 | Validator C | 10% |

This predictability allows transactions to be forwarded directly to the upcoming leader, reducing latency.

### Summary

- PoH creates a cryptographic timestamp for every event
- It eliminates the need for validators to agree on time
- Combined with Tower BFT, it enables 400ms block times
- The leader schedule is deterministic and predictable
`,

  'lesson-1-3': `## Accounts & Programs

This is the most important concept in Solana development. Everything on Solana is an **account**, and programs are **stateless executables** that operate on accounts.

### The Account Model

Every piece of data on Solana lives in an account. An account is like a file in a filesystem:

\`\`\`typescript
interface Account {
  lamports: number;      // Balance (1 SOL = 1,000,000,000 lamports)
  data: Uint8Array;      // Raw bytes — can store anything
  owner: PublicKey;       // The program that controls this account
  executable: boolean;    // Is this account a program?
  rentEpoch: number;      // When rent is next due
}
\`\`\`

### Account Types

| Type | Owner | Executable | Purpose |
|------|-------|-----------|---------|
| System Account | System Program | No | Holds SOL, user wallets |
| Program Account | BPF Loader | Yes | Deployed programs |
| Data Account | Any Program | No | Stores program state |
| Token Account | Token Program | No | Holds SPL tokens |

### Programs are Stateless

Unlike Ethereum smart contracts, Solana programs **don't store state**. They receive accounts as arguments and can read/write to accounts they own.

\`\`\`typescript
// Conceptual view of a Solana instruction
function processInstruction(
  programId: PublicKey,     // The program being called
  accounts: AccountInfo[],  // Accounts passed to the program
  data: Buffer              // Instruction data (parameters)
) {
  // Program reads/writes to the provided accounts
  // But stores nothing internally
}
\`\`\`

> **Pro Tip:** Think of programs as pure functions. Given the same accounts and data, they always produce the same result.

### Reading Account Data

\`\`\`typescript
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");
const pubkey = new PublicKey("11111111111111111111111111111111");

const accountInfo = await connection.getAccountInfo(pubkey);
if (accountInfo) {
  console.log("Balance:", accountInfo.lamports / LAMPORTS_PER_SOL, "SOL");
  console.log("Owner:", accountInfo.owner.toBase58());
  console.log("Data length:", accountInfo.data.length, "bytes");
  console.log("Executable:", accountInfo.executable);
}
\`\`\`

### Program Derived Addresses (PDAs)

PDAs are deterministic addresses derived from a program ID and seeds. They're used to create accounts that only a specific program can control:

\`\`\`typescript
const [pda, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("user-profile"), userPubkey.toBuffer()],
  programId
);
// pda is a unique address derived from the seeds
// Only programId can sign for this address
\`\`\`

### Summary

- Everything on Solana is an account
- Programs are stateless — they operate on accounts passed to them
- Each account has an owner program that controls it
- PDAs create deterministic addresses for program-controlled accounts
`,

  'lesson-1-4': `## Quiz: Solana Basics

Test your understanding of Solana's core concepts. Select the best answer for each question.

### Instructions

Answer the questions below. Each correct answer earns you XP. You need to get at least 3 out of 4 correct to pass this quiz.

> **Tip:** If you're unsure about an answer, review the previous lessons before attempting the quiz.
`,

  // ============================================
  // Solana Fundamentals — Chapter 2
  // ============================================

  'lesson-2-1': `## Setting Up Your Environment

Before you can build on Solana, you need the right tools. This lesson walks you through setting up a complete Solana development environment.

### Required Tools

| Tool | Purpose | Install |
|------|---------|---------|
| Node.js 18+ | JavaScript runtime | \`nvm install 18\` |
| Rust | For on-chain programs | \`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \\| sh\` |
| Solana CLI | Interact with the network | \`sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"\` |
| Anchor | Smart contract framework | \`cargo install --git https://github.com/coral-xyz/anchor avm\` |

### Configuring Solana CLI

\`\`\`bash
# Set to devnet for development
solana config set --url https://api.devnet.solana.com

# Generate a new keypair
solana-keygen new --outfile ~/.config/solana/devnet.json

# Airdrop some SOL for testing
solana airdrop 2

# Check your balance
solana balance
\`\`\`

### Project Structure

A typical Solana dApp has this structure:

\`\`\`
my-solana-dapp/
├── programs/           # On-chain Rust programs
│   └── my-program/
│       ├── Cargo.toml
│       └── src/
│           └── lib.rs
├── app/                # Frontend (Next.js/React)
│   ├── src/
│   └── package.json
├── tests/              # Integration tests
├── Anchor.toml         # Anchor config
└── package.json
\`\`\`

### Your First Connection

\`\`\`typescript
import { Connection, clusterApiUrl } from "@solana/web3.js";

// Connect to devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Get cluster info
const version = await connection.getVersion();
console.log("Solana version:", version["solana-core"]);

const supply = await connection.getSupply();
console.log("Total supply:", supply.value.total / 1e9, "SOL");
\`\`\`

> **Pro Tip:** Always use \`"confirmed"\` commitment level during development. It's a good balance between speed and reliability.
`,

  'lesson-2-2': `## Creating a Wallet

In this challenge, you'll generate your first Solana keypair programmatically using \`@solana/web3.js\`.

### What is a Keypair?

A Solana keypair consists of:
- **Public Key** — Your address on the network (like a bank account number)
- **Secret Key** — Your private key that signs transactions (like your PIN)

### The Challenge

Write a function that generates a new Solana keypair and returns the public key as a base58 string.

> **Hint:** Use \`Keypair.generate()\` from \`@solana/web3.js\` and convert the public key with \`.toBase58()\`.
`,

  'lesson-2-3': `## Sending SOL

In this challenge, you'll create and send a SOL transfer transaction on Solana devnet.

### How Transactions Work

Every Solana transaction contains:
1. **Instructions** — What to do (transfer SOL, call a program, etc.)
2. **Signatures** — Proof that the sender authorized the transaction
3. **Recent Blockhash** — Prevents replay attacks and ensures timeliness

### Transaction Lifecycle

\`\`\`
Create → Sign → Send → Confirm → Finalize
\`\`\`

### The Challenge

Write a function that creates a SOL transfer transaction using \`SystemProgram.transfer\`.

> **Hint:** You'll need \`Connection\`, \`Transaction\`, \`SystemProgram\`, and \`sendAndConfirmTransaction\`.
`,

  // ============================================
  // Solana Fundamentals — Chapter 3
  // ============================================

  'lesson-3-1': `## SPL Token Standard

SPL (Solana Program Library) Tokens are Solana's equivalent of ERC-20 tokens on Ethereum. They enable fungible tokens, stablecoins, governance tokens, and more.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Mint** | The token type (like a currency). Controls supply. |
| **Token Account** | Holds tokens for a specific owner. Each wallet needs one per token. |
| **Associated Token Account (ATA)** | A deterministic token account derived from the owner and mint. |
| **Authority** | Who can mint, freeze, or close accounts. |

### Token Account Structure

\`\`\`typescript
interface TokenAccount {
  mint: PublicKey;        // Which token this account holds
  owner: PublicKey;       // Who owns this token account
  amount: bigint;         // How many tokens
  delegate?: PublicKey;   // Optional: who can spend on behalf
  state: 'initialized' | 'frozen';
}
\`\`\`

### Creating a Token

\`\`\`typescript
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

// Create a new token mint
const mint = await createMint(
  connection,
  payer,           // Who pays for the transaction
  mintAuthority,   // Who can mint new tokens
  freezeAuthority, // Who can freeze accounts (null = nobody)
  9                // Decimals (9 = like SOL)
);

// Create a token account for the recipient
const tokenAccount = await getOrCreateAssociatedTokenAccount(
  connection, payer, mint, recipientPublicKey
);

// Mint 1000 tokens
await mintTo(
  connection, payer, mint, tokenAccount.address, mintAuthority, 1000 * 1e9
);
\`\`\`

> **Pro Tip:** Always use Associated Token Accounts (ATAs). They're deterministic, so you can always find someone's token account given their wallet and the mint.
`,

  'lesson-3-2': `## Token-2022 Extensions

Token-2022 (also called Token Extensions) is the next generation of Solana's token standard. It adds powerful features while maintaining backwards compatibility.

### New Extensions

| Extension | Description | Use Case |
|-----------|-------------|----------|
| **Transfer Fee** | Automatic fee on every transfer | Revenue-generating tokens |
| **Non-Transferable** | Soulbound tokens | XP, credentials, badges |
| **Confidential Transfer** | Encrypted amounts | Privacy tokens |
| **Interest Bearing** | Automatic yield accrual | Savings tokens |
| **Permanent Delegate** | Irrevocable delegation | Regulatory compliance |
| **Transfer Hook** | Custom logic on transfer | Royalties, restrictions |
| **Metadata** | On-token metadata | No separate metadata account needed |

### Soulbound Tokens (Non-Transferable)

This is exactly what Solana Quest uses for XP tokens:

\`\`\`typescript
import { 
  createMint, 
  ExtensionType, 
  getMintLen 
} from "@solana/spl-token";

// Calculate space needed for the mint with extensions
const mintLen = getMintLen([ExtensionType.NonTransferable]);

// The XP token cannot be transferred between wallets
// A learner's balance = their XP
// Level = floor(sqrt(xp / 100))
\`\`\`

> **Key Insight:** Solana Quest uses Token-2022 with the NonTransferable extension for XP. Your XP token balance IS your XP score — it lives on-chain and can't be bought or traded.

### Why Token-2022 Matters

Token-2022 enables use cases that were previously impossible or required complex workarounds:
- **Soulbound credentials** (like our XP system)
- **Automatic royalties** on every transfer
- **Privacy-preserving** token transfers
- **Yield-bearing** tokens without wrapping
`,

  'lesson-3-3': `## Create Your Token

### Boss Battle: Mint Your First SPL Token

This is it — your final challenge in the Solana Fundamentals track. Create and mint your own SPL token on devnet.

### Objectives

1. Create a new token mint on devnet
2. Create an associated token account
3. Mint tokens to your account
4. Verify the token balance

### Tips

- Use the \`@solana/spl-token\` library
- You'll need a funded devnet wallet (use \`solana airdrop 2\`)
- Start with 9 decimals (standard for most tokens)
- Mint at least 1000 tokens

> **Boss Battle Tip:** This challenge combines everything you've learned — connections, keypairs, transactions, and the token program. Take it step by step!
`,

  // ============================================
  // Rust for Solana — Chapter 1
  // ============================================

  'lesson-r1-1': `## Ownership & Borrowing

Rust's ownership system is what makes it perfect for blockchain development — it prevents entire classes of bugs at compile time.

### The Three Rules of Ownership

1. Each value in Rust has exactly **one owner**
2. When the owner goes out of scope, the value is **dropped**
3. Ownership can be **moved** or **borrowed**

\`\`\`rust
fn main() {
    let s1 = String::from("hello");  // s1 owns the string
    let s2 = s1;                      // Ownership MOVES to s2
    // println!("{}", s1);            // ERROR: s1 no longer valid!
    println!("{}", s2);               // Works fine
}
\`\`\`

### Borrowing

Instead of moving ownership, you can **borrow** a reference:

\`\`\`rust
fn calculate_length(s: &String) -> usize {  // Borrows s
    s.len()
}  // s goes out of scope but doesn't drop the value

fn main() {
    let s = String::from("hello");
    let len = calculate_length(&s);  // Pass a reference
    println!("{} has length {}", s, len);  // s is still valid!
}
\`\`\`

> **Why This Matters for Solana:** Ownership ensures that account data can't be accidentally modified by two parts of your program simultaneously. This is critical for financial applications.
`,

  'lesson-r1-2': `## Structs & Enums

Structs and enums are the building blocks of data in Rust and Solana programs.

### Structs

\`\`\`rust
// A learner's on-chain account data
#[derive(Debug)]
struct Learner {
    authority: [u8; 32],     // Wallet public key
    xp: u64,                 // Experience points
    level: u8,               // Current level
    streak_days: u16,        // Consecutive active days
    achievements: [u8; 32],  // 256-bit bitmap for achievements
    enrolled_courses: u8,    // Number of active enrollments
}

impl Learner {
    fn calculate_level(&self) -> u8 {
        ((self.xp as f64 / 100.0).sqrt()) as u8
    }
    
    fn has_achievement(&self, index: u8) -> bool {
        let byte_index = (index / 8) as usize;
        let bit_index = index % 8;
        self.achievements[byte_index] & (1 << bit_index) != 0
    }
}
\`\`\`

### Enums

\`\`\`rust
// Difficulty levels for courses
enum Difficulty {
    Beginner,
    Intermediate,
    Advanced,
    Legendary,
}

// XP rewards based on difficulty
impl Difficulty {
    fn xp_reward(&self) -> u64 {
        match self {
            Difficulty::Beginner => 10,
            Difficulty::Intermediate => 25,
            Difficulty::Advanced => 40,
            Difficulty::Legendary => 50,
        }
    }
}
\`\`\`

> **Solana Pattern:** On-chain account data is always defined as structs. Enums are used for instruction types and error codes.
`,
};

// Fallback content for lessons without specific content
export const DEFAULT_LESSON_CONTENT = `## What You'll Learn

In this lesson, you'll master the core concepts that form the foundation of this topic. By the end, you'll be able to apply these concepts in real-world Solana development.

### Core Concepts

Solana uses a unique **account model** that differs from other blockchains. Every piece of data on Solana is stored in an **account**, and programs (smart contracts) are stateless executables that operate on these accounts.

> **Pro Tip:** Take your time with each concept. The XP is earned through understanding, not speed. Practice each example in the code editor on the right.

### Key Points

- Solana programs are **stateless** — they don't store data themselves
- All data lives in **accounts** that are passed to programs
- Programs are identified by their **Program ID** (a public key)
- Accounts have an **owner** field that determines which program can modify them

### Example

\`\`\`typescript
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection("https://api.devnet.solana.com");
const publicKey = new PublicKey("YOUR_WALLET_ADDRESS");

const balance = await connection.getBalance(publicKey);
console.log(\`Balance: \${balance / LAMPORTS_PER_SOL} SOL\`);
\`\`\`

### Practice

Try modifying the code example in the editor. Experiment with different approaches to deepen your understanding.
`;

export function getLessonContent(lessonId: string): string {
  return LESSON_CONTENT[lessonId] || DEFAULT_LESSON_CONTENT;
}
