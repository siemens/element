# MCP server for Element

A Model Context Protocol (MCP) server that provides AI assistants (Agents) with access to
[Siemens Element](https://element.siemens.io) design system and component API documentation through
Retrieval-Augmented Generation (RAG). This enables more accurate and relevant assistance with design
system and component library APIs.

## Usage and use cases

- Local MCP server installation includes all design system documentation, component APIs, examples
  and icon information
- MCP server integration with your AI Agent setup of choice, integrated into your IDE (for example,
  GitHub Copilot Agent integration within VS Code with project-related MCP configuration)
- Use cases include (but are not limited to):
  - Get design system best practice information
  - Export components
  - Review project text according to UX writing guidelines
  - Generate new pages using design system components
  - Add and modify pages

## Installation

### Prerequisites

- Node.js (20+ recommended)
- Create a free token at [https://my.siemens.com](https://my.siemens.com) with `llm` scope to get
  access to the `embeddings` API at
  [https://api.siemens.com/llm](https://api.siemens.com/llm).
  (Currently, Siemens access is required to request a token, but we are working on a configurable alternative for all users.)
- IDE/agent/LLM setup of your choice, e.g. VS Code, GitHub Copilot, Claude Sonnet 4.5, OpenCode
- Use `@siemens/element-mcp` for Element projects.

### Project installation

```bash
npm install --save-dev --save-exact @siemens/element-mcp@element48.2.0

# Or with yarn
yarn add -D --exact @siemens/element-mcp@element48.2.0
```

### Global installation

```bash
npm install -g @siemens/element-mcp@element48.2.0
```

## Quick Start

After successful installation you need to initialize the MCP server and provide the access token:

1. **Navigate to your project directory**:

   ```bash
   cd your-project
   ```

2. **Run initial setup**:

   ```bash
   npx @siemens/element-mcp init
   ```

   Or if the token is already set up:

   ```bash
   npx @siemens/element-mcp setup
   ```

   > Important: Run this command in the root of every project where you want to use the MCP server.

3. **Follow the prompts**:
   - **Token setup**: Enter your LLM token from [https://my.siemens.com/](https://my.siemens.com/) (requires 'llm' scope)
   - **Tool configuration**:
     1. Choose which tools to configure (VS Code, OpenCode, Claude Code, Zed, etc.).
     2. Enable logging of MCP queries and responses (optional)
   - **Agent instructions**:
     1. Setup can add predefined instruction files to your project that guide agents how to develop with Element
     2. Use symlinks/aliases to help keep instruction files updated (optional)
        > This may not work for every package manager or platform (e.g. Windows)
   - Commit the local configuration to share it (make sure it isn't ignored by `.gitignore`).

4. **Restart your AI tools** (VS Code, OpenCode, Claude Code, Zed, etc.)
   - Ensure the server is running and trust the MCP server, e.g., click the "Server" icon in the
     GitHub Copilot Chat panel in VS Code.
   - **For GitHub Copilot in VS Code**: Make sure you are in Agent Mode, not Chat Mode. Use models,
     e.g. **Claude Sonnet 4.5**.

5. **Start prompting**:
   - "How do I use the Filtered-Search component from @siemens/element-ng?"
   - "Show me examples of @siemens/charts-ng usage"
   - "Implement a dashboard with different widgets"
   - "Find icons related to AI or machine learning"
   - "Review the texts of this project"

> The MCP server starts automatically when your AI tools need it.

## Setup options

During `init` or `setup`, select which configuration(s) to create:

- **Local VS Code / GitHub Copilot (repository)** creates a VS Code MCP configuration file at
  `.vscode/mcp.json` in the current repository
- **OpenCode (repository)** creates `opencode.json` in the current repository for OpenCode AI
- **OpenCode global settings** updates global OpenCode configuration (`~/.config/opencode/opencode.json`)
- **Claude Code global settings** updates global Claude Code MCP configuration
- **VS Code / GitHub Copilot global config** writes user-level MCP config
- **Zed global settings** configures Zed editor / agent MCP

## AI agent instructions (optional)

After MCP configuration, set up Element instruction files so AI agents work more effectively with
your codebase. Do this in each repository where you want instructions.

For this, you have two options:

- **Symbolic link to receive updates**  
  Keeps files synced with the installed package. Requires the package to remain installed and may
  not work on all systems or package managers. The tool can create symlinks automatically;
  otherwise, create links yourself pointing to the installed package's `AGENTS.md` and Element
  instructions.

- **Copy the content**
  Copy the contents of the package’s `AGENTS.md` into one of the following files in
  your repo:
  - `.github/instructions/Element.instructions.md`
  - `AGENTS.md`
  - `.github/copilot-instructions.md`

If you prefer manual copy, open the package’s `AGENTS.md`, then paste it into your chosen file and
commit it. Repeat per repository whenever you want to update the instructions.

## Version selection

We distribute an MCP server package `@siemens/element-mcp` for every `@siemens/element-ng` version.
The version of `@siemens/element-mcp` must match your version of `@siemens/element-ng`. The version
number of the MCP package `@siemens/element-mcp` is a combination of the `@siemens/element-ng`
version and the version of the MCP code.

For instance, `@siemens/element-mcp@48.2.0-v.1.4.8` comes with the data of
`@siemens/element-ng@48.2.0` and `v.1.4.8` is the version of the MCP script.

To facilitate version selection, we use
[npm distribution tags](https://docs.npmjs.com/cli/commands/npm-dist-tag) `@element<version>` that
match the version of `@siemens/element-ng`. When using the corresponding distribution tag on
installation, you get the latest version of the MCP package that matches your `@siemens/element-ng`
version and simplifies handling in your `package.json`.

```json
"dependencies": {
    "@siemens/element-ng": "48.2.0",
  },
  "devDependencies": {
    "@siemens/element-mcp": "48.2.0-v.1.4.8",
  }
```

New MCP package versions on the same `element-ng` version are incremented like `48.2.0-v.1.4.9`,
`48.2.0-v.1.4.10`, `48.2.0-v.1.5.0`.

## Upgrading

Simply install the package again with the updated version.

For example, if you want to upgrade from Element 48.2.0 to 48.3.0:

```bash
# in project
npm install --save-dev --save-exact @siemens/element-mcp@element48.3.0

# with yarn
yarn add -D --exact @siemens/element-mcp@element48.3.0

# global
npm install -g --save-exact @siemens/element-mcp@element48.3.0
```

## Logging

By default, the server performs no logging, but you can enable local-only logging of all search queries and
retrieval results during setup.

### Manually enabling logging

In your MCP configuration, add the `--log` flag to log all search queries and retrieval results to
local log files in `~/.element-mcp`.

```json
{
  "servers": {
    "@siemens/element-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["@siemens/element-mcp", "--log"]
    }
  }
}
```

### Viewing and sharing logs

To view logs, use the `npx @siemens/element-mcp log` command.
Select a relevant session and look at the output or the files copied to your current working directory.

To help us improve the MCP agent, please send feedback on your MCP and agent results by creating an issue at
[https://code.siemens.com/ux/sdl-mcp/issues](https://code.siemens.com/ux/sdl-mcp/issues). Share your
details and include the relevant logs.

## Usage

### Commands

#### Init (first-time setup)

Complete initial setup: configure token and create all MCP configurations.

```bash
npx @siemens/element-mcp init
```

#### Setup (update configurations)

Create or update MCP configuration files for your tools (uses existing token).

```bash
npx @siemens/element-mcp setup
```

#### Setup token

Set or update only the LLM token in the system keychain.

This token is used to generate embeddings for a semantic search of the documentation.
These embeddings help find relevant documentation chunks, but your AI tool
(e.g. GitHub Copilot, Claude, etc.) provides the actual LLM (language model)
that processes your queries and generates responses separately.

```bash
npx @siemens/element-mcp setup-token
```

#### Check

Verify your installation and configuration.

```bash
npx @siemens/element-mcp check
```

#### Test

Test the MCP server with a sample query.

```bash
npx @siemens/element-mcp test
```

#### Log

Check your previous MCP retrieval logs (if enabled / not disabled).

```bash
npx @siemens/element-mcp log
```

### Use within WSL (Windows Subsystem for Linux)

If you're using WSL, you need to configure the LLM token using environment variables instead of the
system keychain. Before running any commands, add the following to a `.env` file in the project root
(if you’re using a project installation):

```
SDL_MCP_TOKEN_ENV=true
OPENAI_API_KEY=<your-key-here>
```

Make sure the `.env` file is in your `.gitignore` and cannot be committed.

Alternatively, or if you’re using a global installation, add these to your shell profile
(`~/.zprofile` or `~/.bash_profile`):

```bash
export SDL_MCP_TOKEN_ENV=true
export OPENAI_API_KEY=<your-key-here>
```

### Connection issues

- Verify that the MCP server is running (it should start automatically)
- Restart your AI tool after configuration changes
- Verify your LLM token is valid at [https://my.siemens.com/](https://my.siemens.com/)

## Manual configuration

If you prefer to set up configuration manually, here are the required files and their contents.

### VS Code (.vscode/mcp.json or user/mcp.json)

```json
{
  "servers": {
    "@siemens/element-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["@siemens/element-mcp"]
    }
  }
}
```

### OpenCode (local or global)

For repository-level configuration, create `opencode.json` in your project root:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "element-mcp": {
      "type": "local",
      "command": ["npx", "-y", "@siemens/element-mcp"],
      "enabled": true
    }
  },
  "instructions": ["Element.instructions.md"]
}
```

For global configuration, edit `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "element-mcp": {
      "type": "local",
      "command": ["npx", "-y", "@siemens/element-mcp"],
      "enabled": true
    }
  }
}
```

Learn more about OpenCode configuration at
[https://opencode.ai/docs/config](https://opencode.ai/docs/config).

Learn how to install it
[here](https://code.siemens.com/ai/opencode/#getting-started) or use the script at
[https://open.code.siemens.io](https://open.code.siemens.io).

### Claude Code (global Claude Code MCP settings)

```json
{
  "mcpServers": {
    "@siemens/element-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@siemens/element-mcp"],
      "env": {}
    }
  }
}
```

On Windows, prefer the full path to `npx`, for example:

```json
{
  "mcpServers": {
    "@siemens/element-mcp": {
      "type": "stdio",
      "command": "<path-to-npx, run which/where npx to find>",
      "args": ["-y", "@siemens/element-mcp"],
      "env": {}
    }
  }
}
```

Consider OpenCode as an open alternative

OpenCode is the established open-source alternative to Claude Code. It offers the same feature set,
broader model support, and is often considered more stable. As a proprietary closed-source tool,
Claude Code may not offer the same transparency and data handling guarantees as a fully open
alternative. See the OpenCode docs for setup.

- <https://code.siemens.com/ai/opencode/#getting-started>

### Zed (global Zed settings)

```json
{
  "context_servers": {
    "@siemens/element-mcp": {
      "source": "custom",
      "command": "npx",
      "args": ["@siemens/element-mcp"],
      "env": {}
    }
  }
}
```
