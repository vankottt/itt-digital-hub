import type { L } from "@/lib/i18n";

/**
 * Single installer prompt used by the Build Your Own copy action.
 * Goal 2 replaces these strings with the real INSTALLER_PROMPT.md from the kit.
 * Process instructions only. No legal conclusions.
 */
export const installerPrompt = {
  bg: `Отворете ChatGPT и започнете нов разговор.

Дайте на ChatGPT файловете от комплекта (като прикачени файлове или като съдържание в разговора).

Кажете му да създаде специализиран асистент по AI Act, като следва пакета, а не да импровизира.

Помолете го изрично да използва:
1. SYSTEM_PROMPT.md за поведението
2. AGENT_CONFIG.md за обхвата и ограниченията
3. папката sources за надеждните източници
4. TEST_CASES.md за проверка след създаването

Ако ChatGPT попита кой формат да използва (обикновен чат, проект или друг наличен инструмент), изберете това, което имате в акаунта си. Комплектът не зависи от един конкретен екран.

Не добавяйте правила, които ги няма в комплекта.
Не измисляйте правни задължения.
Ако липсва информация за фирмата, асистентът трябва да попита, преди да даде конкретен съвет.`,
  en: `Open ChatGPT and start a new conversation.

Give ChatGPT the files from the kit (as attachments or as content in the chat).

Tell it to create a specialised AI Act assistant by following the package, not by improvising.

Ask it explicitly to use:
1. SYSTEM_PROMPT.md for behaviour
2. AGENT_CONFIG.md for scope and limits
3. the sources folder for trusted references
4. TEST_CASES.md to check the result after setup

If ChatGPT asks which format to use (a regular chat, a project, or another available tool), choose what your account provides. The kit does not depend on one specific screen.

Do not add rules that are not in the kit.
Do not invent legal duties.
If company context is missing, the assistant should ask before giving specific advice.`,
} satisfies L;
