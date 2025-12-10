// Get the current tab URL and title, populate the inputs
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0]
  const url = tab?.url || ''
  const title = tab?.title || ''

  const urlInput = document.getElementById('url-input') as HTMLInputElement
  const titleInput = document.getElementById('title-input') as HTMLInputElement

  if (urlInput) {
    urlInput.value = url
  }
  if (titleInput) {
    titleInput.value = title
  }

  // Check if bookmark already exists
  checkBookmarkExists(url)
})

async function checkBookmarkExists(url: string) {
  try {
    const response = await fetch(`http://localhost:8080/bookmarks?url=${encodeURIComponent(url)}`)
    if (!response.ok) {
      console.error('Failed to check bookmark:', response.statusText)
      return
    }

    const bookmarks = await response.json()
    const saveButton = document.querySelector('button') as HTMLButtonElement
    const bookmarkExists = Array.isArray(bookmarks) && bookmarks.length > 0

    // Update icon in background script
    chrome.runtime.sendMessage({ bookmarkExists })

    // If bookmarks array is not empty, bookmark exists
    if (bookmarkExists) {
      if (saveButton) {
        saveButton.disabled = true
        saveButton.classList.add('opacity-50', 'cursor-not-allowed')
        saveButton.textContent = 'Already Saved'
      }
    } else if (saveButton) {
      // Enable click handler only if bookmark doesn't exist
      saveButton.addEventListener('click', saveBookmark)
    }
  } catch (error) {
    console.error('Error checking bookmark:', error)
  }
}

async function saveBookmark() {
  const urlInput = document.getElementById('url-input') as HTMLInputElement
  const titleInput = document.getElementById('title-input') as HTMLInputElement
  const saveButton = document.querySelector('button') as HTMLButtonElement

  const url = urlInput?.value
  const title = titleInput?.value

  if (!url || !title) {
    console.error('URL and title are required')
    return
  }

  try {
    const response = await fetch('http://localhost:8080/bookmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        name: title,
      }),
    })

    if (!response.ok) {
      console.error('Failed to save bookmark:', response.statusText)
      return
    }

    // Update button state after successful save
    saveButton.disabled = true
    saveButton.classList.add('opacity-50', 'cursor-not-allowed')
    saveButton.textContent = 'Already Saved'

    // Notify background script that bookmark was saved
    chrome.runtime.sendMessage({ bookmarkExists: true })
  } catch (error) {
    console.error('Error saving bookmark:', error)
  }
}
