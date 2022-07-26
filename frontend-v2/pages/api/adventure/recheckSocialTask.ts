import isEmpty from 'lodash.isempty'
import { fetcher } from '@/utils'
import { CATVENTURE_API_BASE_URL } from '@/utils/constants'

const bearer = `bearer ${process.env.NEXT_CATVENTURE_API_KEY}`

export function callWithRest (payload: any) {
  return fetcher(
    `${CATVENTURE_API_BASE_URL}/social-checkers/${payload.projectSlug}/${payload.taskSlug}/${payload.walletAddress}
  `,
    {
      method: 'GET',
      headers: {
        Authorization: bearer
      }
    }
  )
}

export default async function handler (req, res) {
  if (req.method === 'POST') {
    const payload =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    try {
      const response = await callWithRest(payload)
      const { data, error } = response || {}
      if (isEmpty(error)) {
        res.status(200).json(data)
      } else {
        res.status(500).json(response)
      }
    } catch (err) {
      res.status(500).json({
        err
      })
    }
  }
}
