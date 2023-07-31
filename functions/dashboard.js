

export async function onRequest(context) {
    const url = new URL(context.headers.get('Referer'))
    const ticket = url.searchParams.get('ticket')
    if (!ticket) {
        return new Response('Missing ticket.', { status: 500 }) // TODO: more appropriate status
    }
    const result = await validateCAS(ticket)
    return new Response(resp, { status: 200 })
}


async function validateCAS(ticket) {
    const resp = await fetch(`https://secure.its.yale.edu/cas/serviceValidate?ticket=${ticket}&service=https%3A%2F%2Fapi.actlab.dev%2Fdashboard`)
        .then(response => response.text())
        .then(str => new window.DOMParser().parseFromString(str, 'text/xml'))
        .then(data => console.log(data))
    return resp
}
