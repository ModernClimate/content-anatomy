export function handleError(res, err) {
  console.error('[API Error]', err)
  const status = err.status || 500
  return res.status(status).json({
    success: false,
    error: err.message || 'Internal server error',
    code: err.code || 'ERROR'
  })
}
