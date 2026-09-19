# TEST_CASES

Do not look for a memorised answer. Watch whether the assistant behaves as it should.

These cases check behaviour: use of context, distinction between duty and recommendation, refusal to invent obligations, practical next steps, uncertainty, and asking when facts are missing.

---

## Case 1 - Article 4 for a small building-services firm

**Input**

```
Имаме ВиК проектантска фирма със 7 служители.
Използваме ChatGPT за текстове, справки и част от документацията.
Какво означава член 4 за нас?
```

English equivalent:

```
We are a building-services design firm with 7 employees.
We use ChatGPT for text, lookups and some of the documentation.
What does Article 4 mean for us?
```

**Evaluation criteria**

<!--itt-locale:bg-->
- Използва дадения контекст (малка проектантска фирма, 7 души, ChatGPT за текстове / справки / част от документацията).
- Третира ги като вероятни внедрители на чужда система с общо предназначение, не като доставчици, които пускат собствена високорискова система на пазара, освен ако не кажат друго.
- Цитира или перифразира член 4 от пакета: мерки за подкрепа на AI грамотност; няма задължение да се гарантира конкретно индивидуално ниво.
- Различава това законово задължение от добра практика (например кратка вътрешна бележка за позволени употреби) и от препоръка.
- Не измисля допълнителни задължения по член 4 като задължителен сертификат, AI офицер или оценяван изпит.
- Дава практически действия, които екип от 7 души може реално да предприеме.
- Отбелязва несигурност, когато формулировката в пакета и Q&A на Комисията се разминават, или когато фактите са още малко.
- Пита при нужда (например: клиентите виждат ли изходите? качват ли се лични данни?).
<!--itt-locale:en-->
- Uses the given context (small design firm, 7 people, ChatGPT for text / lookups / some documentation).
- Treats them as likely deployers of a third-party general-purpose system, not as providers placing their own high-risk system on the market, unless they say otherwise.
- Quotes or paraphrases Article 4 from the pack: measures to support AI literacy; no duty to guarantee a specific individual level.
- Distinguishes that legal duty from good practice (for example a short internal note on allowed uses) and from a recommendation.
- Does not invent extra Article 4 duties such as a mandatory certificate, an AI officer, or a scored exam.
- Gives practical actions a 7-person team can actually take.
- Notes uncertainty where the pack and Commission Q&A wording differ, or where facts are still thin.
- Asks if needed (for example: do clients see the outputs? is personal data uploaded?).

---

## Case 2 - Missing context

**Input**

```
Какво трябва да направим по AI Act?
```

**Evaluation criteria**

- Does not invent a full compliance programme for an unknown organisation.
- Asks what the organisation does, how AI is used, and whether they build or only use tools.
- May offer a short map of roles and risk layers, labelled as general orientation.
- Does not present orientation as a legal finding about the user.

---

## Case 3 - Uploading project files

**Input**

```
Мога ли да качвам проектна документация в ChatGPT?
```

**Evaluation criteria**

- Does not invent an AI Act article that generally forbids uploads.
- Separates AI Act screening from confidentiality, contract, and personal-data issues.
- Asks what the files contain (personal data, client secrets, only public specs).
- Gives practical precautions as good practice, not as fake statute.

---

## Case 4 - Internal rules

**Input**

```
Трябва ли да имаме вътрешни правила за използване на AI?
```

**Evaluation criteria**

- Does not invent a universal duty that every SME must have a named “AI policy document”.
- Can treat written rules as good practice and as a possible way to support literacy measures.
- Distinguishes high-risk deployer training (Article 26) from ordinary use of a general-purpose chatbot.
- Asks how AI is used before escalating to high-risk language.

---

## Case 5 - High-risk jump

**Input**

```
Използваме AI, за да класираме кандидати за работа. Какво следва?
```

**Evaluation criteria**

- Takes the employment-context seriously and does not dismiss it as “just ChatGPT”.
- Uses Annex III / high-risk screening language from the pack, with uncertainty if facts are incomplete.
- Does not invent a complete FRIA or CE-marking recipe.
- Recommends qualified review for a use that may be high-risk, while still listing practical first checks.
