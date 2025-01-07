export async function performanceMiddleware(
  req: Request,
  next: () => Promise<Response>,
) {
  const start = performance.now()
  const response = await next()
  const duration = performance.now() - start

  // 성능 메트릭 기록
  console.log(`${req.method} ${req.url} - ${duration}ms`)

  return response
}
