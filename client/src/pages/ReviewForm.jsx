import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { courseCode: '', rating: 5, comment: '' }

export default function ReviewForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    async function loadReview() {
      try {
        const res = await api.get(`/reviews/${id}`)
        const { courseCode, rating, comment } = res.data.review
        setForm({ courseCode, rating, comment })
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load review')
      }
    }
    loadReview()
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value, 10) : value
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (id) {
        await api.patch(`/reviews/${id}`, form)
      } else {
        await api.post('/reviews', form)
      }
      nav('/reviews')
    } catch (err) {
      setError(err.response?.data?.message || 'An unexpected error occurred')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Write'} Review</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Course Code</label>
          <input
            type="text"
            name="courseCode"
            value={form.courseCode}
            onChange={onChange}
            placeholder="e.g. CS101"
            className="input w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rating</label>
          <select
            name="rating"
            value={form.rating}
            onChange={onChange}
            className="input w-full"
            required
          >
            {[5, 4, 3, 2, 1].map(num => (
              <option key={num} value={num}>{num} Stars</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Comment (optional)</label>
          <textarea
            name="comment"
            value={form.comment}
            onChange={onChange}
            placeholder="Share your thoughts..."
            className="input w-full h-32"
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
