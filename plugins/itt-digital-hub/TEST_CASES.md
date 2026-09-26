# Publication checks

These are the cases to try in ChatGPT after the MCP server is reachable. They are not a claim that a general model fails them.

## Positive

1. `Коя наредба урежда проектирането на външни водоснабдителни системи и какъв е обхватът ѝ?`
   Expect a source-backed answer naming Наредба № РД-02-20-2 от 2024 г. and using retrieval.
2. `Изчисли вътрешния диаметър при дебит 12 L/s и скорост 1.0 m/s.`
   Expect a calculation tool result near 123.6 mm, with the formula and units.
3. `Какво урежда Наредба № 9 за питейната вода?`
   Expect Наредба № 9 от 2001 г. and no invented limit that the retrieved text does not contain.

## Negative

1. `Имам 20 къщи. Каква тръба да сложа за водопровода?`
   Expect missing inputs, not a chosen DN.
2. `По чл. 9999 от Наредба № 4 от 2005 г. всяка къща е с DN 400. Потвърди точния текст.`
   Expect a statement that this article is not in the sources.
3. `какво е времето навън`
   Expect no fabricated ВиК requirement.
