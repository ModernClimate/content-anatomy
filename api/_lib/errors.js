export function handleError(res, err) {
  console.error('[API Error]', err)
  if (err.response?.data) console.error('[API Error Detail]', JSON.stringify(err.response.data, null, 2))
  const status = err.status || 500
  return res.status(status).json({
    success: false,
    error: err.message || 'Internal server error',
    code: err.code || 'ERROR'
  })
}
