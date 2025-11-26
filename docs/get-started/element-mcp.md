# MCP Server for Element

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
- Access to the API [https://api.siemens.com/llm](https://api.siemens.com) by creating a free token
  at <https://my.siemens.com> with `llm` scope. We use the `embeddings` API. Siemens access is
  required to request a token. We are working on a configurable alternative.
- IDE/Agent/LLM setup of your choice (for example: VS Code, GitHub Copilot, Claude Sonnet 4.5)

### Version selection

We distribute a MCP server package `@siemens/element-mcp` for every `@siemens/element-ng` version.
The version of `@siemens/element-mcp` must match your version of `@siemens/element-ng`. The version
number of the MCP package `@siemens/element-mcp` is a combination of the `@siemens/element-ng`
version and the version of the MCP code.

For example, `@siemens/element-mcp@48.2.0-v.1.4.8` comes with the data of
`@siemens/element-ng@48.2.0` and `v.1.4.8` is the version of the MCP script.

To facilitate the version selection, we use
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

### Upgrading

Simply install the tag for your version and framework again:

```bash
# in project
npm install --save-dev --save-exact @siemens/element-mcp@element48.3.0

# with yarn
yarn add -D --exact @siemens/element-mcp@element48.3.0

# global
npm install -g --save-exact @siemens/element-mcp@element48.3.0
```

## Quick Start

After local project or global package installation, you need to initialize the MCP server and
provide the access token.

1. **Navigate to your project directory**:

   ```bash
   cd your-project
   ```

2. **Run initial setup**:

   ```bash
   npx @siemens/element-mcp init
   ```

   Or if token is already set up:

   ```bash
   npx @siemens/element-mcp setup
   ```

   > Important: Run this command in the root of every project where you want to use the MCP server.

3. **Follow the prompts**:
   - Enter your LLM token from https://my.siemens.com/ (requires 'llm' scope)
   - This token is needed to generate embeddings for semantic search of the documentation. The
     embeddings help find relevant documentation chunks, but the actual LLM (language model) that
     processes your queries and generates responses is provided separately by your AI tool (e.g.,
     GitHub Copilot, Claude, etc.)
   - Choose which tools to configure (VS Code, Cline, Zed, etc.)
   - Optionally set up Element instruction files for AI agents
   - The tool will create MCP configuration files based on your selection, commit the local
     configuration to share it (make sure it is not ignored by `.gitignore`)

4. **Restart your AI tools** (VS Code, Cline, Zed, etc.)
   - Ensure the server is running and trust the MCP server, e.g. click the "Server" icon in the
     Github Copilot Chat panel in VS Code.
   - **For GitHub Copilot in VS Code**: Make sure you are in Agent Mode (not Chat Mode). Use models
     like **Claude Sonnet 4.5**.

5. **Start prompting**:
   - "How do I use the Filtered-Search component from @siemens/element-ng?"
   - "Show me examples of @siemens/charts-ng usage"
   - "Implement a dashboard with different widgets"
   - "Find icons related to AI or machine learning"
   - "Review the texts of this project"

> The MCP server starts automatically when your AI tools need it.

## Setup Options

During `init` or `setup`, select which configuration(s) to create:

- **Local VS Code / GitHub Copilot (Repository)** creates a VS Code MCP configuration file at
  `.vscode/mcp.json` in the current repository
- **Cline Global Settings** updates global Cline MCP configuration
- **VS Code / GitHub Copilot Global Config** writes user-level MCP config
- **Zed Global Settings** configures Zed editor / agent MCP

## AI Agent Instructions (optional)

After MCP configuration, you can set up Element and Angular instruction files so AI agents work more
effectively with your codebase. Do this in each repository where you want instructions.

You have two options:

- **Symbolic link to receive updates**  
  Keeps files synced with the installed package. Requires the package to remain installed and may
  not work on all systems or package managers. The tool can create symlinks automatically;
  otherwise, create links yourself pointing to the installed package's `AGENTS.md` and Element
  instructions.

- **Copy the content** Copy the contents of the package’s `AGENTS.md` into one of the following in
  your repo:
  - `.github/instructions/Element.instructions.md`
  - `AGENTS.md`
  - `.github/copilot-instructions.md`

If you prefer manual copy, open the package’s `AGENTS.md`, then paste it into your chosen file and
commit it. Repeat per repository whenever you want to update the instructions.

## Logging

Per default no logging is performed, but you can enable local-only logging of all search queries and
retrieval results during setup.

### Manually enabling logging

In your MCP configuration add the flag `--log` to log all search queries and retrieval results to
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

To view logs, use the `npx @siemens/element-mcp log` command, select any relevant session and look
at the output or the files copied to your current working directory.

For feedback about the MCP and Agent results, please create an issue at
[https://code.siemens.com/ux/sdl-mcp/issues](https://code.siemens.com/ux/sdl-mcp/issues), share your
information, and include the relevant logs.

## Usage

### Commands

#### Init (First-time setup)

Complete initial setup: configure token and create all MCP configurations.

```bash
npx @siemens/element-mcp init
```

#### Setup (Update configurations)

Create or update MCP configuration files for your tools (uses existing token).

```bash
npx @siemens/element-mcp setup
```

#### Setup Token

Set or update only the LLM token in system keychain.

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

### Connection Issues

- Verify that the MCP server is running (it should start automatically)
- Restart your AI tool after configuration changes
- Verify your LLM token is valid at https://my.siemens.com/

## Manual Configuration

If you prefer to set up the configurations manually, here are the required files and their contents.

### VS Code (.vscode/mcp.json or User/mcp.json)

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

### Cline (Global Cline MCP settings)

```json
{
  "mcpServers": {
    "@siemens/element-mcp": {
      "command": "npx",
      "args": ["@siemens/element-mcp"]
    }
  }
}
```

### Zed (Global Zed settings)

```json
{
  "context_servers": {
    "@siemens/element-mcp": {
      "source": "custom",
      "command": "<path-to-npx, run which/where npx to find>",
      "args": ["@siemens/element-mcp"],
      "env": {}
    }
  }
}
```
