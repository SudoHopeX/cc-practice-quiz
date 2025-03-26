async function sha512(text) {
   const encoder = new TextEncoder();
   const data = encoder.encode(text);
   const hashBuffer = await crypto.subtle.digest('SHA-512', data);
   const hashArray = Array.from(new Uint8Array(hashBuffer));
   return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function processtext(inputText) {
   try {
       const response = await fetch('casual/data.md');
       if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
       }
       const fileHash = await response.text();
       const inputHash = await sha512(inputText);

      
       if (inputHash.trim() === fileHash.trim()) {
           // const response = await fetch('casual/questions2.json');
          const token = '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';
            const url = 'https://raw.githubusercontent.com/sudo-hope0529/cc_pvt_qn/0253e24c5806af0f605163be09e11975c3388cb1/questions2.json';
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${token}`
                }
            });
           if (!response.ok) {
               throw new Error(`HTTP error! status: ${response.status}`);
           }
           const questions = await response.json();
           console.log('You had granted access to special questions');
           return questions;
       } else{
        return [];
       }
   } catch (error) {
       console.error('Error:', error);
   }
}
