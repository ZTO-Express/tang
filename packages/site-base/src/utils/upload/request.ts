export function createXHR() {
  if (window.XMLHttpRequest) {
    return new XMLHttpRequest()
  }
  return new window.ActiveXObject('Microsoft.XMLHTTP')
}

export function request(url: string, options: any) {
  return new Promise((resolve, reject) => {
    let xhr = createXHR()
    xhr.open(options.method, url)

    if (options.onCreate) {
      options.onCreate(xhr)
    }
    if (options.headers) {
      Object.keys(options.headers).forEach((k) => xhr.setRequestHeader(k, options.headers[k]))
    }

    xhr.upload.addEventListener('progress', (evt: any) => {
      if (evt.lengthComputable && options.onProgress) {
        options.onProgress({ loaded: evt.loaded, total: evt.total })
      }
    })

    xhr.onreadystatechange = () => {
      let responseText = xhr.responseText
      if (xhr.readyState !== 4) {
        return
      }
      if (xhr.status !== 200) {
        let message = `xhr request failed, code: ${xhr.status};`
        if (responseText) {
          message = message + ` response: ${responseText}`
        }
        reject({ code: xhr.status, message: message, req: xhr, isRequestError: true })
        return
      }
      if (options.responseType && options.responseType !== 'json') {
        resolve(responseText)
        return
      }
      try {
        resolve({ data: JSON.parse(responseText), req: xhr })
      } catch (err) {
        reject(err)
      }
    }

    xhr.send(options.body)
  })
}
