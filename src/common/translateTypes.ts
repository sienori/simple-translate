export interface TranslateResult {
  resultText: string;
  candidateText: string;
  sourceLanguage: string;
  percentage: number;
  isError: boolean;
  errorMessage: string;
  statusText?: string;
}

export interface GoogleTranslatePaResponse {
  translation: string;
  sentences: Array<{
    trans: string;
    orig: string;
  }>;
  bilingualDictionary?: Array<{
    pos: string;
    entry: Array<{
      word: string;
      reverseTranslation: string[];
      score?: number;
    }>;
    baseForm: string;
    posEnum: number;
  }>;
  detectedLanguages: {
    srclangs: string[];
    srclangsConfidences: number[];
    extendedSrclangs: string[];
  };
  sourceLanguage: string;
  modelMetadata?: Array<{
    backends: string[];
  }>;
}

export interface DeepLTranslateResponse {
  translations: Array<{
    text: string;
    detected_source_language: string;
  }>;
}

export type FetchResult = Response | { status: number; statusText: string };

export const emptyTranslateResult = (): TranslateResult => ({
  resultText: "",
  candidateText: "",
  sourceLanguage: "",
  percentage: 0,
  isError: false,
  errorMessage: ""
});
