# OpenAI installation

These steps use the current ChatGPT and Codex plugin surfaces. The repository cannot complete them: they need Ivan's ChatGPT account.

The plugin folder is `plugins/itt-digital-hub`. The repo marketplace is `.agents/plugins/marketplace.json`.

## 1. Developer mode

1. Open ChatGPT.
2. Open Settings.
3. Select Security and login.
4. Turn on Developer mode.

Expected result: ChatGPT Plugins can register an MCP server.

## 2. MCP connection

1. Go to ChatGPT Plugins.
2. Select the plus button.
3. Enter the MCP server URL `https://ittdigitalhub.org/api/mcp/vik`.
4. Leave authentication empty. The server is a public read and calculation endpoint.
5. After ChatGPT creates the connection, copy the technical id from the browser URL. It starts with `plugin_asdk_app`.

Expected result: ChatGPT lists the ViK tools `search_vik_knowledge`, `get_vik_reference`, `list_vik_sources`, and the four calculation tools.

The URL works only after this website deployment is live. A localhost URL is not reachable from ChatGPT.

## 3. Personal plugin

1. Confirm `plugins/itt-digital-hub/.codex-plugin/plugin.json` name is `itt-digital-hub`.
2. Restart the ChatGPT desktop app so it reads `.agents/plugins/marketplace.json`.
3. Open the Plugins Directory.
4. Choose the ITT Digital Hub marketplace.
5. Install ITT Digital Hub.

Expected result: a new chat can use the ВиК Проектант skill and the ViK MCP server.

If the desktop app does not list the repo marketplace, copy the plugin folder to `~/.codex/plugins/itt-digital-hub` and point `~/.agents/plugins/marketplace.json` at that folder with `source.path` `./.codex/plugins/itt-digital-hub`, then restart the desktop app.

## 4. ChatGPT Work test

In a new chat, ask:

`Имам 20 къщи. Каква тръба да сложа за водопровода?`

Expected result: the skill asks for the missing design inputs and does not invent a diameter.

Then ask:

`Коя наредба урежда проектирането на външни водоснабдителни системи и какъв е обхватът ѝ?`

Expected result: an answer that uses `search_vik_knowledge` and names Наредба № РД-02-20-2 от 2024 г.

## 5. Map the registered server

After step 2, create `plugins/itt-digital-hub/.app.json` with the `plugin_asdk_app...` id ChatGPT assigned, and set `extensions.com.openai.apps` in `plugin.json` to `./.app.json`. Also set `.codex-plugin/plugin.json` `apps` to `./.app.json`. Do not invent the id.

## 6. Public submission

Submit the plugin through the OpenAI plugin submission portal. Public listing is shared by ChatGPT and Codex. This repository does not submit it.

There is no terms-of-service URL on the site, so leave `termsOfServiceURL` unset until that page exists. Privacy is `https://ittdigitalhub.org/bg/privacy`.

## 7. Site button

When the published destination exists, set this server environment variable and redeploy the site:

`VIK_CHATGPT_DESTINATION_URL=<the https URL ChatGPT gives you>`

The product page reads that variable. Until it is set, the Open in ChatGPT control stays inactive. Do not put a guessed ChatGPT URL in the repository.
