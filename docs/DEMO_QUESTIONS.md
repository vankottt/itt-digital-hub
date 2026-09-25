# ВиК Проектант — demo questions

Preparation only. These questions are not hardcoded in the product.

## Primary demo questions — 5

### 1

- question: Коя наредба урежда проектирането на външни водоснабдителни системи и какъв е нейният обхват?
- expected main source: Наредба № РД-02-20-2/2024, чл. 1
- expected behavior: names the ordinance and quotes the scope from чл. 1, ал. 1
- demo purpose: show the main external-supply answer
- risk: LOW

### 2

- question: Коя наредба урежда външните водоснабдителни системи?
- expected main source: Наредба № РД-02-20-2/2024, чл. 1
- expected behavior: same ordinance, shorter answer
- demo purpose: suggestion-chip path
- risk: LOW

### 3

- question: Какви са основните правила за присъединяване към ВиК?
- expected main source: Наредба № 4/2004, чл. 1
- expected behavior: names the connections ordinance and its subject, without a fee or a deadline
- demo purpose: second everyday design question
- risk: LOW

### 4

- question: Какво урежда Наредба № 9 за питейната вода?
- expected main source: Наредба № 9/2001, чл. 1
- expected behavior: quality requirements and the purpose in чл. 1
- demo purpose: drinking-water rules
- risk: LOW

### 5

- question: Какъв е обхватът на Наредба РД-02-20-2/2024?
- expected main source: Наредба № РД-02-20-2/2024, чл. 1, ал. 1
- expected behavior: scope of new systems and reconstruction, renewal or major repair
- demo purpose: direct scope question
- risk: LOW

## Safeguard demo questions — 2

### 6

- question: По чл. 107 от Наредба № 4 от 2005 г. за сградни ВиК инсталации, какъв е точният алгебричен вид на формула (7) и кой е численият коефициент в нея?
- expected main source: Наредба № 4/2005, чл. 107, marked missing formula
- expected behavior: refuses the coefficient and says the formula text is not extracted
- demo purpose: show that a missing number is not invented
- risk: MEDIUM

### 7

- question: Какви минимални диаметри и налягания задава БДС EN 806-1 за сградни водопроводни инсталации?
- expected main source: none for the standard values; Наредба № 4/2005 only if it refers to the standard
- expected behavior: says the full standard is not in the base and does not give diameters or pressures
- demo purpose: show the EN/BDS limit
- risk: MEDIUM

## Backup question — 1

### 8

- question: Коя наредба урежда външните водоснабдителни системи?
- expected main source: Наредба № РД-02-20-2/2024
- expected behavior: names that ordinance
- demo purpose: shortest reliable fallback if a longer question stalls
- risk: LOW
