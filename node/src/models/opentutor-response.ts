export default interface OpenTutorResponse {
  author: string;
  type: string;
  data: object;
}

export function createTextResponse(messages: string[]) {
  const response: Array<OpenTutorResponse> = [];
  messages.forEach(msg => {
    response.push({ author: 'them', type: 'text', data: { text: msg } });
  });
  return response;
}
