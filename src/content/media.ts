/**
 * ITT has no campus, news, insights, or hero-video media library.
 * Prefix helpers stay so unused CMS overlays remain type-safe no-ops.
 */

export const DEV_NEWS_FIXTURE_MEDIA_ID_PREFIX = "media-dev-fixture-";

export const ANALYSIS_MEDIA_ID_PREFIX = "media-analysis-";

export const campusPhotos = {} as const;

export type CampusPhotoId = keyof typeof campusPhotos;

export const analysisInsightPhotos = {} as const;

export type AnalysisInsightPhotoId = keyof typeof analysisInsightPhotos;

export const devNewsFixturePhotos = {} as const;

export type DevNewsFixturePhotoId = keyof typeof devNewsFixturePhotos;
