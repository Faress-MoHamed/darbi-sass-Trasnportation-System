export function successResponse<T>(data: T | null = null, message = "Success") {
  return {
    success: true,
    message,
    data,
  };
}
