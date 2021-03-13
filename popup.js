document.addEventListener("DOMContentLoaded", () => {

  // Gets the active tab.
  const withActiveTab = callback => {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      callback(tabs[0])
    })
  }

  // Gets the host (and tab) of the active tab.
  const withHost = callback => {
    withActiveTab(tab => {
      callback(new URL(tab.url).host, tab)
    })
  }

  // Gets the code (host and tab) from the active tab.
  const withCode = callback => {
    withHost((host, tab) => {
      chrome.storage.sync.get([host], result => {
        if (typeof result === "object") {
          if (Object.keys(result).indexOf(host) !== -1) {
            callback(result[host], host, tab)
          }
        }
      })
    })
  }

  // Sends code to the content script.
  const sendCode = callback => {
    withCode((code, host, tab) => {
      chrome.tabs.sendMessage(tab.id, code)
      callback()
    })
  }

  // Initialize code mirror
  const codemirror = CodeMirror.fromTextArea(document.querySelector("textarea"), {
    lineNumbers: true,
    scrollbarStyle: "overlay",
    tabSize: 2,
    theme: "ayu-dark",
    viewportMargin: 30
  })

  // Listen for change events.
  codemirror.on("change", () => {
    withHost(host => {
      const object = {}
      object[host] = codemirror.getValue()
      chrome.storage.sync.set(object)
    })
  })

  // Load the code from storage and set it to the editor.
  withCode(code => {
    codemirror.setValue(code)
    codemirror.focus()
    codemirror.setCursor(codemirror.lineCount(), 0)
  })

  // Ctrl+S default event is prevented.
  // Ctrl+Enter sends the code to the content script and closes the popup.
  document.body.addEventListener("keydown", event => {
    if (event.ctrlKey) {
      if (event.key === "s") {
        event.preventDefault()
        window.close()
      }
      else if (event.key === "Enter") {
        sendCode(() => window.close())
      }
    }
    else if (event.key === "Escape") {
      window.close()
    }
  })

})