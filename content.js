(() => {

  const appendScript = code => {

    let script = document.getElementById("script-extension")

    if (script !== null) {
      script.remove()
    }

    if (code.trim().length === 0) {
      return
    }

    script = document.createElement("script")
    script.id = "script-extension"
    script.innerHTML = "\n(() => {\n$\n})()\n".replace("$", code)
    document.body.appendChild(script)

  }

  chrome.runtime.onMessage.addListener(appendScript)

  chrome.storage.sync.get([window.location.host], result => {
    if (typeof result === "object") {
      if (Object.keys(result).indexOf(window.location.host) !== -1) {
        const code = result[window.location.host]
        appendScript(code)
      }
    }
  })

})()