export interface TranslateResult {
  resultText: string;
  candidateText: string;
  sourceLanguage: string;
  percentage: number;
  isError: boolean;
  errorMessage: string;
  statusText?: string;
}

export interface GoogleTranslateLegacyDict {
  pos: string;
  terms?: string[];
}

export interface GoogleTranslateLegacyResponse {
  src: string;
  ld_result: {
    srclangs_confidences: number[];
  };
  sentences: Array<{
    trans: string;
    orig?: string;
  }>;
  dict?: GoogleTranslateLegacyDict[];
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
