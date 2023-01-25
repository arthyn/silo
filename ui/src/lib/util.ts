export const isDev = import.meta.env.DEV;

export async function runWithAsyncHandling<RunReturn, HandlerReturn>(
  run: () => RunReturn, 
  handler: (error: Error) => HandlerReturn): Promise<RunReturn | HandlerReturn> {
    try {
      return await run();
    } catch (error) {
      return await handler(error as Error);
    }
}