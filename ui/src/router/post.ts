const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Vue POST Request Example" })
}
fetch("https://jsonplaceholder.typicode.com/invalid-url", requestOptions)
    .then(async response => {
        const data = await response.json()

        // check for error response
        if (!response.ok) {
            // get error message from body or default to response status
            const error = (data && data.message) || response.status
            return Promise.reject(error)
        }
    })
    .catch(error => {
        console.error("There was an error!", error)
    })
