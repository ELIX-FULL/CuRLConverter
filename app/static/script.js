document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const output = document.getElementById('output');
  const convertBtn = document.getElementById('convert-btn');
  const copyBtn = document.getElementById('copy-btn');
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  let currentTab = 'curl';

  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      input.placeholder = `Paste your ${currentTab === 'curl' ? 'cURL command' : 'Fetch request'} here...`;
      output.textContent = '';
    });
  });

  // Convert button click handler
  convertBtn.addEventListener('click', async () => {
    let inputText = input.value.trim();
    if (!inputText) {
      showError('Please enter a request to convert');
      return;
    }

    // Convert multiline string to single line
    inputText = inputText.replace(/\n/g, ' ').replace(/\s+/g, ' ');
    const target = document.querySelector('input[name="library"]:checked').value;
    
    try {
      convertBtn.disabled = true;
      convertBtn.textContent = 'Converting...';

      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          request_type: currentTab,
          target: target,
          data_str: inputText
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      output.textContent = data.request_string;
      hljs.highlightElement(output);
    } catch (error) {
      showError(`Conversion failed: ${error.message}`);
    } finally {
      convertBtn.disabled = false;
      convertBtn.innerHTML = `
        Convert to Python
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14"></path>
          <path d="M12 5l7 7-7 7"></path>
        </svg>
      `;
    }
  });

  // Copy button click handler
  copyBtn.addEventListener('click', () => {
    const code = output.textContent;
    if (code) {
      navigator.clipboard.writeText(code)
        .then(() => {
          const originalText = copyBtn.innerHTML;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.innerHTML = originalText;
          }, 2000);
        })
        .catch(() => showError('Failed to copy code'));
    }
  });

  function showError(message) {
    output.textContent = `Error: ${message}`;
    output.style.color = '#dc2626';
    setTimeout(() => {
      output.style.color = '';
    }, 3000);
  }
});