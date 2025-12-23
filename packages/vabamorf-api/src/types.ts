export interface AnalyzeRequest {
  text: string;
}

export interface AnalyzeResponse {
  stressedText: string;
  originalText: string;
}

export interface VariantsRequest {
  word: string;
}

export interface MorphologyInfo {
  lemma: string;
  pos: string;
  fs: string;
  stem: string;
  ending: string;
}

export interface Variant {
  text: string;
  description: string;
  morphology: MorphologyInfo;
}

export interface VariantsResponse {
  word: string;
  variants: Variant[];
}

export interface VmetajsonInput {
  params: {
    vmetajson: string[];
  };
  content: string;
}

export interface VmetajsonMrf {
  stem?: string;
  ending?: string;
  pos?: string;
  lemma?: string;
  fs?: string;
}

export interface VmetajsonToken {
  features?: {
    token?: string;
    mrf?: VmetajsonMrf[];
  };
}

export interface VmetajsonResponse {
  annotations?: {
    tokens?: VmetajsonToken[];
  };
}

export interface LambdaResponse {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
}
