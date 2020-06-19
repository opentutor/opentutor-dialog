export default interface OpenTutorResponse {
  author: string;
  type: string;
  data: TextData | ImageData;
}

interface TextData {
  text: string;
}

interface ImageData {
  url: string;
  path: string;
}

// type OpenTutorResponseData = TextData | ImageData; // look up union types

export function createTextResponse(messages: string[]): OpenTutorResponse[] {
  const response: OpenTutorResponse[] = [];
  messages.forEach(msg => {
    response.push({ author: 'them', type: 'text', data: { text: msg } });
  });
  return response;
}
