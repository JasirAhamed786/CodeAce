const axios = require('axios');

(async () => {
  try {
    const res = await axios.post('http://localhost:5001/api/agent/solve', {
      problem: 'Find max in array',
      language: 'javascript'
    }, { timeout: 120000 });
    console.log('STATUS', res.status);
    console.log(res.data);
  } catch (e) {
      console.error('ERROR object:', e);
      if (e.response) {
        console.error('HTTP', e.response.status);
        console.error('RESPONSE DATA:', e.response.data);
      }
      console.error('STACK:', e.stack);
  }
})();
