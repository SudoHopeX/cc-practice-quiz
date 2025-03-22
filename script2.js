async function sha512(text) {
   const encoder = new TextEncoder();
   const data = encoder.encode(text);
   const hashBuffer = await crypto.subtle.digest('SHA-512', data);
   const hashArray = Array.from(new Uint8Array(hashBuffer));
   return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function processtext(inputText) {
   try {
       // Fetch the content of data.txt
       const response = await fetch('casual/data.md');
       if (!response.ok) {
           throw new Error(`HTTP error! status: ${response.status}`);
       }
       const fileHash = await response.text();
      console.log(fileHash);
       const inputHash = await sha512(inputText);
      console.log(inputHash)

       // Compare the hashes
       if (inputHash === fileHash) {
          console.log("Hashes Matched");
           // If hashes match, load questionsIsc2.json
           const response = await fetch('casual/questions2.json');
           if (!response.ok) {
               throw new Error(`HTTP error! status: ${response.status}`);
           }
           const questions = await response.json();
           console.log('You had granted access to special questions');
           return questions; // Return the questions data if needed
       } else{
          console.log("Hashes Not Matched");
        return [];
       }
       // If hashes do not match, do nothing
   } catch (error) {
       console.error('Error:', error);
   }
}
