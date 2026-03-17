Here’s a prompt you can use to generate the code for your decentralized finance simulator:

---

**Prompt for Claude Code:**

Create a decentralized finance (DeFi) simulator MVP that allows users to allocate a treasury into Uniswap V3 liquidity pools. The simulator should focus on three pools: ETH/USDC, BTC/USDC, and SOL/USDC. Fetch data for free from the Coinbase API and simulate fee generation in a linear fashion. The frontend should be built using Tailwind CSS and shadcn/ui, and data should be saved in the browser's memory without a backend.

**Key Features:**

1. **User Interface**: Design an intuitive and user-friendly interface using Tailwind CSS and shadcn/ui.
2. **Data Fetching**: Fetch data from the Coinbase API for ETH/USDC, BTC/USDC, and SOL/USDC pools.
3. **Simulation Logic**: Implement logic to simulate fee generation in a linear fashion.
4. **Educational Content**: Include explanations about liquidity provision (LPing), impermanent loss, and APR.
5. **Data Storage**: Save user data in the browser's memory.

**Technical Requirements:**

- Use Tailwind CSS for styling.
- Use shadcn/ui for UI components.
- Fetch data from the Coinbase API.
- Save data in the browser's memory.

**User Experience:**

- Ensure the interface is intuitive and easy to use.
- Provide clear explanations of key concepts like LPing, impermanent loss, and APR.
- Make sure the simulator is responsive and works well on different devices.

**Data Management:**

- Use browser memory to save user data.
- Ensure data persistence across sessions.

**Example Code Structure:**

`/src   /components     - PoolSelector.jsx     - TreasuryAllocation.jsx     - FeeSimulation.jsx     - EducationalContent.jsx   /pages     - Home.jsx     - Dashboard.jsx   /styles     - tailwind.css   /utils     - api.js (for fetching data from Coinbase API)     - storage.js (for managing browser memory)`

**Example UI Components:**

- A dashboard showing the current allocation of the treasury.
- A pool selector to choose between ETH/USDC, BTC/USDC, and SOL/USDC.
- A section to display simulated fees and APR.
- Educational content explaining LPing, impermanent loss, and APR.

**Example API Endpoints:**

- Fetching data from Coinbase API for ETH/USDC, BTC/USDC, and SOL/USDC.

**Example Data Storage:**

- Use localStorage or sessionStorage to save user data.

**Example Simulation Logic:**

- Implement a linear function to simulate fee generation based on the allocated treasury.

**Example Educational Content:**

- Explanations of LPing, impermanent loss, and APR.
- Visualizations to help users understand these concepts.

**Note:**

- Do not include backend code as this is a frontend-only project.
- Ensure the code is well-commented and easy to understand.

---

This prompt should give Claude Code a clear understanding of what you're looking to achieve and the technologies to use.