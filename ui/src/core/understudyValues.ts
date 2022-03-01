//in compiled project "valuesProd" will turn into "values"

export const values = {
    backendUrl: "http://localhost:3084"
}

export const valuesProd = {
    backendUrl: window.location.protocol + '//' + window.location.host
}