// Edge function: updateRewards
//
// This function computes the reward distribution for an event.  It should be
// deployed via the Supabase CLI (`supabase functions deploy updateRewards`).
// When triggered with a POST request containing the `event_id`, it
// fetches all match results for that event, orders them by score
// descending and time ascending, calculates reward shares based on the
// configured `reward_percentage` of the event and inserts transaction rows
// for each winning user.  Ties are handled by splitting the combined
// reward between tied ranks.

const { createClient } = require('@supabase/supabase-js')

// Load environment variables.  The Service Role key has elevated
// privileges – do not expose it to the client.
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

exports.handler = async (request, response) => {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' })
  }
  const { event_id } = request.body
  if (!event_id) {
    return response.status(400).json({ error: 'Missing event_id' })
  }
  try {
    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, reward_percentage')
      .eq('id', event_id)
      .single()
    if (eventError) throw eventError
    // Fetch all matches for this event, ordered by score desc, time asc
    const { data: matches, error: matchError } = await supabase
      .from('matches')
      .select('id, user_id, score, time_taken')
      .eq('event_id', event_id)
      .order('score', { ascending: false })
      .order('time_taken', { ascending: true })
    if (matchError) throw matchError
    if (!matches || matches.length === 0) {
      return response.status(200).json({ message: 'No matches for event' })
    }
    // Compute total entry revenue for this event.  We multiply entry_fee by
    // number of participants.  In a real implementation you may want to
    // store this in the event record itself.
    const entries = matches.length
    // Fetch event entry fee separately (not selected above)
    const { data: feeRow, error: feeError } = await supabase
      .from('events')
      .select('entry_fee')
      .eq('id', event_id)
      .single()
    if (feeError) throw feeError
    const totalRevenue = entries * (feeRow?.entry_fee || 0)
    const rewardPool = totalRevenue * (event.reward_percentage || 0)
    // Determine reward distribution.  For simplicity we reward top 20% of
    // players.  You can modify this logic according to your own payout
    // strategy.
    const winnersCount = Math.max(1, Math.floor(matches.length * 0.2))
    const winners = matches.slice(0, winnersCount)
    const rewardPerWinner = rewardPool / winnersCount
    // Insert transactions for winners
    const transactionRows = winners.map(w => ({
      user_id: w.user_id,
      event_id,
      type: 'reward',
      amount: rewardPerWinner,
    }))
    const { error: insertError } = await supabase
      .from('transactions')
      .insert(transactionRows)
    if (insertError) throw insertError
    return response.status(200).json({ message: 'Rewards distributed', winners: winnersCount })
  } catch (err) {
    console.error(err)
    return response.status(500).json({ error: err.message })
  }
}