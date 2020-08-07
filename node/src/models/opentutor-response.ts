export default interface OpenTutorResponse {
  author: string;
  type: string;
  data: TextData | ImageData;
}

export interface TextData {
  text: string;
}

export interface ImageData {
  url: string;
  path: string;
}

export function createTextResponse(
  msg: string,
  type = 'text'
): OpenTutorResponse {
  return { author: 'them', type, data: { text: msg } };
}
