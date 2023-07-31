const parser = require('fast-xml-parser');

export async function onRequest(context) {
    console.log(JSON.stringify(context))
    const url = new URL(context.request.url)
    const ticket = url.searchParams.get('ticket')
    if (!ticket) {
        return new Response('Missing ticket.', { status: 500 }) // TODO: more appropriate status
    }
    console.log(ticket)
    const { valid, netid } = await validateCAS(ticket)
    return new Response(resp, { status: 200 })
}


async function validateCAS(ticket) {
    const resp = await fetch(`https://secure.its.yale.edu/cas/serviceValidate?ticket=${ticket}&service=https%3A%2F%2Fapi.actlab.dev%2Fdashboard`)
    const txt = resp.text()
    if (!parser.validate(txt)) {
        return { valid: false, netid: '' }
    }
    const str = parser.parse(txt)
    console.log(JSON.stringify(str))
    return { valid: true, netid: 'foo' }
}
