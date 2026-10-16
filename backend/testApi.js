async function testApi () {
  try {
    console.log('Sending request to API...')
    const response = await fetch('http://localhost:5000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: 'Test User',
        companyName: 'Test Company',
        emailAddress: 'clgggang1221@gmail.com',
        phoneNumber: '1234567890',
        serviceType: 'Express',
        origin: 'Mumbai',
        destination: 'Dubai',
        deadline: 'Tomorrow',
        additionalDetails: 'Test details'
      })
    })
    const data = await response.json()
    console.log('API Response:', data)
  } catch (error) {
    console.error('API Error:', error.message)
  }
}

testApi()
