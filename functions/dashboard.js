const { XMLParser } = require('fast-xml-parser');

export async function onRequest(context) {
    const url = new URL(context.request.url)
    const ticket = url.searchParams.get('ticket')
    if (!ticket) {
        return new Response('Missing ticket.', { status: 500 }) // TODO: more appropriate status
    }
    const { valid, netid } = await validateCAS(ticket)
    if (!valid) {
        return new Response('Invalid ticket.', { status: 500 })
    }
    return new Response(netid, { status: 200 })
}


async function validateCAS(ticket) {
    const resp = await fetch(`https://secure.its.yale.edu/cas/serviceValidate?ticket=${ticket}&service=https%3A%2F%2Fapi.actlab.dev%2Fdashboard`)
    const txt = resp.text()
    console.log(txt)
    const parser = new XMLParser()
    try {
        const str = parser.parse(txt, true)
        console.log(JSON.stringify(str))
        return { valid: true, netid: 'foo' }
    }
    catch (err) {
        return { valid: false, netid: '' }
    }

}
