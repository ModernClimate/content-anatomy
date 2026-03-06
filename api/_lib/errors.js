export function handleError(res, err) {
  console.error(err)
  const status = err.message === 'Unauthorized' ? 401
    : err.message.startsWith('Forbidden') ? 403
    : 400
  return res.status(status).json({ success: false, error: err.message })
}
