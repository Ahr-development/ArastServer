
 function generateRandomString(length = 6) {
    const chars = '0123456789'; // Possible characters for the string
    let randomString = '';
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      randomString += chars[randomIndex];
    }
  
    return randomString;
  }
  


