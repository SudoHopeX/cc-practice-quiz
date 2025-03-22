async function sha512(text) {
   const encoder = new TextEncoder();
   const data = encoder.encode(text);
   const hashBuffer = await crypto.subtle.digest('SHA-512', data);
   const hashArray = Array.from(new Uint8Array(hashBuffer));
   return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function processtext(inputText) {
   try {
       const response = await fetch('./casual/data.txt');
       if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
       }
       const fileHash = await response.text();
       const inputHash = await sha512(inputText);

       if (inputHash === fileHash) {
           const response = await fetch('./casual/questions2.json');
           if (!response.ok) {
               throw new Error(`HTTP error! status: ${response.status}`);
           }
           const questions = await response.json();
           return questions;
       } else{
        return [];
       }
   } catch (error) {
       console.error('Error');
   }
}
