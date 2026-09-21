export const PRIVACY_VERSION = '2026-08-26'

export const ORGANIZATION_TYPES = [
  'Проектант / проектантско бюро',
  'Строителна компания',
  'ВиК оператор',
  'Производител на оборудване',
  'Доставчик / търговец',
  'Инженерна / консултантска компания',
  'Община / публична организация',
  'Университет / научна организация',
  'Друго',
] as const

export const EMPLOYEE_RANGES = [
  '1–10 души',
  '11–50 души',
  '51–250 души',
  'Над 250 души',
  'Публична организация',
  'Предпочитам да не посочвам',
] as const

export const USE_CASES = [
  'Предварителен анализ на територия',
  'Проектиране',
  'Планиране на инфраструктура',
  'Оценка на потенциален проект',
  'Подготовка на оферти',
  'Количествени и предварителни оценки',
  'Продажба на ВиК оборудване',
  'Анализ на потенциални клиенти или пазари',
  'GIS / пространствени анализи',
  'Подготовка на доклади',
  'Друго',
] as const

export const PAIN_POINTS = [
  'Събиране на информация',
  'Проучване на територии и обекти',
  'Анализ на данни',
  'Подготовка на техническа документация',
  'Подготовка на оферти',
  'Количествени сметки',
  'Работа с нормативна документация',
  'Подготовка на доклади',
  'Търсене на проекти и клиенти',
  'Координация между екипи',
  'Обработка на Excel / таблици / документи',
  'Друго',
] as const

export const PROJECT_TIMELINES = [
  'Да, в момента',
  'В следващите 3 месеца',
  'В следващите 6–12 месеца',
  'Засега само разглеждам възможностите',
] as const

export const CONTACT_INTERESTS = [
  'Да, бих искал разговор',
  'Да, но на по-късен етап',
  'Засега не',
] as const

export const TRACKED_EVENT_NAMES = [
  'landing_viewed',
  'registration_started',
  'registration_completed',
  'analysis_started',
  'analysis_completed',
  'second_analysis_started',
  'profile_prompt_viewed',
  'profile_started',
  'profile_completed',
  'return_visit',
  'contact_requested',
  'feature_used',
] as const

export type TrackedEventName = typeof TRACKED_EVENT_NAMES[number]
