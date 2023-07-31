const { XMLParser } = require('fast-xml-parser');
const jwt = require('jsonwebtoken')

const valid_users = ['sdm76', 'adf44']

export async function onRequest(context) {
    try {

        const url = new URL(context.request.url)
        const ticket = url.searchParams.get('ticket')
        if (!ticket) {
            return new Response('Missing ticket.', { status: 500 }) // TODO: more appropriate status
        }
        const { valid, netid } = await validateCAS(ticket)

        // secret is stored on the cloudflare pages dashboard
        // check the token with jwt.verify(token, secret, (err, decoded) => {})
        // user-side will send in the authorization header
        const token = jwt.sign({ netid: netid, valid: valid }, context.env.ACTLAB_SECRET, { expiresIn: '4h' })
        return new Response(token, { status: 200, headers: { 'content-type': 'application/jwt' } })
    }
    catch (err) {
        return new Response('Something went wrong', { status: 500 })
    }
}

// references for CAS usage:
// https://gist.github.com/duhaime/eda9506ac67e37b418e59fbb9ed07b8a
// https://github.com/yalecs/bdgate/blob/45b3a917ae7e3df67eabc54138167380ad05e0bf/handlers/main.go#L70
async function validateCAS(ticket) {
    const resp = await fetch(`https://secure.its.yale.edu/cas/serviceValidate?ticket=${ticket}&service=https%3A%2F%2Fapi.actlab.dev%2Fdashboard`)
    const txt = await resp.text()
    const parser = new XMLParser()
    try {
        const str = parser.parse(txt, true)
        const cas = str['cas:serviceResponse']
        if ('cas:authenticationSuccess' in cas && 'cas:user' in cas['cas:authenticationSuccess']) {
            const user = cas['cas:authenticationSuccess']['cas:user']
            return { valid: valid_users.includes(user), netid: user }
        }
        throw new Error('Invalid NetID')
    }
    catch (err) {
        return { valid: false, netid: '' }
    }

}
